/* ============================================================
   MOLECULE MAYHEM - The Complete 5-Level Chemistry Platformer
   ============================================================ */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 960;
canvas.height = 480;

// Game State
let gameState = 'START'; 
let currentLevel = 1;
let lastTime = 0;
let frameCount = 0;
let inventory = []; // Array of symbols like ['H', 'H']

// Input
const keys = {};
window.addEventListener('keydown', e => { 
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (k === 'c') player.swapMolecule();
  if (k === 'e') player.usePower();
  if ([' ', 'arrowup', 'arrowdown', 'w', 's'].includes(e.key.toLowerCase())) e.preventDefault();
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// ==========================================
// PLAYER OBJECT
// ==========================================
const player = {
  x: 100, y: 300, w: 24, h: 44,
  vx: 0, vy: 0,
  speed: 5.5, jump: -14.5,
  grounded: false,
  lives: 3,
  invincible: 0,
  
  slots: ['Fe', null],
  activeSlot: 0,
  activeMolecule: 'Fe',
  
  update() {
    if (gameState !== 'PLAYING') return;
    const level = levels[currentLevel];
    if (!level) return;

    // Movement
    if (keys['a'] || keys['arrowleft']) this.vx = -this.speed;
    else if (keys['d'] || keys['arrowright']) this.vx = this.speed;
    else this.vx *= 0.82;

    if ((keys['w'] || keys[' '] || keys['arrowup']) && this.grounded) {
      this.vy = this.jump;
      this.grounded = false;
    }

    // Dynamic Physics
    let gravity = 0.65;
    if (this.activeMolecule === 'CH4') gravity = 0.28;
    if (this.activeMolecule === 'SF6') gravity = 1.4;
    
    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;

    this.grounded = false;
    level.platforms.forEach(p => this.checkCollision(p));

    // Improved Fan Logic (Buffed Level 2)
    if (level.obstacles) {
      level.obstacles.forEach(ob => {
        if (ob.type === 'fan') {
          const dist = this.x - ob.x;
          if (dist > 0 && dist < 700 && this.activeMolecule !== 'SF6') {
            this.vx += (level.wind || -2.5) * (1 - dist/700); // Stronger near fan
          }
        }
      });
    }

    level.obstacles.forEach((ob, i) => {
      if (this.isColliding(ob)) this.handleReaction(ob, i);
    });

    level.items?.forEach((it, i) => {
      if (this.isColliding(it)) this.collectItem(it, i);
    });

    if (this.x < 0) this.x = 0;
    if (this.y > canvas.height + 100) this.die();
    if (this.invincible > 0) this.invincible--;
  },

  isColliding(rect) {
    return this.x < rect.x + rect.w && this.x + this.w > rect.x &&
           this.y < rect.y + rect.h && this.y + this.h > rect.y;
  },

  checkCollision(p) {
    if (this.x < p.x + p.w && this.x + this.w > p.x &&
        this.y + this.h > p.y && this.y + this.h < p.y + p.h + Math.abs(this.vy) + 5) {
      if (this.vy >= 0) {
        this.y = p.y - this.h;
        this.vy = 0;
        this.grounded = true;
      }
    }
  },

  handleReaction(ob, index) {
    const type = this.activeMolecule;
    const obs = levels[currentLevel].obstacles;

    if (type === 'Fe') {
      if (ob.type === 'Cu' || ob.type === 'Au') {
        obs.splice(index, 1);
        spawnParticles(ob.x + ob.w/2, ob.y + ob.h/2, '#b87333');
        showToast(`OXIDIZED: ${ob.label} destroyed!`);
      } else if (ob.type === 'H2O') {
        if (this.invincible <= 0) { this.lives -= 0.5; this.invincible = 60; showToast(`CORROSION! -0.5 HP`, true); }
        this.vx *= 0.45;
      }
    }

    if (type === 'HCl' && (ob.type === 'Fe' || ob.type === 'CaCO3' || ob.type === 'base')) {
      obs.splice(index, 1);
      spawnParticles(ob.x + ob.w/2, ob.y + ob.h/2, '#2ecc71');
      showToast(`NEUTRALIZED: ${ob.label} dissolved!`);
    }

    if (type === 'NH3' && ob.type === 'acid_cloud') {
      obs.splice(index, 1);
      spawnParticles(ob.x + ob.w/2, ob.y + ob.h/2, '#3498db');
      showToast(`GAS REACTION: Acid neutralized!`);
    }
    
    if (ob.type === 'fire' && type !== 'H2O') { if (this.invincible <= 0) this.die(); }
    if (ob.type === 'acid' && type !== 'NH3') { if (this.invincible <= 0) this.die(); }
    if (ob.type === 'finish') winLevel();
  },

  collectItem(it, index) {
    levels[currentLevel].items.splice(index, 1);
    if (it.type === 'atom') {
      inventory.push(it.symbol);
      showToast(`Atom ${it.symbol} acquired!`);
      checkSynthesis();
    } else if (it.type === 'power') {
      player.slots[1] = it.symbol;
      showToast(`Power Acquired: ${it.symbol}!`);
    }
  },

  swapMolecule() {
    if (!this.slots[1]) return;
    this.activeSlot = 1 - this.activeSlot;
    this.activeMolecule = this.slots[this.activeSlot];
    showToast(`TRANSFORM: ${this.activeMolecule}`);
  },

  usePower() {
    if (this.activeMolecule === 'CH4') {
      this.vy = -19;
      spawnParticles(this.x, this.y + this.h, '#00e5cc');
    }
  },

  die() {
    this.lives--;
    if (this.lives <= 0) { gameState = 'LOST'; showOverlay('MISSION FAILED', 'Molecular bonds broken.', 'RETRY'); }
    else { this.x = 100; this.y = 100; this.vy = 0; this.invincible = 90; }
  }
};

// ==========================================
// SYNTHESIS & HUD LOGIC
// ==========================================
function checkSynthesis() {
  const counts = {};
  inventory.forEach(s => counts[s] = (counts[s] || 0) + 1);
  if (counts['H'] >= 2 && counts['O'] >= 1) {
    player.slots[1] = 'H2O';
    inventory = [];
    spawnParticles(player.x, player.y, '#00e5cc');
    showToast("REACTION: H2O Synthesized!");
  }
}

function getInventoryString() {
  if (inventory.length === 0) return "";
  const counts = {};
  inventory.forEach(s => counts[s] = (counts[s] || 0) + 1);
  let str = "";
  Object.keys(counts).sort().forEach(key => {
    str += key + (counts[key] > 1 ? counts[key] : "");
  });
  return str;
}

// ==========================================
// LEVEL DATA
// ==========================================
const levels = {
  1: {
    title: 'The Iron Path', bg: '#05080f',
    platforms: [
      {x:0, y:400, w:3000, h:80}, {x:400, y:280, w:200, h:20}, {x:700, y:180, w:200, h:20},
      {x:1200, y:300, w:300, h:20}, {x:1600, y:200, w:100, h:20}
    ],
    obstacles: [
      {x:500, y:240, w:40, h:40, type:'Cu', label:'Cu (Copper)'},
      {x:800, y:140, w:40, h:40, type:'Au', label:'Au (Gold)'},
      {x:1000, y:360, w:600, h:40, type:'H2O', label:'WATER (Corrosion!)'},
      {x:2400, y:300, w:60, h:100, type:'finish', label:'LEVEL 2'}
    ]
  },
  2: {
    title: 'Density Control', bg: '#080812', wind: -3.2,
    platforms: [
      {x:0, y:400, w:5000, h:80}, {x:300, y:300, w:150, h:20}, {x:600, y:220, w:150, h:20},
      {x:1000, y:320, w:300, h:20}, {x:1500, y:200, w:200, h:20}, {x:2200, y:300, w:400, h:20}
    ],
    obstacles: [
      {x:1100, y:100, w:80, h:300, type:'fan', label:'TURBINE 1'},
      {x:2500, y:100, w:80, h:300, type:'fan', label:'TURBINE 2'},
      {x:4500, y:300, w:60, h:100, type:'finish', label:'LEVEL 3'}
    ],
    items: [
      {x:250, y:260, w:30, h:30, symbol:'CH4', type:'power'},
      {x:1400, y:160, w:30, h:30, symbol:'SF6', type:'power'}
    ]
  },
  3: {
    title: 'pH Balance', bg: '#0f0512',
    platforms: [
      {x:0, y:400, w:5000, h:80}, {x:300, y:300, w:200, h:20}, {x:700, y:200, w:300, h:20},
      {x:1200, y:320, w:200, h:20}, {x:1600, y:220, w:400, h:20}
    ],
    obstacles: [
      {x:1050, y:120, w:30, h:280, type:'base', label:'KOH WALL (Strong Base!)'},
      {x:1400, y:350, w:1000, h:50, type:'acid', label:'ACID LAKE'},
      {x:2000, y:50, w:200, h:150, type:'acid_cloud', label:'CL2 GAS CLOUD'},
      {x:4500, y:300, w:60, h:100, type:'finish', label:'LEVEL 4'}
    ],
    items: [
      {x:400, y:350, w:30, h:30, symbol:'HCl', type:'power'},
      {x:1300, y:280, w:30, h:30, symbol:'NH3', type:'power'}
    ]
  },
  4: {
    title: 'The Synthesis Maze', bg: '#051205',
    platforms: [
      {x:0, y:400, w:5000, h:80},
      {x:200, y:320, w:300, h:20}, {x:600, y:320, w:300, h:20},
      {x:400, y:240, w:300, h:20}, {x:800, y:240, w:400, h:20},
      {x:600, y:150, w:200, h:20}, {x:1100, y:150, w:400, h:20},
      {x:700, y:240, w:20, h:80}, {x:1200, y:150, w:20, h:200}
    ],
    obstacles: [
      {x:1800, y:360, w:2000, h:40, type:'fire', label:'FIRE LAKE'},
      {x:4800, y:300, w:60, h:100, type:'finish', label:'LEVEL 5'}
    ],
    items: [
      {x:300, y:280, w:30, h:30, symbol:'H', type:'atom'},
      {x:1200, y:110, w:30, h:30, symbol:'H', type:'atom'},
      {x:650, y:110, w:30, h:30, symbol:'O', type:'atom'}
    ]
  },
  5: {
    title: 'Molecular Chaos', bg: '#101010',
    platforms: [{x:0, y:400, w:3000, h:80}],
    obstacles: [
      {x:1500, y:100, w:150, h:300, type:'unobtanium', label:'END DENSITY'},
      {x:2600, y:300, w:60, h:100, type:'finish', label:'VICTORY!'}
    ]
  }
};

// ==========================================
// RENDER LOOP
// ==========================================
function gameLoop(timestamp) {
  if (gameState === 'PLAYING') {
    player.update();
    frameCount++;
    
    ctx.fillStyle = levels[currentLevel].bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-player.x + 300, 0);

    // Platforms
    levels[currentLevel].platforms.forEach(p => {
      const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      grad.addColorStop(0, '#1a2640'); grad.addColorStop(1, '#05080f');
      ctx.fillStyle = grad; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = 'rgba(0, 229, 204, 0.4)'; ctx.lineWidth = 1; ctx.strokeRect(p.x, p.y, p.w, p.h);
    });
    
    // Obstacles
    levels[currentLevel].obstacles.forEach(ob => {
      if (ob.type === 'H2O') ctx.fillStyle = 'rgba(0,229,204,0.6)';
      else if (ob.type === 'Cu') ctx.fillStyle = '#b87333';
      else if (ob.type === 'Au') ctx.fillStyle = '#ffd700';
      else if (ob.type === 'fan') ctx.fillStyle = '#95a5a6';
      else if (ob.type === 'fire') ctx.fillStyle = '#ff4757';
      else if (ob.type === 'acid') ctx.fillStyle = '#8e44ad';
      else if (ob.type === 'acid_cloud') ctx.fillStyle = 'rgba(142, 68, 173, 0.4)';
      else if (ob.type === 'base') ctx.fillStyle = '#2980b9';
      else ctx.fillStyle = '#2c3e50';
      
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      const tw = ctx.measureText(ob.label).width;
      ctx.fillRect(ob.x, ob.y - 32, tw + 12, 24);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Space Mono';
      ctx.fillText(ob.label, ob.x + 6, ob.y - 15);
    });

    // Items
    levels[currentLevel].items?.forEach(it => {
      ctx.shadowBlur = 15; ctx.shadowColor = '#f1c40f';
      ctx.fillStyle = it.type === 'atom' ? '#f1c40f' : '#3498db';
      ctx.beginPath(); ctx.arc(it.x+15, it.y+15, 12, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#000'; ctx.font = 'bold 12px Space Mono';
      ctx.fillText(it.symbol, it.x+8, it.y+20);
    });

    drawStickman(player.x + player.w/2, player.y, player.activeMolecule);
    drawFloatingFormula(player.x + player.w/2, player.y - 15);

    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      if (p.life <= 0) particles.splice(i, 1);
      ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.restore();
    updateHUD();
  }
  requestAnimationFrame(gameLoop);
}

function drawFloatingFormula(x, y) {
  const formula = getInventoryString();
  if (!formula) return;
  ctx.fillStyle = '#00e5cc'; ctx.font = 'bold 16px Space Mono';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 10; ctx.shadowColor = '#00e5cc';
  ctx.fillText(formula, x, y);
  ctx.shadowBlur = 0; ctx.textAlign = 'start';
}

function drawStickman(x, y, type) {
  let color = '#fff';
  if (type === 'Fe') color = '#95a5a6';
  if (type === 'H2O') color = '#00e5cc';
  if (type === 'CH4') color = '#2ecc71';
  if (type === 'SF6') color = '#e74c3c';
  if (type === 'HCl') color = '#f1c40f';
  if (type === 'NH3') color = '#3498db';
  if (player.invincible % 10 > 5) ctx.globalAlpha = 0.3;
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.shadowBlur = 15; ctx.shadowColor = color;
  ctx.beginPath(); ctx.arc(x, y+8, 8, 0, Math.PI*2);
  ctx.moveTo(x, y+16); ctx.lineTo(x, y+32);
  ctx.moveTo(x, y+22); ctx.lineTo(x-12, y+28); ctx.moveTo(x, y+22); ctx.lineTo(x+12, y+28);
  ctx.moveTo(x, y+32); ctx.lineTo(x-10, y+44); ctx.moveTo(x, y+32); ctx.lineTo(x+10, y+44);
  ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
}

function updateHUD() {
  document.getElementById('gameLevel').textContent = currentLevel;
  document.getElementById('activeMoleculeDisplay').textContent = player.activeMolecule || 'Standard';
  document.getElementById('hpDisplay').textContent = '❤️ '.repeat(Math.ceil(player.lives));
  document.getElementById('slot1').textContent = player.slots[0] || 'Empty';
  document.getElementById('slot2').textContent = player.slots[1] || 'Empty';
  document.getElementById('slot1').classList.toggle('active', player.activeSlot === 0);
  document.getElementById('slot2').classList.toggle('active', player.activeSlot === 1);
  document.getElementById('atomCount').textContent = inventory.length;
}

function showOverlay(title, msg, btnText) {
  const o = document.getElementById('gameOverlay');
  document.getElementById('overlayTitle').textContent = title;
  document.getElementById('overlayMsg').textContent = msg;
  document.getElementById('btnAction').textContent = btnText;
  o.classList.remove('hidden');
}
function hideOverlay() { document.getElementById('gameOverlay').classList.add('hidden'); }
function winLevel() { gameState = 'WON'; showOverlay('MISSION COMPLETE', `Level ${currentLevel} Selesai!`, 'NEXT LEVEL'); }
document.getElementById('btnAction').addEventListener('click', () => {
  if (gameState === 'START' || gameState === 'LOST') startLevel(1);
  else if (gameState === 'WON') startLevel(currentLevel + 1);
});
function showToast(msg) {
  const t = document.getElementById('toastOverlay'); if (!t) return;
  t.querySelector('.toast-msg').textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
let particles = [];
function spawnParticles(x, y, color) {
  for (let i = 0; i < 15; i++) particles.push({ x, y, vx:(Math.random()-0.5)*8, vy:(Math.random()-0.5)*8, life:1.0, color });
}

function startLevel(lvl) {
  currentLevel = lvl;
  const l = levels[lvl];
  if (!l) { showOverlay('THE END', 'Master of Molecules!', 'RESET'); currentLevel = 1; return; }
  player.x = 100; player.y = 100; player.vy = 0; player.lives = 3; inventory = [];
  if (lvl === 1) { player.activeMolecule = 'Fe'; player.slots = ['Fe', null]; }
  else if (lvl === 2) { player.activeMolecule = 'Standard'; player.slots = ['Standard', null]; }
  else if (lvl === 3) { player.activeMolecule = 'Standard'; player.slots = ['Standard', null]; }
  else if (lvl === 4) { player.activeMolecule = 'Standard'; player.slots = ['Standard', null]; }
  gameState = 'PLAYING'; hideOverlay();
}

window.addEventListener('load', () => {
  showOverlay('MOLECULE MAYHEM', 'Kendalikan Stickman Kimia. Gunakan [W/A/D], [C] Swap, [E] Power.', 'MULAI');
  requestAnimationFrame(gameLoop);
});
