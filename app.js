// --- DOM Elemente abrufen ---
const scoreElement = document.getElementById('current-score');
const progressBar = document.getElementById('progress-bar');

const btnTasks = document.getElementById('btn-tasks');
const btnQuiz = document.getElementById('btn-quiz');
const btnAdmin = document.getElementById('btn-admin');

const viewTasks = document.getElementById('view-tasks');
const viewQuiz = document.getElementById('view-quiz');
const viewAdmin = document.getElementById('view-admin');

const pinInput = document.getElementById('admin-pin-input');
const btnLogin = document.getElementById('btn-login');
const adminError = document.getElementById('admin-error');

// --- Globale Einstellungen ---
const ADMIN_PIN = "7890";
const MAX_SCORE = 100;

// --- NAVIGATION LOGIK ---
function switchTab(activeBtn, activeView) {
    btnTasks.classList.remove('active');
    btnQuiz.classList.remove('active');
    btnAdmin.classList.remove('active');
    
    viewTasks.classList.remove('active');
    viewTasks.classList.add('hidden');
    viewQuiz.classList.remove('active');
    viewQuiz.classList.add('hidden');
    viewAdmin.classList.remove('active');
    viewAdmin.classList.add('hidden');
    
    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');
    activeView.classList.add('active');
}

btnTasks.addEventListener('click', () => switchTab(btnTasks, viewTasks));
btnQuiz.addEventListener('click', () => switchTab(btnQuiz, viewQuiz));
btnAdmin.addEventListener('click', () => switchTab(btnAdmin, viewAdmin));

// --- ADMIN LOGIK ---
let isAdmin = false;

btnLogin.addEventListener('click', () => {
    if (pinInput.value === ADMIN_PIN) {
        isAdmin = true;
        adminError.classList.add('hidden');
        pinInput.value = '';
        
        viewAdmin.innerHTML = `
            <h2>Admin Bereich entsperrt 🔓</h2>
            <p style="margin-top: 15px; color: var(--werder-green);">Du hast jetzt Admin-Rechte für die Live-Synchronisation!</p>
        `;
    } else {
        adminError.classList.remove('hidden');
    }
});

// --- PUNKTE LOGIK & FORTSCHRITT ---
function updateScore(points) {
    scoreElement.innerText = points;
    let percentage = (points / MAX_SCORE) * 100;
    if (percentage > 100) percentage = 100;
    progressBar.style.width = percentage + "%";
}

// --- FIREBASE LIVE-SYNCHRONISATION ---
const gameDocRef = db.collection('game').doc('current');
let completedTaskIds = []; 
let quizStates = {}; // Speichert, ob ein Quiz "correct" oder "wrong" ist

// Live-Listener
gameDocRef.onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        completedTaskIds = data.completedTasks || [];
        quizStates = data.quizStates || {};
        
        // Punkte berechnen (Aufgaben + richtige Quizfragen)
        let newScore = 0;
        if (typeof jgaTasks !== 'undefined') {
            jgaTasks.forEach(task => {
                if (completedTaskIds.includes(task.id)) newScore += task.points;
            });
            renderTasks(); 
        }
        if (typeof jgaQuiz !== 'undefined') {
            jgaQuiz.forEach(q => {
                if (quizStates[q.id] === 'correct') newScore += q.points;
            });
            renderQuiz();
        }
        
        updateScore(newScore);
    } else {
        gameDocRef.set({ completedTasks: [], quizStates: {} });
    }
});

// --- AUFGABEN RENDERN ---
function renderTasks() {
    viewTasks.innerHTML = '<h2 style="margin-bottom: 15px;">Aufgaben 📋</h2>';
    jgaTasks.forEach(task => {
        const card = document.createElement('div');
        const typeClass = task.type.toLowerCase().replace('ä', 'ae'); 
        const isCompleted = completedTaskIds.includes(task.id);
        
        card.className = `task-card ${typeClass} ${isCompleted ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="task-info">
                <span class="task-category">${task.category}</span>
                <span class="task-points">+${task.points}</span>
            </div>
            <p>${task.text}</p>
        `;
        
        card.addEventListener('click', () => {
            if (!isAdmin) {
                alert("🔒 Nur Admins dürfen Aufgaben abhaken!");
                return;
            }
            let updatedTasks = [...completedTaskIds];
            if (isCompleted) {
                updatedTasks = updatedTasks.filter(id => id !== task.id);
            } else {
                updatedTasks.push(task.id);
            }
            gameDocRef.update({ completedTasks: updatedTasks });
        });
        viewTasks.appendChild(card);
    });
}

// --- QUIZ RENDERN ---
function renderQuiz() {
    viewQuiz.innerHTML = '<h2 style="margin-bottom: 15px;">Quiz 🧠</h2>';
    
    jgaQuiz.forEach(q => {
        const card = document.createElement('div');
        const typeClass = q.type.toLowerCase().replace('ä', 'ae');
        const state = quizStates[q.id]; // 'correct', 'wrong' oder undefined
        
        card.className = `task-card ${typeClass} ${state ? 'completed' : ''}`;
        
        // Optische Anpassung je nach Status
        let statusText = "";
        if (state === 'wrong') {
            card.style.borderColor = '#d32f2f'; // Rot für falsch
            statusText = "<p style='color: #d32f2f; margin-top: 10px;'><em>❌ Falsch beantwortet (0 Punkte)</em></p>";
        } else if (state === 'correct') {
            statusText = "<p style='color: var(--werder-green); margin-top: 10px;'><em>✅ Richtig beantwortet!</em></p>";
        }

        card.innerHTML = `
            <div class="task-info">
                <span class="task-category">${q.category}</span>
                <span class="task-points">+${q.points}</span>
            </div>
            <p style="font-size: 1.1rem; margin-bottom: 10px;"><strong>${q.question}</strong></p>
            
            ${!state ? `
                <button class="btn-reveal" onclick="toggleAnswer('${q.id}')">Antwort anzeigen</button>
                <div class="quiz-answer hidden" id="ans-${q.id}">
                    <p style="margin-top: 10px; font-size: 1.2rem; color: var(--gold);"><strong>Antwort: ${q.answer}</strong></p>
                    <div class="quiz-actions">
                        <button class="btn-correct" onclick="submitQuiz('${q.id}', 'correct')">✅ Richtig</button>
                        <button class="btn-wrong" onclick="submitQuiz('${q.id}', 'wrong')">❌ Falsch</button>
                    </div>
                </div>
            ` : statusText + `
                <div style="margin-top: 10px;">
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Richtige Antwort war: ${q.answer}</p>
                    <button class="btn-reset" onclick="submitQuiz('${q.id}', null)">🔄 Bewertung zurücksetzen</button>
                </div>
            `}
        `;
        viewQuiz.appendChild(card);
    });
}

// Globale Funktionen für die Quiz-Buttons (aus HTML aufrufbar)
window.toggleAnswer = function(id) {
    document.getElementById(`ans-${id}`).classList.toggle('hidden');
};

window.submitQuiz = function(id, status) {
    if (!isAdmin) {
        alert("🔒 Nur Admins dürfen Quizfragen bewerten!");
        return;
    }
    let updatedQuizStates = { ...quizStates };
    if (status === null) {
        delete updatedQuizStates[id]; // Reset
    } else {
        updatedQuizStates[id] = status; // Setze 'correct' oder 'wrong'
    }
    gameDocRef.update({ quizStates: updatedQuizStates });
};