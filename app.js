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

// --- FIREBASE LIVE-SYNCHRONISATION & AUFGABEN ---
const gameDocRef = db.collection('game').doc('current');
let completedTaskIds = []; 

// 1. Live-Listener: Hört auf jede Änderung in der Datenbank
gameDocRef.onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        completedTaskIds = data.completedTasks || [];
        
        // Punkte anhand der abgehakten Aufgaben neu berechnen
        let newScore = 0;
        if (typeof jgaTasks !== 'undefined') {
            jgaTasks.forEach(task => {
                if (completedTaskIds.includes(task.id)) {
                    newScore += task.points;
                }
            });
            renderTasks(); // Karten neu zeichnen (um die Haken live zu setzen/entfernen)
        }
        
        updateScore(newScore);
    } else {
        // Falls das Dokument noch gar nicht existiert, erstellen wir es jetzt (Startzustand)
        gameDocRef.set({ completedTasks: [] });
    }
});

// 2. Aufgaben-Karten generieren
function renderTasks() {
    viewTasks.innerHTML = '<h2 style="margin-bottom: 15px;">Aufgaben 📋</h2>';
    
    jgaTasks.forEach(task => {
        const card = document.createElement('div');
        const typeClass = task.type.toLowerCase().replace('ä', 'ae'); 
        const isCompleted = completedTaskIds.includes(task.id);
        
        // Wenn die Aufgabe erledigt ist, bekommt sie sofort die 'completed' Klasse
        card.className = `task-card ${typeClass} ${isCompleted ? 'completed' : ''}`;
        
        card.innerHTML = `
            <div class="task-info">
                <span class="task-category">${task.category}</span>
                <span class="task-points">+${task.points}</span>
            </div>
            <p>${task.text}</p>
        `;
        
        // Klick-Logik: Speichert den Haken live in der Datenbank
        card.addEventListener('click', () => {
            if (!isAdmin) {
                alert("🔒 Nur Admins dürfen Aufgaben abhaken! Bitte gib zuerst die PIN im Admin-Bereich ein.");
                return;
            }
            
            let updatedTasks = [...completedTaskIds];
            if (isCompleted) {
                // Rückgängig machen (Entfernt die ID aus der Liste)
                updatedTasks = updatedTasks.filter(id => id !== task.id);
            } else {
                // Abhaken (Fügt die ID zur Liste hinzu)
                updatedTasks.push(task.id);
            }
            
            // Sende das Update live an Firebase!
            gameDocRef.update({ completedTasks: updatedTasks });
        });
        
        viewTasks.appendChild(card);
    });
}