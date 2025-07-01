
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// The configuration is now sourced from next.config.js, which handles
// the logic for both deployed and local environments.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// The admin email is also loaded from the environment.
export const APP_ADMIN_EMAIL = process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL || 'alexispparra@gmail.com';


// --- DO NOT EDIT BELOW THIS LINE ---

let firebaseInstances: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

/**
 * A robust function to get initialized Firebase services.
 * It ensures Firebase is initialized only once.
 * @returns An object with Firebase services { app, auth, db }.
 */
export function getFirebaseInstances() {
  if (firebaseInstances) {
    return firebaseInstances;
  }
  
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  firebaseInstances = { app, auth, db };
  return firebaseInstances;
}
