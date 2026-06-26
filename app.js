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

// --- EMOJI HELPER ---
function getCategoryEmoji(category) {
    const icons = {
        "Berlin": "🐻",
        "Bier": "🍻",
        "Fußball": "⚽",
        "Hochzeit": "💍",
        "Komplett verrückt": "🤪",
        "Bierwissen": "🍻🧠",
        "Fußballwissen": "⚽🧠",
        "Schätzfragen": "🧐"
    };
    return icons[category] ? `${category} ${icons[category]}` : category;
}

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
let quizStates = {}; 

gameDocRef.onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        completedTaskIds = data.completedTasks || [];
        quizStates = data.quizStates || {};
        
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
    // 1. Überschrift und Zufalls-Button einfügen
    viewTasks.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h2>Aufgaben 📋</h2>
            <button id="btn-random" style="background: var(--werder-green); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">🎲 Zufall</button>
        </div>
    `;
    
    // 2. Logik für den Zufalls-Button
    document.getElementById('btn-random').addEventListener('click', () => {
        // Alle Aufgaben filtern, die noch nicht abgehakt sind
        const offeneAufgaben = jgaTasks.filter(task => !completedTaskIds.includes(task.id));
        
        if (offeneAufgaben.length === 0) {
            alert("Wahnsinn! Ihr habt bereits alle Aufgaben erledigt! 🍻");
            return;
        }
        
        // Eine zufällige Aufgabe auswählen
        const randomTask = offeneAufgaben[Math.floor(Math.random() * offeneAufgaben.length)];
        
        // Aufgabe als Popup anzeigen
        alert(`🎲 EURE ZUFALLSAUFGABE:\n\nKategorie: ${getCategoryEmoji(randomTask.category)}\nPunkte: +${randomTask.points}\n\nAufgabe:\n"${randomTask.text}"`);
    });

    // 3. Karten zeichnen
    jgaTasks.forEach(task => {
        const card = document.createElement('div');
        const typeClass = task.type.toLowerCase().replace('ä', 'ae'); 
        const isCompleted = completedTaskIds.includes(task.id);
        
        card.className = `task-card ${typeClass} ${isCompleted ? 'completed' : ''}`;
        
        card.innerHTML = `
            <div class="task-info">
                <span class="task-category">${getCategoryEmoji(task.category)}</span>
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
        // HIER WIRD DAS EMOJI EINGEFÜGT:
        card.innerHTML = `
            <div class="task-info">
                <span class="task-category">${getCategoryEmoji(task.category)}</span>
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
        const state = quizStates[q.id]; 
        
        card.className = `task-card ${typeClass} ${state ? 'completed' : ''}`;
        
        let statusText = "";
        if (state === 'wrong') {
            card.style.borderColor = '#d32f2f';
            statusText = "<p style='color: #d32f2f; margin-top: 10px;'><em>❌ Falsch beantwortet (0 Punkte)</em></p>";
        } else if (state === 'correct') {
            statusText = "<p style='color: var(--werder-green); margin-top: 10px;'><em>✅ Richtig beantwortet!</em></p>";
        }

        // HIER WIRD DAS EMOJI EINGEFÜGT:
        card.innerHTML = `
            <div class="task-info">
                <span class="task-category">${getCategoryEmoji(q.category)}</span>
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

// Globale Funktionen für die Quiz-Buttons
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
        delete updatedQuizStates[id];
    } else {
        updatedQuizStates[id] = status;
    }
    gameDocRef.update({ quizStates: updatedQuizStates });
};