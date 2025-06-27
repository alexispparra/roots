import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- SINGLE SOURCE OF TRUTH FOR CONFIGURATION ---
// Edita los valores de abajo con tus credenciales de Firebase.
// Esta es la solución definitiva para asegurar que la configuración se cargue siempre.

const firebaseConfig = {
  apiKey: "REEMPLAZA_CON_TU_API_KEY",
  authDomain: "REEMPLAZA_CON_TU_AUTH_DOMAIN",
  projectId: "REEMPLAZA_CON_TU_PROJECT_ID",
  storageBucket: "REEMPLAZA_CON_TU_STORAGE_BUCKET",
  messagingSenderId: "REEMPLAZA_CON_TU_MESSAGING_SENDER_ID",
  appId: "REEMPLAZA_CON_TU_APP_ID",
};

// El correo del administrador principal de la aplicación.
export const APP_ADMIN_EMAIL = "REEMPLAZA_CON_TU_EMAIL_DE_ADMIN";


// --- DO NOT EDIT BELOW THIS LINE ---

// Verifica que los valores de arriba hayan sido reemplazados.
const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith("REEMPLAZA_CON_TU_");

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

  if (!isFirebaseConfigured) {
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
