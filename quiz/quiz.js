/* ============================================================
   QUIZ.JS — Integrated 3D Quiz Logic (QUIZIZZ STYLE)
   ============================================================ */

let currentQIndex = 0;
let quizScore = 0;
let quizQuestions = [];
let canAnswer = true;
let correctCount = 0;

// Quizizz Style Timer
let questionStartTime = 0;
let scoreTimerInterval = null;
const BASE_POINTS = 1000;
const TIME_LIMIT = 15000; // 15 detik per soal untuk poin maksimal

function initQuiz() {
  const startBtn = document.getElementById('btnBeginQuiz');
  if (!startBtn) return;

  startBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('userName');
    const name = nameInput.value.trim() || "Kimiawan";
    localStorage.setItem('vsepr_user', name);
    
    document.getElementById('quizIntro').classList.add('hidden');
    document.getElementById('quizQuestionArea').classList.remove('hidden');
    
    if (typeof refreshQuizSize === 'function') refreshQuizSize();
    startQuiz();
  });
}

function startQuiz() {
  // Ambil 20 soal (semua soal yang ada di database)
  quizQuestions = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 20);
  currentQIndex = 0;
  quizScore = 0;
  correctCount = 0;
  loadQuestion();
}

function loadQuestion() {
  if (currentQIndex >= quizQuestions.length) {
    showResults();
    return;
  }

  canAnswer = true;
  const q = quizQuestions[currentQIndex];
  
  // Update UI
  document.getElementById('questionCounter').textContent = `Soal ${currentQIndex + 1}/${quizQuestions.length}`;
  document.getElementById('quizQuestionText').textContent = q.question;
  
  // Progress Bar
  document.getElementById('quizProgressFill').style.width = `${((currentQIndex + 1) / quizQuestions.length) * 100}%`;
  
  // Render 3D Molecule if needed
  if (q.type === '3d' && q.molecule) {
    const molData = MOLECULES[q.molecule];
    if (molData && typeof drawQuizMolecule === 'function') {
      drawQuizMolecule(molData);
    }
  }

  // Inject Options
  const optGrid = document.getElementById('quizOptions');
  optGrid.innerHTML = '';
  
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.innerHTML = opt;
    btn.onclick = () => selectAnswer(i);
    optGrid.appendChild(btn);
  });

  // Start Scoring Timer
  questionStartTime = Date.now();
}

function selectAnswer(index) {
  if (!canAnswer) return;
  canAnswer = false;
  
  const q = quizQuestions[currentQIndex];
  const btns = document.querySelectorAll('.quiz-option-btn');
  const timeTaken = Date.now() - questionStartTime;
  
  if (index === q.answer) {
    // Quizizz Scoring: Base 500 + Bonus based on speed (up to 500)
    const speedBonus = Math.max(0, 500 - (timeTaken / 30)); 
    const earnedPoints = Math.round(500 + speedBonus);
    
    btns[index].classList.add('correct');
    quizScore += earnedPoints;
    correctCount++;
    
    if (typeof qMolGroup !== 'undefined') qMolGroup.rotation.y += 0.8;
    showToast(`BENAR! +${earnedPoints} Poin`);
  } else {
    if (index !== -1) btns[index].classList.add('wrong');
    btns[q.answer].classList.add('correct');
    showToast(`SALAH! Terus belajar ya.`, true);
  }
  
  setTimeout(() => {
    currentQIndex++;
    loadQuestion();
  }, 1500);
}

function showResults() {
  const userName = localStorage.getItem('vsepr_user') || "Kimiawan";
  document.getElementById('quizQuestionArea').classList.add('hidden');
  document.getElementById('quizResult').classList.remove('hidden');
  
  document.getElementById('finalScore').textContent = quizScore;
  document.getElementById('correctCount').textContent = `${correctCount}/${quizQuestions.length}`;
  
  const accuracy = (correctCount / quizQuestions.length) * 100;
  let msg = `Selamat **${userName}**! Kamu telah menyelesaikan kuis dengan total skor **${quizScore}**. `;
  
  if (accuracy === 100) msg += "Luar biasa! Kamu adalah Master VSEPR sejati.";
  else if (accuracy >= 70) msg += "Hebat! Pemahamanmu tentang geometri molekul sangat baik.";
  else if (accuracy >= 40) msg += "Cukup baik! Tingkatkan lagi belajarmu.";
  else msg += "Jangan menyerah! Coba lagi untuk memperdalam pemahamanmu.";
  
  document.getElementById('resultMsg').innerHTML = msg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  document.getElementById('quizProgressFill').style.width = '100%';
}

function showToast(msg, isError = false) {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '10%';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = isError ? '#e74c3c' : '#2ecc71';
  toast.style.color = 'white';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '50px';
  toast.style.fontFamily = 'Space Mono';
  toast.style.zIndex = '2000';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

window.addEventListener('load', () => {
  initQuiz();
});
