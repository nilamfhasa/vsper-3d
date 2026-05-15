/* ============================================================
   HOME.JS — Home Page Logic (Visualizer & Builder)
   ============================================================ */

let isBuilderActive = false;
let activeMolKey = "CH4";

function initHome() {
  setupHomeEvents();
  buildMolGrid();
  
  // Initial render with a small delay for container stability
  setTimeout(() => {
    const initMol = MOLECULES[activeMolKey] || Object.values(MOLECULES)[0];
    if (initMol) {
      drawMolecule(initMol);
      updateInfoPanelWith(initMol);
    }
  }, 100);
}

function setupHomeEvents() {
  document.getElementById('btnKatalog')?.addEventListener('click', () => {
    isBuilderActive = false;
    document.getElementById('btnKatalog')?.classList.add('active');
    document.getElementById('btnPeriodik')?.classList.remove('active');
    document.getElementById('molGrid')?.classList.remove('hidden');
    document.getElementById('periodikBuilder')?.classList.add('hidden');
  });

  document.getElementById('btnPeriodik')?.addEventListener('click', () => {
    isBuilderActive = true;
    document.getElementById('btnPeriodik')?.classList.add('active');
    document.getElementById('btnKatalog')?.classList.remove('active');
    document.getElementById('periodikBuilder')?.classList.remove('hidden');
    document.getElementById('molGrid')?.classList.add('hidden');
  });

  document.getElementById('btnClear')?.addEventListener('click', () => clearFormula());
  document.getElementById('btnRender')?.addEventListener('click', () => {
    const data = getMoleculeData(currentFormula);
    if (data) {
      drawMolecule(data);
      updateInfoPanelWith(data);
      showToast('✓ Molekul ditemukan!', false);
    } else {
      showToast('Molekul tidak ditemukan di database', true);
    }
  });

  document.querySelectorAll('.pt-element').forEach(el => {
    el.addEventListener('click', () => {
      const sym = el.getAttribute('data-symbol');
      if (sym) {
        if (isBuilderActive) {
          appendFormula(sym);
        } else {
          renderSingleAtom(sym);
        }
      }
    });
  });

  // Keyboard number input
  window.addEventListener('keydown', (e) => {
    if (isBuilderActive) {
      if (e.key >= '0' && e.key <= '9') {
        appendFormula(e.key);
      }
      if (e.key === 'Backspace') {
        currentFormula = currentFormula.slice(0, -1);
        updateFormulaDisplay();
      }
    }
  });
}

function buildMolGrid() {
  const grid = document.getElementById('molGrid');
  if (!grid) return;
  const list = Object.entries(MOLECULES);
  grid.innerHTML = '';
  list.forEach(([key, m]) => {
    const card = document.createElement('div');
    card.className = 'mol-card' + (key === activeMolKey ? ' active' : '');
    card.innerHTML = `<div class="mol-formula">${m.formula}</div><div class="mol-name">${m.name}</div>`;
    card.addEventListener('click', () => {
      document.querySelectorAll('.mol-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeMolKey = key;
      drawMolecule(m);
      updateInfoPanelWith(m);
    });
    grid.appendChild(card);
  });
}

function updateInfoPanelWith(mol) {
  if (!mol) return;
  document.getElementById('activeMolFormula').textContent = mol.formula;
  document.getElementById('activeMolName').textContent = mol.name;
  document.getElementById('geoName').textContent = mol.geo || '—';
  document.getElementById('geoAxe').textContent = mol.axe ? `Notasi: ${mol.axe}` : '—';
  document.getElementById('statPEI').textContent = mol.pei ?? '—';
  document.getElementById('statPEB').textContent = mol.peb ?? '—';
  document.getElementById('infoDesc').textContent = mol.desc || '';
  const angDiv = document.getElementById('infoAngles');
  if (angDiv && mol.angles) {
    angDiv.innerHTML = mol.angles.map(a =>
      `<div class="angle-row"><span class="angle-label">${a.label}</span><span class="angle-val">${a.val}</span></div>`
    ).join('');
  }
}

function renderSingleAtom(symbol) {
  const color = ELEMENTS_COLOR[symbol] || '#888888';
  const atomData = {
    formula: symbol, name: `Unsur ${symbol}`, geo: 'Atom Tunggal', axe: '—', pei: 0, peb: 0,
    desc: `Representasi 3D dari atom tunggal ${symbol}.`,
    angles: [], atoms: [{ x:0, y:0, z:0, r:0.5, color: color, symbol: symbol }], bonds: []
  };
  drawMolecule(atomData);
  updateInfoPanelWith(atomData);
  showToast(`Visualisasi Atom ${symbol}`, false);
}

function showToast(msg, isError) {
  const overlay = document.getElementById('toastOverlay');
  if (!overlay) return;
  overlay.querySelector('.toast-box').classList.toggle('error', isError);
  overlay.querySelector('.toast-msg').textContent = msg;
  overlay.querySelector('.toast-icon').textContent = isError ? '⚠' : '✓';
  overlay.classList.add('show');
  setTimeout(() => overlay.classList.remove('show'), 3000);
}

window.addEventListener('DOMContentLoaded', () => {
  if (typeof initEngine3D === 'function') initEngine3D();
  initHome();
});
