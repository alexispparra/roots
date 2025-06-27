"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import type { User, Auth, UserCredential } from 'firebase/auth';
import { getFirebaseInstances, APP_ADMIN_EMAIL } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
  configError: { message: string, debugInfo?: string } | null;
  signOut: () => Promise<void>;
  signInWithEmail: (email:string, password:string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  registerWithEmail: (email:string, password:string) => Promise<UserCredential>;
  updateUserProfile: (user: User, profileData: { displayName?: string, photoURL?: string }) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  reauthenticateAndPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [configError, setConfigError] = useState<{ message: string, debugInfo?: string } | null>(null);
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);

  useEffect(() => {
    try {
      // Attempt to initialize Firebase. If it fails, the error will be caught.
      const firebase = getFirebaseInstances();
      setFirebaseAuth(firebase.auth);
      setConfigError(null);
      
      // Dynamically import auth functions and set up the listener.
      const authModulePromise = import('firebase/auth');
      authModulePromise.then(({ onAuthStateChanged }) => {
        const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
          setUser(currentUser);
          const adminEmail = APP_ADMIN_EMAIL || "";
          setIsAppAdmin(!!(currentUser && adminEmail && currentUser.email === adminEmail && !adminEmail.startsWith("REEMPLAZA")));
          setLoading(false);
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
      }).catch(err => {
          console.error("Failed to load firebase/auth module", err);
          setConfigError({ message: "Error crítico al cargar los módulos de Firebase." });
          setLoading(false);
      });

    } catch (error: any) {
      // If getFirebaseInstances throws, it's a configuration error.
      // We capture the REAL error message from the Firebase SDK here.
      console.error("Caught Firebase initialization error in AuthContext:", error.message);
      
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const keySnippet = apiKey ? `Leída: "${apiKey.substring(0, 5)}...${apiKey.slice(-5)}"` : "No Leída";

      setConfigError({
        message: error.message,
        debugInfo: `Valor de NEXT_PUBLIC_FIREBASE_API_KEY - ${keySnippet}`
      });
      setLoading(false);
    }
  }, []);

  // useMemo ensures that our auth operation functions are stable and don't cause
  // unnecessary re-renders in consumer components.
  const authOperations = useMemo(() => {
    if (!firebaseAuth) return {
      signOut: async () => { throw new Error("Firebase no inicializado")},
      signInWithEmail: async () => { throw new Error("Firebase no inicializado")},
      signInWithGoogle: async () => { throw new Error("Firebase no inicializado")},
      registerWithEmail: async () => { throw new Error("Firebase no inicializado")},
      updateUserProfile: async () => { throw new Error("Firebase no inicializado")},
      sendPasswordReset: async () => { throw new Error("Firebase no inicializado")},
      reauthenticateAndPasswordChange: async () => { throw new Error("Firebase no inicializado")},
    };

    return {
      signOut: async () => {
        const { signOut } = await import('firebase/auth');
        return signOut(firebaseAuth);
      },
      signInWithEmail: async (email:string, password:string) => {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        return signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      signInWithGoogle: async () => {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        return signInWithPopup(firebaseAuth, provider);
      },
      registerWithEmail: async (email:string, password:string) => {
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          return createUserWithEmailAndPassword(firebaseAuth, email, password);
      },
      updateUserProfile: async (userToUpdate: User, profileData: { displayName?: string, photoURL?: string }) => {
        const { updateProfile } = await import('firebase/auth');
        return updateProfile(userToUpdate, profileData);
      },
      sendPasswordReset: async (email: string) => {
        const { sendPasswordResetEmail } = await import("firebase/auth");
        return sendPasswordResetEmail(firebaseAuth, email);
      },
      reauthenticateAndPasswordChange: async (currentPassword: string, newPassword: string) => {
          if (!firebaseAuth.currentUser || !firebaseAuth.currentUser.email) {
              throw new Error("Usuario no autenticado o sin email.");
          }
          const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import("firebase/auth");
          const credential = EmailAuthProvider.credential(firebaseAuth.currentUser.email, currentPassword);
          await reauthenticateWithCredential(firebaseAuth.currentUser, credential);
          return updatePassword(firebaseAuth.currentUser, newPassword);
      }
    };
  }, [firebaseAuth]);
  
  const value: AuthContextType = {
    user,
    loading,
    isAppAdmin,
    configError,
    ...authOperations
  };

  // While checking auth state, show a loader to prevent screen flicker.
  // We don't render children until loading is false.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
