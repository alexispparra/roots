
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

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// This check is crucial. It ensures we only try to initialize Firebase
// if the necessary configuration is provided.
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (isConfigured) {
    try {
        if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (error) {
        console.error("Firebase initialization error:", error);
        // If initialization fails, fall back to demo mode.
        app = null;
        auth = null;
        db = null;
    }
}

if (!app) {
    // This message is helpful for local development.
    // In a deployed App Hosting environment, the config should always be present.
    console.warn("Firebase not configured or initialization failed. The app will run in a read-only demonstration mode.");
}


export { app, auth, db };
