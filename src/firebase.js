// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Production Firebase Config ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxCMGnkMBcoK5THVfEhf_sOxDRlHLKfEg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tp-board-6331b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tp-board-6331b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tp-board-6331b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "976837655551",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:976837655551:web:6045ac6db6ee91cc9385ca",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JV0V2YDT79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Using Production Firebase");

export { app, auth, db };
export default app;
