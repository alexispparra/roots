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

// This function now simply initializes Firebase. The check for whether the
// config is valid has been moved to AuthContext for more robust, timely checks.
let firebaseInstances: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

/**
 * Gets initialized Firebase services.
 * It ensures Firebase is initialized only once.
 * This function should only be called after verifying the config is present.
 * @returns An object with Firebase services (app, auth, db).
 */
export function getFirebaseInstances() {
  if (firebaseInstances) {
    return firebaseInstances;
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    firebaseInstances = { app, auth, db };
    return firebaseInstances;

  } catch (error) {
    console.error("CRITICAL: Firebase initialization failed.", error);
    // Return null if initialization fails for any reason.
    return null;
  }
}
