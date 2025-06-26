
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
export const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

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

  // If Firebase is not configured (missing environment variables),
  // log a warning in development and return null.
  if (!isFirebaseConfigured) {
    if (process.env.NODE_ENV === 'development') {
        console.warn("Firebase is not configured. Please provide Firebase config in your environment variables to enable full functionality.");
    }
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

// For convenience, you can also export the individual services, but it's often
// safer to use getFirebaseInstances() to ensure you handle the unconfigured case.
export const { app, auth, db } = getFirebaseInstances() ?? { app: null, auth: null, db: null };
