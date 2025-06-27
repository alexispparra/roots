import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- CONFIGURACIÓN DIRECTA Y CENTRALIZADA ---
// Por favor, rellena tus credenciales de Firebase aquí. Esta es ahora la
// única fuente de verdad para la configuración de la aplicación.
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
 * Initializes and returns Firebase services. Throws an error if configuration is invalid or connection fails.
 * This is the single source of truth for Firebase initialization.
 * @returns An object with Firebase services { app, auth, db }.
 */
export function getFirebaseInstances() {
  // If an instance already exists, return it to prevent re-initialization.
  if (firebaseInstances) {
    return firebaseInstances;
  }
  
  // Definitive check for placeholder values.
  const isConfigured = 
      firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      !firebaseConfig.apiKey.startsWith("REEMPLAZA_CON_TU_");

  if (!isConfigured) {
    // This error is clear: the user has not replaced the placeholder values.
    throw new Error("La configuración de Firebase en 'src/lib/firebase.ts' no está completa. Por favor, reemplaza los valores de ejemplo con tus credenciales reales.");
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Store the successfully created instances.
    firebaseInstances = { app, auth, db };
    return firebaseInstances;

  } catch (error: any) {
    // If the Firebase SDK itself throws an error, we catch it and re-throw a more user-friendly message.
    console.error("CRITICAL: Firebase initialization failed. This is likely due to invalid credentials in your src/lib/firebase.ts file.", error);
    throw new Error(`Error de inicialización de Firebase: ${error.message}. Revisa que las credenciales en 'src/lib/firebase.ts' sean correctas y válidas.`);
  }
}
