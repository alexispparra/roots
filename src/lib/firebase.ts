
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This boolean is the single source of truth for Firebase configuration status.
// We explicitly check if the values are strings and have some length.
export const isFirebaseConfigured =
  typeof firebaseConfig.apiKey === 'string' &&
  firebaseConfig.apiKey.length > 0 &&
  typeof firebaseConfig.projectId === 'string' &&
  firebaseConfig.projectId.length > 0;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// The initialization logic is wrapped in a self-executing function
// to ensure it only runs once and handles all errors gracefully.
(function initializeFirebase() {
  if (isFirebaseConfigured) {
    try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (error) {
      console.error("CRITICAL: Firebase initialization failed.", error);
      // Explicitly set everything to null on failure to prevent partial initialization.
      app = null;
      auth = null;
      db = null;
    }
  } else {
    // This is not an error, just a state of the app.
    // It's useful for developers to see this warning locally.
    if (process.env.NODE_ENV === 'development') {
      console.warn("Firebase not configured. The app will run in a read-only demonstration mode. Please provide Firebase config in your .env file.");
    }
  }
})();

export { app, auth, db };
