
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

// This check is crucial for local development vs. deployed environment.
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (getApps().length === 0) {
    if (isConfigured) {
        // If we have keys, we're in a configured local environment.
        app = initializeApp(firebaseConfig);
    } else {
        // If we DON'T have keys, we might be in a deployed App Hosting environment
        // OR an unconfigured local one.
        // initializeApp({}) works for App Hosting but throws an error locally.
        // We wrap this in a try-catch to handle the local case gracefully.
        try {
            app = initializeApp({});
        } catch (e) {
            console.error("Firebase initialization failed. This is expected if you are running locally without a .env file. The app will run in a read-only demonstration mode.");
            // app, auth, and db will remain null.
        }
    }
} else {
    app = getApp();
}

// Only try to get services if the app was successfully initialized.
if (app) {
    try {
        auth = getAuth(app);
        db = getFirestore(app);
    } catch(e) {
        console.error("Failed to initialize Firebase services.", e)
        auth = null;
        db = null;
    }
}

export { app, auth, db };
