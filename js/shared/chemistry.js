/* ============================================================
   CHEMISTRY.JS — Molecule Dictionary & Formula Logic
   ============================================================ */

const MOLECULES = {
  "CO2": {
    formula: 'CO₂', name: 'Karbon Dioksida',
    geo: 'Linear', axe: 'AX₂', pei: 2, peb: 0,
    angles: [{ label: 'Sudut O–C–O', val: '180°' }],
    desc: 'Geometri linear terjadi saat atom pusat memiliki 2 domain elektron tanpa PEB. Tidak ada gaya yang mengubah sudut sehingga ikatan tepat lurus 180°.',
    atoms: [
      { x:0, y:0, z:0, r:0.40, color:'#888888', symbol:'C' },
      { x:1.6, y:0, z:0, r:0.35, color:'#e74c3c', symbol:'O' },
      { x:-1.6, y:0, z:0, r:0.35, color:'#e74c3c', symbol:'O' }
    ],
    bonds: [[0,1],[0,2]]
  },
  "BF3": {
    formula: 'BF₃', name: 'Boron Trifluorida',
    geo: 'Trigonal Planar', axe: 'AX₃', pei: 3, peb: 0,
    angles: [{ label: 'Sudut F–B–F', val: '120°' }],
    desc: 'Tiga domain ikatan tanpa PEB tersusun dalam satu bidang datar. Sudut antar ikatan seragam 120° karena gaya tolak yang setara.',
    atoms: [
      { x:0, y:0, z:0, r:0.40, color:'#888888', symbol:'B' },
      { x:0, y:1.5, z:0, r:0.30, color:'#27ae60', symbol:'F' },
      { x:-1.3, y:-0.75, z:0, r:0.30, color:'#27ae60', symbol:'F' },
      { x:1.3, y:-0.75, z:0, r:0.30, color:'#27ae60', symbol:'F' }
    ],
    bonds: [[0,1],[0,2],[0,3]]
  },
  "CH4": {
    formula: 'CH₄', name: 'Metana',
    geo: 'Tetrahedral', axe: 'AX₄', pei: 4, peb: 0,
    angles: [{ label: 'Sudut H–C–H', val: '109,5°' }],
    desc: 'Empat pasangan ikatan tersusun sejauh mungkin dalam ruang tiga dimensi membentuk tetrahedron. Sudut ikatan ideal 109,5° adalah khas geometri ini.',
    atoms: [
      { x:0, y:0, z:0, r:0.40, color:'#888888', symbol:'C' },
      { x:1, y:1, z:1, r:0.25, color:'#aaaaaa', symbol:'H' },
      { x:-1, y:-1, z:1, r:0.25, color:'#aaaaaa', symbol:'H' },
      { x:-1, y:1, z:-1, r:0.25, color:'#aaaaaa', symbol:'H' },
      { x:1, y:-1, z:-1, r:0.25, color:'#aaaaaa', symbol:'H' }
    ],
    bonds: [[0,1],[0,2],[0,3],[0,4]]
  },
  "NH3": {
    formula: 'NH₃', name: 'Amonia',
    geo: 'Trigonal Pyramidal', axe: 'AX₃E', pei: 3, peb: 1,
    angles: [{ label: 'Sudut H–N–H', val: '107°' }],
    desc: 'Satu PEB menekan tiga pasangan ikatan sehingga sudut mengecil menjadi 107°.',
    atoms: [
      { x:0, y:0, z:0, r:0.38, color:'#3498db', symbol:'N' },
      { x:1, y:-0.6, z:0.9, r:0.25, color:'#aaaaaa', symbol:'H' },
      { x:-1, y:-0.6, z:0.9, r:0.25, color:'#aaaaaa', symbol:'H' },
      { x:0, y:-0.6, z:-1.1, r:0.25, color:'#aaaaaa', symbol:'H' }
    ],
    bonds: [[0,1],[0,2],[0,3]],
    lonePairs: [{ x:0, y:1.2, z:0 }]
  },
  "H2O": {
    formula: 'H₂O', name: 'Air',
    geo: 'Bengkok (Bent)', axe: 'AX₂E₂', pei: 2, peb: 2,
    angles: [{ label: 'Sudut H–O–H', val: '104,5°' }],
    desc: 'Dua PEB memberikan tekanan besar sehingga sudut ikatan menyempit menjadi 104,5°.',
    atoms: [
      { x:0, y:0, z:0, r:0.38, color:'#e74c3c', symbol:'O' },
      { x:0.95, y:-0.8, z:0, r:0.25, color:'#aaaaaa', symbol:'H' },
      { x:-0.95, y:-0.8, z:0, r:0.25, color:'#aaaaaa', symbol:'H' }
    ],
    bonds: [[0,1],[0,2]],
    lonePairs: [{ x:0.5, y:1, z:0.5 }, { x:-0.5, y:1, z:-0.5 }]
  },
  "PCl5": {
    formula: 'PCl₅', name: 'Fosfor Pentaklorida',
    geo: 'Trigonal Bipyramidal', axe: 'AX₅', pei: 5, peb: 0,
    angles: [{ label: 'Aksial-Ekuatorial', val: '90°' }, { label: 'Ekuatorial', val: '120°' }],
    desc: 'Lima domain ikatan tanpa PEB membentuk struktur trigonal bipiramida.',
    atoms: [
      { x:0, y:0, z:0, r:0.42, color:'#e67e22', symbol:'P' },
      { x:1.4, y:0, z:0, r:0.32, color:'#2ecc71', symbol:'Cl' },
      { x:-0.7, y:0, z:1.2, r:0.32, color:'#2ecc71', symbol:'Cl' },
      { x:-0.7, y:0, z:-1.2, r:0.32, color:'#2ecc71', symbol:'Cl' },
      { x:0, y:1.6, z:0, r:0.32, color:'#f39c12', symbol:'Cl' },
      { x:0, y:-1.6, z:0, r:0.32, color:'#f39c12', symbol:'Cl' }
    ],
    bonds: [[0,1],[0,2],[0,3],[0,4],[0,5]]
  },
  "SF6": {
    formula: 'SF₆', name: 'Belerang Heksafluorida',
    geo: 'Oktahedral', axe: 'AX₆', pei: 6, peb: 0,
    angles: [{ label: 'F–S–F', val: '90°' }],
    desc: 'Enam domain ikatan tersusun simetris membentuk oktahedron sempurna.',
    atoms: [
      { x:0, y:0, z:0, r:0.42, color:'#f39c12', symbol:'S' },
      { x:1.5, y:0, z:0, r:0.30, color:'#27ae60', symbol:'F' },
      { x:-1.5, y:0, z:0, r:0.30, color:'#27ae60', symbol:'F' },
      { x:0, y:1.5, z:0, r:0.30, color:'#27ae60', symbol:'F' },
      { x:0, y:-1.5, z:0, r:0.30, color:'#27ae60', symbol:'F' },
      { x:0, y:0, z:1.5, r:0.30, color:'#27ae60', symbol:'F' },
      { x:0, y:0, z:-1.5, r:0.30, color:'#27ae60', symbol:'F' }
    ],
    bonds: [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]]
  },
  "XeF4": {
    formula: 'XeF₄', name: 'Xenon Tetrafluorida',
    geo: 'Segiempat Datar', axe: 'AX₄E₂', pei: 4, peb: 2,
    atoms: [
      { x:0, y:0, z:0, r:0.45, color:'#9b59b6', symbol:'Xe' },
      { x:1.5, y:0, z:0, r:0.30, color:'#27ae60', symbol:'F' },
      { x:-1.5, y:0, z:0, r:0.30, color:'#27ae60', symbol:'F' },
      { x:0, y:0, z:1.5, r:0.30, color:'#27ae60', symbol:'F' },
      { x:0, y:0, z:-1.5, r:0.30, color:'#27ae60', symbol:'F' }
    ],
    bonds: [[0,1],[0,2],[0,3],[0,4]],
    lonePairs: [{ x:0, y:1.2, z:0 }, { x:0, y:-1.2, z:0 }]
  },
  "HCl": {
    formula: 'HCl', name: 'Asam Klorida',
    geo: 'Linear', axe: 'AX', pei: 1, peb: 3,
    atoms: [
      { x:0, y:0, z:0, r:0.35, color:'#2ecc71', symbol:'Cl' },
      { x:1.4, y:0, z:0, r:0.25, color:'#aaaaaa', symbol:'H' }
    ],
    bonds: [[0,1]]
  },
  "BeCl2": {
    formula: 'BeCl₂', name: 'Berilium Klorida',
    geo: 'Linear', axe: 'AX₂', pei: 2, peb: 0,
    atoms: [
      { x:0, y:0, z:0, r:0.35, color:'#e67e22', symbol:'Be' },
      { x:1.5, y:0, z:0, r:0.32, color:'#2ecc71', symbol:'Cl' },
      { x:-1.5, y:0, z:0, r:0.32, color:'#2ecc71', symbol:'Cl' }
    ],
    bonds: [[0,1],[0,2]]
  }
};

const QUIZ_QUESTIONS = [
  // --- 10 SOAL DARI GAME ---
  { 
    type: "3d", molecule: "CH4", 
    question: "Dalam Game, Metana (CH₄) membuatmu melayang karena densitasnya ringan. Apa bentuk geometrinya?",
    options: ["Linear", "Bengkok", "Tetrahedral", "Segitiga Datar"],
    answer: 2 
  },
  { 
    type: "concept", 
    question: "Di Level 1, Besi (Fe) bisa menghancurkan Tembaga (Cu). Berdasarkan apa urutan kekuatan ini?",
    options: ["Deret Volta", "Hukum Pascal", "Tabel Periodik", "Hukum Newton"],
    answer: 0 
  },
  { 
    type: "concept", 
    question: "Di Level 2, kenapa kamu butuh Gas SF₆ untuk melawan Turbin Angin?",
    options: ["Karena SF₆ sangat ringan", "Karena SF₆ memiliki massa jenis yang berat", "Karena SF₆ bisa meledak", "Karena SF₆ berwarna merah"],
    answer: 1 
  },
  { 
    type: "3d", molecule: "H2O", 
    question: "Kamu harus mensintesis Air (H₂O) di Level 4. Apa alasan Air bisa melewati Danau Api?",
    options: ["Karena Air bersifat asam", "Karena Air mendinginkan api", "Karena Air adalah logam", "Karena Air bersifat mudah terbakar"],
    answer: 1 
  },
  { 
    type: "concept", 
    question: "Asam Klorida (HCl) digunakan untuk melarutkan dinding logam. HCl termasuk zat?",
    options: ["Asam Kuat", "Basa Lemah", "Garam", "Logam"],
    answer: 0 
  },
  { 
    type: "3d", molecule: "NH3", 
    question: "Amonia (NH₃) digunakan untuk menetralkan awan gas di Level 3. Apa geometri NH₃?",
    options: ["Tetrahedral", "Trigonal Piramida", "Bengkok", "Linear"],
    answer: 1 
  },
  { 
    type: "concept", 
    question: "Sintesis Air membutuhkan perbandingan atom Hidrogen (H) dan Oksigen (O) sebesar?",
    options: ["1:1", "1:2", "2:1", "3:1"],
    answer: 2 
  },
  { 
    type: "concept", 
    question: "Besi (Fe) akan mengalami korosi jika terkena rintangan Air. Korosi disebut juga?",
    options: ["Pembekuan", "Penguapan", "Perkaratan", "Pelelehan"],
    answer: 2 
  },
  { 
    type: "concept", 
    question: "Molekul SF₆ memiliki atom pusat Belerang (S). Berapa jumlah atom Fluor (F) di sekelilingnya?",
    options: ["4", "5", "6", "8"],
    answer: 2 
  },
  { 
    type: "concept", 
    question: "Gas Metana (CH₄) di game memberikan 'Rocket Jump'. Metana adalah komponen utama dari?",
    options: ["Udara Bersih", "Gas Alam", "Air Laut", "Tanah"],
    answer: 1 
  },

  // --- 10 SOAL TEORI VSEPR ---
  { 
    type: "3d", molecule: "CO2", 
    question: "Molekul CO₂ memiliki sudut ikatan 180°. Apa nama geometrinya?",
    options: ["Bengkok", "Linear", "Tetrahedral", "Oktahedral"],
    answer: 1 
  },
  { 
    type: "concept", 
    question: "Elektron yang digunakan untuk berikatan antar atom disebut?",
    options: ["PEB", "PEI", "Proton", "Neutron"],
    answer: 1 
  },
  { 
    type: "concept", 
    question: "Menurut teori VSEPR, pasangan elektron akan saling...?",
    options: ["Tarik-menarik", "Tolak-menolak", "Diam saja", "Berputar searah"],
    answer: 1 
  },
  { 
    type: "3d", molecule: "BF3", 
    question: "Molekul BF₃ memiliki 3 pasangan ikatan dan 0 pasangan bebas. Geometrinya adalah?",
    options: ["Trigonal Planar", "Trigonal Piramida", "Tetrahedral", "Linear"],
    answer: 0 
  },
  { 
    type: "concept", 
    question: "Sudut ikatan ideal pada geometri Tetrahedral (seperti CH₄) adalah?",
    options: ["90°", "109.5°", "120°", "180°"],
    answer: 1 
  },
  { 
    type: "concept", 
    question: "Molekul H₂O memiliki geometri 'Bengkok'. Apa yang menyebabkan sudut ikatannya mengecil?",
    options: ["Adanya 2 PEB", "Adanya 2 PEI", "Massa atom Oksigen", "Gaya gravitasi"],
    answer: 0 
  },
  { 
    type: "3d", molecule: "SF6", 
    question: "Geometri molekul dengan tipe AX₆ disebut?",
    options: ["Oktahedral", "Tetrahedral", "Linear", "Bipiramida Trigonal"],
    answer: 0 
  },
  { 
    type: "3d", molecule: "PCl5", 
    question: "PCl₅ memiliki geometri Trigonal Bipiramida. Berapa jumlah domain elektronnya?",
    options: ["3", "4", "5", "6"],
    answer: 2 
  },
  { 
    type: "concept", 
    question: "Apa kepanjangan dari VSEPR?",
    options: ["Valence Shell Electron Pair Repulsion", "Variable Shell Electron Pair Reaction", "Visual State Electron Pair Rotation", "Valence State Electron Pair Relation"],
    answer: 0 
  },
  { 
    type: "concept", 
    question: "Molekul yang tidak memiliki pasangan elektron bebas pada atom pusatnya cenderung bersifat?",
    options: ["Polar", "Non-polar", "Asam", "Basa"],
    answer: 1 
  }
];

const ELEMENTS_COLOR = {
  "H": "#aaaaaa", "He": "#dff9fb", "Li": "#ff7979", "Be": "#e67e22", "B": "#888888", "C": "#555555",
  "N": "#3498db", "O": "#e74c3c", "F": "#27ae60", "Ne": "#7ed6df", "Na": "#badc58", "Mg": "#6ab04c",
  "Al": "#95afc0", "Si": "#34495e", "P": "#e67e22", "S": "#f1c40f", "Cl": "#2ecc71", "Ar": "#c7ecee",
  "K": "#ffbe76", "Ca": "#f0932b", "Fe": "#95a5a6", "Cu": "#d35400", "Au": "#f1c40f", "Ag": "#bdc3c7"
};
