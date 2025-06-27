import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- DYNAMIC CONFIGURATION FROM ENVIRONMENT VARIABLES ---
// This is the standard and most secure way for Next.js applications.
// The configuration is loaded from the `.env` file.

const firebaseConfig = {
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
 * A robust function to get initialized Firebase services.
 * It ensures Firebase is initialized only once and that the configuration is valid.
 * Throws an error if configuration is invalid, allowing the caller to handle it.
 * @returns An object with Firebase services { app, auth, db }.
 */
export function getFirebaseInstances() {
  // If an instance already exists, return it to avoid re-initializing.
  if (firebaseInstances) {
    return firebaseInstances;
  }
  
  // --- TEMPORARY DEBUGGING LOG ---
  // This will print the environment variables to the server logs
  // to help us verify they are being loaded correctly.
  console.log("--- Firebase Config Loaded by App ---");
  console.log("API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log("Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log("-------------------------------------");
  // --- END DEBUGGING LOG ---

  try {
    // Pass the config object directly to the Firebase SDK.
    // If any key is missing or invalid, initializeApp will throw a specific and useful error.
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Store the initialized instances for subsequent calls.
    firebaseInstances = { app, auth, db };
    return firebaseInstances;

  } catch (error: any) {
    // Catch the specific error from the Firebase SDK and re-throw it.
    // This provides a much more informative error message to the user
    // than a generic "configuration is missing" message.
    console.error("CRITICAL: Firebase initialization failed.", error.message);
    // Re-throwing the original error is crucial for the AuthContext to catch it.
    throw new Error(error.message); 
  }
}
