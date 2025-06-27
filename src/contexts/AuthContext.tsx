"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import type { User, Auth, AuthProvider as FirebaseAuthProvider, UserCredential } from 'firebase/auth';
import { getFirebaseInstances, APP_ADMIN_EMAIL } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
  configError: string | null;
  auth: Auth | null;
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
  const [configError, setConfigError] = useState<string | null>(null);
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);

  useEffect(() => {
    let firebase;
    try {
      firebase = getFirebaseInstances();
      if (!firebase) {
        throw new Error("La configuración de Firebase no está disponible.");
      }
      setFirebaseAuth(firebase.auth);
      setConfigError(null);
    } catch (error: any) {
      console.error("CRITICAL: Firebase initialization failed.", error.message);
      setConfigError(error.message);
      setLoading(false);
      return;
    }

    const authModulePromise = import('firebase/auth');
    
    authModulePromise.then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
        setUser(currentUser);
        const adminEmail = APP_ADMIN_EMAIL || "";
        setIsAppAdmin(!!(currentUser && adminEmail && currentUser.email === adminEmail && !adminEmail.startsWith("REEMPLAZA")));
        setLoading(false);
      });
      return () => unsubscribe();
    }).catch(err => {
        console.error("Failed to load firebase/auth module", err);
        setConfigError("Error crítico al cargar los módulos de Firebase.");
        setLoading(false);
    });

  }, []);

  const authOperations = useMemo(() => {
    if (!firebaseAuth) return {
      signOut: async () => {},
      signInWithEmail: async () => { throw new Error("Auth not initialized")},
      signInWithGoogle: async () => { throw new Error("Auth not initialized")},
      registerWithEmail: async () => { throw new Error("Auth not initialized")},
      updateUserProfile: async () => { throw new Error("Auth not initialized")},
      sendPasswordReset: async () => { throw new Error("Auth not initialized")},
      reauthenticateAndPasswordChange: async () => { throw new Error("Auth not initialized")},
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
    auth: firebaseAuth,
    ...authOperations
  };

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