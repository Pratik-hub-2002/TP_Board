// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = location.hostname === "localhost"
  ? {
      apiKey: "fake-api-key", // Avoid hitting production
      authDomain: "localhost",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef123456"
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Only connect to emulators in localhost mode
if (location.hostname === "localhost") {
  console.log("✅ Connecting to Firebase Emulators...");
  connectAuthEmulator(auth, "http://localhost:9155");
  connectFirestoreEmulator(db, "localhost", 8085);
}

export { onAuthStateChanged };
export default app;
