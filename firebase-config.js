// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhe4n0k4XLct-7hFGR1xDIH2ZBcGa48zo",
  authDomain: "jga-micha-2026.firebaseapp.com",
  projectId: "jga-micha-2026",
  storageBucket: "jga-micha-2026.firebasestorage.app",
  messagingSenderId: "740647186964",
  appId: "1:740647186964:web:10ff4302d84c10c0d4ad01"
};


// --- NEU: Firebase & Datenbank starten ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// Initialize Firebase
const app = initializeApp(firebaseConfig);