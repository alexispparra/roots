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

// This logic handles both local development (with .env) and deployed environments (App Hosting)
try {
  if (getApps().length > 0) {
    app = getApp();
  } else if (firebaseConfig.apiKey) {
    // Use environment variables for local development
    app = initializeApp(firebaseConfig);
  } else {
    // In a deployed Firebase environment (like App Hosting),
    // the SDK can be initialized without a config object.
    app = initializeApp({});
  }

  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
    // If initialization fails, app, auth, and db will remain null.
    // The UI is already designed to handle this and show demo mode messages.
    if (typeof window !== 'undefined') {
        console.log("Could not initialize Firebase. Running in demo mode.");
    }
}

export { app, auth, db };
