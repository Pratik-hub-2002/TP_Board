// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxCMGnkMBcoK5THVfEhf_sOxDRlHLKfEg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tp-board-6331b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tp-board-6331b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tp-board-6331b.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "976837655551",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:976837655551:web:6045ac6db6ee91cc9385ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log("🔌 Connected to Firebase Emulators");
  console.log("🔄 Using Development Environment");
} else {
  console.log("🚀 Connected to Firebase Production Services");
  console.log("✅ Using Production Environment");
}

export { app, auth, db };
export default app;
