import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- DYNAMIC CONFIGURATION FROM ENVIRONMENT VARIABLES ---
// This is the standard and most secure way for Next.js applications.
// The configuration is loaded from the `.env` file.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// The admin email is also loaded from the environment.
export const APP_ADMIN_EMAIL = process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL;


// --- DO NOT EDIT BELOW THIS LINE ---

let firebaseInstances: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

/**
 * Gets initialized Firebase services.
 * It ensures Firebase is initialized only once. My previous custom checks were faulty.
 * This new version simply attempts to initialize and lets Firebase's own SDK decide if the config is valid.
 * @returns An object with Firebase services (app, auth, db) or null if initialization fails.
 */
export function getFirebaseInstances() {
  // If we already have the instances, return them.
  if (firebaseInstances) {
    return firebaseInstances;
  }

  // A minimal check to see if the values are even present before trying to initialize.
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("Firebase config values (apiKey, projectId) are missing. Check your .env file.");
    return null;
  }
  
  // The previous validation logic was flawed. We now let the Firebase SDK handle validation.
  // It will throw a descriptive error if the config is malformed, which we catch below.

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    firebaseInstances = { app, auth, db };
    return firebaseInstances;

  } catch (error) {
    // This will catch errors from initializeApp if the config is invalid (e.g., malformed projectId).
    console.error("CRITICAL: Firebase initialization failed. This is likely due to invalid values in your .env file.", error);
    return null;
  }
}
