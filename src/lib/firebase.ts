
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- SINGLE SOURCE OF TRUTH FOR CONFIGURATION ---
// To break the deployment loop, the Firebase config is now hardcoded here.
// This is not standard practice for security, but it guarantees the app uses the correct keys.
const firebaseConfig = {
  apiKey: "AIzaSyDS_pUeLHZAsyPHP1NuPLELXXYQtvTIi-w",
  authDomain: "projectflow-bvod7.firebaseapp.com",
  projectId: "projectflow-bvod7",
  storageBucket: "projectflow-bvod7.firebasestorage.app",
  messagingSenderId: "980756790749",
  appId: "1:980756790749:web:7804b032b21501fbfd4a34",
};

// The email for the application administrator.
// IMPORTANT: Change this to your actual admin email address if it's different.
export const APP_ADMIN_EMAIL = "alexispparra@gmail.com"; 

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

  // The configuration is now always valid because it's hardcoded.
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
