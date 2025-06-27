
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- SINGLE SOURCE OF TRUTH FOR CONFIGURATION ---
// These environment variables are populated by apphosting.yaml and MUST be prefixed
// with NEXT_PUBLIC_ to be available in the browser-side code.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required environment variables are set and are not placeholders.
const isFirebaseConfigured =
  firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("REEMPLAZA") &&
  firebaseConfig.authDomain && !firebaseConfig.authDomain.includes("REEMPLAZA") &&
  firebaseConfig.projectId && !firebaseConfig.projectId.includes("REEMPLAZA") &&
  firebaseConfig.storageBucket && !firebaseConfig.storageBucket.includes("REEMPLAZA") &&
  firebaseConfig.messagingSenderId && !firebaseConfig.messagingSenderId.includes("REEMPLAZA") &&
  firebaseConfig.appId && !firebaseConfig.appId.includes("REEMPLAZA");

// The email for the application administrator.
export const APP_ADMIN_EMAIL = process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL || "";

// This object will hold the initialized Firebase instances.
let firebaseInstances: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

/**
 * A robust function to get initialized Firebase services.
 * It ensures Firebase is initialized only once and that the configuration is valid.
 * This function is safe to call from both server and client components.
 * @returns An object with Firebase services (app, auth, db) or null if not configured.
 */
export function getFirebaseInstances() {
  if (firebaseInstances) {
    return firebaseInstances;
  }

  // If the config isn't fully provided via environment variables, do not initialize.
  if (!isFirebaseConfigured) {
    console.error("CRITICAL: Firebase configuration is missing or contains placeholders. Check your apphosting.yaml.");
    return null;
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    firebaseInstances = { app, auth, db };
    return firebaseInstances;

  } catch (error) {
    console.error("CRITICAL: Firebase initialization failed.", error);
    return null;
  }
}
