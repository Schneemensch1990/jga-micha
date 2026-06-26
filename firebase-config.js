// --- JGA Micha Firebase Konfiguration ---
const firebaseConfig = {
    apiKey: "AIzaSyBhe4n0k4XLct-7hFGR1xDIH2ZBcGa48zo",
    authDomain: "jga-micha-2026.firebaseapp.com",
    projectId: "jga-micha-2026",
    storageBucket: "jga-micha-2026.appspot.com", // Hier hab ich .appspot.com gesetzt, das ist der Standard
    messagingSenderId: "740647186964",
    appId: "1:740647186964:web:10ff4302d84c10c0d4ad01"
  };
  
  // --- Firebase & Datenbank starten (Compat Modus) ---
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();