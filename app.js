// --- DOM Elemente abrufen ---
const scoreElement = document.getElementById('current-score');
const progressBar = document.getElementById('progress-bar');

// Navigation Buttons
const btnTasks = document.getElementById('btn-tasks');
const btnQuiz = document.getElementById('btn-quiz');
const btnAdmin = document.getElementById('btn-admin');

// Views (Ansichten)
const viewTasks = document.getElementById('view-tasks');
const viewQuiz = document.getElementById('view-quiz');
const viewAdmin = document.getElementById('view-admin');

// Admin Login Elemente
const pinInput = document.getElementById('admin-pin-input');
const btnLogin = document.getElementById('btn-login');
const adminError = document.getElementById('admin-error');

// --- Globale Einstellungen ---
const ADMIN_PIN = "7890"; // Deine festgelegte PIN
const MAX_SCORE = 100; // Euer Ziel für Mitternacht

// --- NAVIGATION LOGIK ---
function switchTab(activeBtn, activeView) {
    // Alle Buttons zurücksetzen
    btnTasks.classList.remove('active');
    btnQuiz.classList.remove('active');
    btnAdmin.classList.remove('active');
    
    // Alle Views verstecken
    viewTasks.classList.remove('active');
    viewTasks.classList.add('hidden');
    viewQuiz.classList.remove('active');
    viewQuiz.classList.add('hidden');
    viewAdmin.classList.remove('active');
    viewAdmin.classList.add('hidden');
    
    // Geklickten Button & View aktivieren
    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');
    activeView.classList.add('active');
}

// Event Listener für die Klicks auf die Tabs
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

// --- AUFGABEN RENDERN & LOGIK ---
let currentPoints = 0; 

function renderTasks() {
    viewTasks.innerHTML = '<h2 style="margin-bottom: 15px;">Aufgaben 📋</h2>';
    
    jgaTasks.forEach(task => {
        const card = document.createElement('div');
        const typeClass = task.type.toLowerCase().replace('ä', 'ae'); 
        card.className = `task-card ${typeClass}`;
        
        card.innerHTML = `
            <div class="task-info">
                <span class="task-category">${task.category}</span>
                <span class="task-points">+${task.points}</span>
            </div>
            <p>${task.text}</p>
        `;
        
        card.addEventListener('click', () => {
            card.classList.toggle('completed');
            
            if (card.classList.contains('completed')) {
                currentPoints += task.points;
            } else {
                currentPoints -= task.points;
            }
            
            updateScore(currentPoints);
        });
        
        viewTasks.appendChild(card);
    });
}

// Initiale Aufrufe
updateScore(0);
if (typeof jgaTasks !== 'undefined') {
    renderTasks();
} else {
    viewTasks.innerHTML = '<h2 style="color: red;">Fehler: Aufgaben konnten nicht geladen werden. Bitte tasks.js prüfen!</h2>';
}