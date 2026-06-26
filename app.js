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
        
        // Admin-Ansicht nach erfolgreichem Login anpassen
        viewAdmin.innerHTML = `
            <h2>Admin Bereich entsperrt 🔓</h2>
            <p style="margin-top: 15px; color: var(--werder-green);">Du hast jetzt Admin-Rechte für die Live-Synchronisation!</p>
        `;
        
        // Hier rendern wir später die Admin-Controls neu
    } else {
        adminError.classList.remove('hidden');
    }
});

// --- PUNKTE LOGIK & FORTSCHRITT ---
// Diese Funktion bereitet den Live-Punktestand vor, der bald aus Firebase kommt
function updateScore(points) {
    scoreElement.innerText = points;
    
    // Fortschrittsbalken berechnen (max 100%)
    let percentage = (points / MAX_SCORE) * 100;
    if (percentage > 100) percentage = 100;
    
    progressBar.style.width = percentage + "%";
}

// Initialer Test-Aufruf, um zu sehen, ob der Balken funktioniert (wird später durch Firebase ersetzt)
updateScore(0);