// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator
} from "firebase/firestore";

// Local dev config (safe fake project)
const localConfig = {
  apiKey: "fake-api-key",
  authDomain: "localhost",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Production config (from .env)
const prodConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Choose config
const firebaseConfig =
  location.hostname === "localhost" ? localConfig : prodConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// IMPORTANT: Connect to emulators BEFORE using Auth anywhere
if (location.hostname === "localhost") {
  console.log("✅ Connecting to Firebase Emulators...");
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9155");
    connectFirestoreEmulator(db, "127.0.0.1", 8085);
  } catch (err) {
    console.error("❌ Emulator connection failed:", err);
  }
}

export { app, auth, db };
