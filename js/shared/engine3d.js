/* ============================================================
   ENGINE3D.JS — Three.js 3D Renderer
   Per gemini.md TAHAP 3
   ============================================================ */

let scene, camera, renderer, molGroup;
let autoRotate = true;

// Quiz global vars
let qScene, qCamera, qRenderer, qMolGroup;
let lastInteractTime = 0;

function initEngine3D() {
  const container = document.getElementById('viewerCanvas');
  if (!container) return;
  
  // Setup Scene
  scene = new THREE.Scene();

  // Setup Camera
  camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 6);

  // Setup Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cursor = 'grab';

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0x00e5cc, 0.3);
  dirLight2.position.set(-3, -2, -4);
  scene.add(dirLight2);

  // Molecule Group
  molGroup = new THREE.Group();
  scene.add(molGroup);

  // Mouse Interaction
  let isDragging = false, prevX = 0, prevY = 0;

  renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    autoRotate = false;
    prevX = e.clientX;
    prevY = e.clientY;
    renderer.domElement.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', () => {
    isDragging = false;
    renderer.domElement.style.cursor = 'grab';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    molGroup.rotation.y += dx * 0.01;
    molGroup.rotation.x += dy * 0.01;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  // Touch support
  renderer.domElement.addEventListener('touchstart', (e) => {
    isDragging = true;
    autoRotate = false;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - prevX;
    const dy = e.touches[0].clientY - prevY;
    molGroup.rotation.y += dx * 0.01;
    molGroup.rotation.x += dy * 0.01;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  });

  // Zoom with two fingers (Trackpad / Pinch)
  renderer.domElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    // In trackpads, ctrlKey + wheel is often used for pinch
    // We'll use deltaY as a proxy for zoom intensity
    const zoomSpeed = 0.005;
    camera.position.z = Math.max(3, Math.min(15, camera.position.z + e.deltaY * zoomSpeed));
    autoRotate = false;
    lastInteractTime = Date.now();
  }, { passive: false });

  // Window resize
  window.addEventListener('resize', () => {
    if (container) {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    
    if (qRenderer && document.getElementById('quizViewer')) {
      const qw = document.getElementById('quizViewer').clientWidth;
      const qh = document.getElementById('quizViewer').clientHeight;
      qCamera.aspect = qw / qh;
      qCamera.updateProjectionMatrix();
      qRenderer.setSize(qw, qh);
    }
  });

  // Quiz Init (Minimal)
  initQuizEngine();

  function animate() {
    requestAnimationFrame(animate);
    const now = Date.now();
    
    // Rotate Main
    if (molGroup && (autoRotate || (now - lastInteractTime > 3000))) {
      molGroup.rotation.y += 0.005;
    }
    
    // Rotate Quiz
    if (qMolGroup) {
      qMolGroup.rotation.y += 0.005;
    }
    
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
    
    if (qRenderer && qScene && qCamera) {
      qRenderer.render(qScene, qCamera);
    }
  }
  animate();

  if (container) {
    const recordInteract = () => { lastInteractTime = Date.now(); };
    renderer.domElement.addEventListener('mousedown', recordInteract);
    renderer.domElement.addEventListener('mousemove', (e) => { if (isDragging) recordInteract(); });
    renderer.domElement.addEventListener('touchstart', recordInteract);
  }
}

// Auto-call for pages that only have quizViewer
window.addEventListener('load', () => {
  if (document.getElementById('quizViewer') && !document.getElementById('viewerCanvas')) {
    initQuizEngine();
    // Start a dedicated quiz animation loop
    function animateQuiz() {
      requestAnimationFrame(animateQuiz);
      if (qMolGroup) qMolGroup.rotation.y += 0.005;
      if (qRenderer && qScene && qCamera) qRenderer.render(qScene, qCamera);
    }
    animateQuiz();
  }
});

function initQuizEngine() {
  const container = document.getElementById('quizViewer');
  if (!container || qRenderer) return; 
  
  // Use a fallback if width is 0 (container hidden)
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 300;
  
  qScene = new THREE.Scene();
  qCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  qCamera.position.set(0, 0, 5);
  
  qRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  qRenderer.setSize(width, height);
  qRenderer.setPixelRatio(window.devicePixelRatio);
  qRenderer.setClearColor(0x000000, 0);
  container.appendChild(qRenderer.domElement);
  
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  qScene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(5, 5, 5);
  qScene.add(dir);
  
  qMolGroup = new THREE.Group();
  qScene.add(qMolGroup);
}

// Function to manually refresh quiz renderer size
function refreshQuizSize() {
  const container = document.getElementById('quizViewer');
  if (!container || !qRenderer) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  if (w > 0 && h > 0) {
    qCamera.aspect = w / h;
    qCamera.updateProjectionMatrix();
    qRenderer.setSize(w, h);
  }
}

function drawQuizMolecule(moleculeData) {
  if (!qMolGroup) initQuizEngine();
  refreshQuizSize(); // Always refresh to be safe
  if (!qMolGroup) return;
  // Clear
  while (qMolGroup.children.length > 0) {
    const child = qMolGroup.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
    qMolGroup.remove(child);
  }
  
  if (!moleculeData) return;
  qMolGroup.rotation.set(0.3, 0, 0);

  // Atoms
  moleculeData.atoms.forEach((atom) => {
    const r = atom.r || 0.3;
    const geo = new THREE.SphereGeometry(r * 1.1, 24, 24);
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(atom.color || '#fff'), roughness: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(atom.x || 0, atom.y || 0, atom.z || 0);
    qMolGroup.add(mesh);

    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(atom.symbol || '?', 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.position.set(atom.x || 0, atom.y || 0, atom.z || 0);
    sprite.scale.set(0.4, 0.4, 0.4);
    qMolGroup.add(sprite);
  });

  // Bonds
  if (moleculeData.bonds) {
    moleculeData.bonds.forEach(([ai, bi]) => {
      const a = moleculeData.atoms[ai], b = moleculeData.atoms[bi];
      if (!a || !b) return;
      const start = new THREE.Vector3(a.x, a.y, a.z), end = new THREE.Vector3(b.x, b.y, b.z);
      const length = start.distanceTo(end);
      const geo = new THREE.CylinderGeometry(0.05, 0.05, length, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(end, start).normalize());
      qMolGroup.add(mesh);
    });
  }

  // PEB
  if (moleculeData.peb > 0) {
    const lpPositions = moleculeData.lonePairs || [];
    const positions = lpPositions.length > 0 ? lpPositions : generateLonePairPositions(moleculeData);
    positions.forEach((lp) => {
      const geo = new THREE.SphereGeometry(0.3, 16, 16);
      geo.scale(1, 1.2, 1);
      const mat = new THREE.MeshStandardMaterial({ color: 0x00e5cc, transparent: true, opacity: 0.25 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(lp.x, lp.y, lp.z);
      qMolGroup.add(mesh);
    });
  }
}

function drawMolecule(moleculeData) {
  // Clear scene group
  while (molGroup.children.length > 0) {
    const child = molGroup.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
    molGroup.remove(child);
  }

  // Reset rotation
  molGroup.rotation.set(0.3, 0, 0);
  autoRotate = true;

  if (!moleculeData) return;

  // Draw Atoms
  moleculeData.atoms.forEach((atom) => {
    const geo = new THREE.SphereGeometry(atom.r * 1.2, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(atom.color),
      roughness: 0.3,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(atom.x, atom.y, atom.z);
    molGroup.add(mesh);

    // Atom label using sprite
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(atom.symbol, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(atom.x, atom.y, atom.z);
    sprite.scale.set(0.5, 0.5, 0.5);
    molGroup.add(sprite);
  });

  // Draw Bonds
  moleculeData.bonds.forEach(([ai, bi]) => {
    const a = moleculeData.atoms[ai];
    const b = moleculeData.atoms[bi];
    const start = new THREE.Vector3(a.x, a.y, a.z);
    const end = new THREE.Vector3(b.x, b.y, b.z);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const length = start.distanceTo(end);

    const geo = new THREE.CylinderGeometry(0.06, 0.06, length, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x667788,
      roughness: 0.4,
      metalness: 0.2
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(mid);

    // Orient cylinder to connect the two atoms
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, direction);
    mesh.quaternion.copy(quat);

    molGroup.add(mesh);
  });

  // Draw Lone Pairs (PEB)
  if (moleculeData.peb > 0) {
    const lpPositions = moleculeData.lonePairs || [];
    // If no explicit lonePair coords, generate default positions
    const positions = lpPositions.length > 0 ? lpPositions : generateLonePairPositions(moleculeData);

    positions.forEach((lp) => {
      // Ellipsoid for lone pair cloud
      const geo = new THREE.SphereGeometry(0.35, 24, 24);
      geo.scale(1, 1.3, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00e5cc,
        transparent: true,
        opacity: 0.3,
        roughness: 0.8,
        metalness: 0
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(lp.x, lp.y, lp.z);
      molGroup.add(mesh);
    });
  }
}

function generateLonePairPositions(molData) {
  // Fallback: place lone pairs opposite to bonding atoms
  const positions = [];
  const center = molData.atoms[0];
  for (let i = 0; i < molData.peb; i++) {
    const angle = (Math.PI * 2 * i) / molData.peb + Math.PI / 4;
    positions.push({
      x: center.x + Math.cos(angle) * 1.2,
      y: center.y + 1.0 + i * 0.3,
      z: center.z + Math.sin(angle) * 1.2
    });
  }
  return positions;
}

/* === HERO Canvas 2D (kept for background animation) === */
function rotX(pts, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return pts.map(p => ({ ...p, y: p.y * c - p.z * s, z: p.y * s + p.z * c }));
}
function rotY(pts, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return pts.map(p => ({ ...p, x: p.x * c + p.z * s, z: -p.x * s + p.z * c }));
}
function project(p, cx, cy, scale, fov) {
  const z = p.z + fov, f = fov / z;
  return { x: cx + p.x * scale * f, y: cy + p.y * scale * f, z: p.z, sf: f };
}
function lighten(hex, t) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.min(255,r+Math.round(255*t))},${Math.min(255,g+Math.round(255*t))},${Math.min(255,b+Math.round(255*t))})`;
}
function darken(hex, t) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.max(0,r-Math.round(255*t))},${Math.max(0,g-Math.round(255*t))},${Math.max(0,b-Math.round(255*t))})`;
}

function renderMol2D(ctx, mol, w, h, rx, ry, scale) {
  ctx.clearRect(0, 0, w, h);
  const fov = 6, cx = w / 2, cy = h / 2;
  let pts = mol.atoms.map((a, i) => ({ ...a, i }));
  pts = rotX(pts, rx);
  pts = rotY(pts, ry);
  const proj = pts.map(p => ({ ...project(p, cx, cy, scale, fov), orig: mol.atoms[p.i], idx: p.i }));
  proj.sort((a, b) => a.z - b.z);

  mol.bonds.forEach(([ai, bi]) => {
    const a = proj.find(p => p.idx === ai), b = proj.find(p => p.idx === bi);
    if (!a || !b) return;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2; ctx.stroke();
  });

  proj.forEach(p => {
    const r = p.orig.r * scale * p.sf * 0.7;
    const g = ctx.createRadialGradient(p.x - r*0.3, p.y - r*0.3, r*0.05, p.x, p.y, r);
    g.addColorStop(0, lighten(p.orig.color, 0.5));
    g.addColorStop(0.5, p.orig.color);
    g.addColorStop(1, darken(p.orig.color, 0.4));
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(r, 2), 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    if (r > 7) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `bold ${Math.min(r * 0.78, 13)}px 'Space Mono', monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.orig.symbol, p.x, p.y);
    }
  });
}
