
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// This object will hold the initialized Firebase instances.
// It's declared once and reused to avoid re-initialization (singleton pattern).
let firebaseInstances: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

/**
 * A robust function to get initialized Firebase services.
 * It ensures Firebase is initialized only once and only if configuration is provided.
 * This function is safe to call from both server and client components.
 * @returns An object with Firebase services (app, auth, db) or null if not configured.
 */
export function getFirebaseInstances() {
  // If already initialized, return the instances immediately.
  if (firebaseInstances) {
    return firebaseInstances;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // This boolean is the single source of truth for Firebase configuration status.
  // It checks not only for existence but also that the placeholder values have been replaced.
  const isFirebaseConfigured =
    firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("REEMPLAZA_CON_TU") &&
    firebaseConfig.authDomain && !firebaseConfig.authDomain.includes("REEMPLAZA_CON_TU") &&
    firebaseConfig.projectId && !firebaseConfig.projectId.includes("REEMPLAZA_CON_TU") &&
    firebaseConfig.storageBucket && !firebaseConfig.storageBucket.includes("REEMPLAZA_CON_TU") &&
    firebaseConfig.messagingSenderId && !firebaseConfig.messagingSenderId.includes("REEMPLAZA_CON_TU") &&
    firebaseConfig.appId && !firebaseConfig.appId.includes("REEMPLAZA_CON_TU");


  // If Firebase is not configured (missing environment variables),
  // return null. The calling code is responsible for handling this case.
  if (!isFirebaseConfigured) {
    // This warning is helpful for both local and production debugging.
    console.error("CRITICAL: Firebase configuration is missing or contains placeholder values. The application cannot connect to Firebase services. This is likely because environment variables (NEXT_PUBLIC_FIREBASE_*) are not set correctly in the production environment (apphosting.yaml) or locally (.env).");
    return null;
  }

  try {
    // Initialize Firebase app, reusing the existing app if one exists.
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Store the initialized instances for future calls.
    firebaseInstances = { app, auth, db };
    return firebaseInstances;

  } catch (error) {
    console.error("CRITICAL: Firebase initialization failed.", error);
    // In case of an unexpected error during initialization, ensure we return null.
    return null;
  }
}
