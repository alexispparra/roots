
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseInstances } from '@/lib/firebase';

// --- Type Definition ---
type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
  configError: string | null;
};

// --- Context Object ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Production-Ready Firebase Auth Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const firebase = getFirebaseInstances();
    
    if (!firebase) {
      // Instead of a generic message, create a detailed diagnostic string.
      // This will be parsed by the AppContent component to show a debug table.
      const config = {
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };
      const debugString = JSON.stringify(config);
      setConfigError("FIREBASE_CONFIG_ERROR:::" + debugString);
      setLoading(false);
      return;
    }

    let unsubscribe: () => void;
    
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        setUser(user);
        
        const adminEmail = process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL;
        if (user && adminEmail && user.email === adminEmail) {
          setIsAppAdmin(true);
        } else {
          setIsAppAdmin(false);
        }

        setLoading(false);
      });
    }).catch(error => {
      console.error("Critical Error: Failed to load Firebase auth modules.", error);
      setConfigError("Error irrecuperable al cargar los módulos de Firebase. Revisa la consola del navegador y del servidor para más detalles.");
      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAppAdmin, configError }}>
      {children}
    </AuthContext.Provider>
  );
};


// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
