import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- CONFIGURACIÓN DIRECTA Y CENTRALIZADA ---
// Por favor, rellena tus credenciales de Firebase aquí. Esta es ahora la
// única fuente de verdad para la configuración de la aplicación.
// Esto elimina los problemas con la carga de archivos .env en el entorno.

export const firebaseConfig = {
  apiKey: "AIzaSyDS_pUeLHZAsyPHP1NuPLELXXYQtvTIi-w",
  authDomain: "projectflow-bvod7.firebaseapp.com",
  projectId: "projectflow-bvod7",
  storageBucket: "projectflow-bvod7.firebasestorage.app",
  messagingSenderId: "980756790749",
  appId: "1:980756790749:web:7804b032b21501fbfd4a34",
};

// El email del administrador también se define aquí.
export const APP_ADMIN_EMAIL = "alexispparra@gmail.com";


// --- DO NOT EDIT BELOW THIS LINE ---

let firebaseInstances: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

/**
 * Initializes and returns Firebase services. Throws an error if configuration is invalid.
 * This is the single source of truth for Firebase initialization.
 * @returns An object with Firebase services { app, auth, db }.
 */
export function getFirebaseInstances() {
  if (firebaseInstances) {
    return firebaseInstances;
  }
  
  // This is the definitive check. If the config is a placeholder, Firebase will throw an error.
  const isConfigured = 
      firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      !firebaseConfig.apiKey.startsWith("REEMPLAZA_CON_TU_");

  if (!isConfigured) {
    // Throw a clear error that the AuthContext can catch and display to the user.
    throw new Error("La configuración de Firebase en 'src/lib/firebase.ts' no está completa. Por favor, reemplaza los valores de ejemplo.");
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    firebaseInstances = { app, auth, db };
    return firebaseInstances;

  } catch (error) {
    console.error("CRITICAL: Firebase initialization failed. This is likely due to invalid credentials in your src/lib/firebase.ts file.", error);
    // Re-throw the error so the calling context knows initialization failed.
    throw error;
  }
}
