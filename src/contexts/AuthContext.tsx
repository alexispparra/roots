
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseInstances, APP_ADMIN_EMAIL, firebaseConfig } from '@/lib/firebase';

// --- Type Definition ---
type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
  configError: boolean;
};

// --- Context Object ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A robust check to ensure all required firebase config values are present
// and are not the placeholder values. This is now a standalone function.
const isFirebaseConfigured = () => {
    return (
        firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("REEMPLAZA_CON_TU_") &&
        firebaseConfig.authDomain && !firebaseConfig.authDomain.startsWith("REEMPLAZA_CON_TU_") &&
        firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("REEMPLAZA_CON_TU_")
    );
}

// --- Production-Ready Firebase Auth Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  // configError is now determined within the component's lifecycle, not at the module level.
  const [configError, setConfigError] = useState<boolean>(false);


  useEffect(() => {
    // The check now happens here, inside the effect, ensuring it runs
    // after the environment has been fully loaded.
    if (!isFirebaseConfigured()) {
        setConfigError(true);
        setLoading(false);
        return;
    }

    const firebase = getFirebaseInstances();
    // If initialization itself fails, it's also a config error.
    if (!firebase) {
        setConfigError(true);
        setLoading(false);
        return;
    }
    
    let unsubscribe: () => void;
    
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        setUser(user);
        
        if (user && APP_ADMIN_EMAIL && user.email === APP_ADMIN_EMAIL && !APP_ADMIN_EMAIL.startsWith("REEMPLAZA")) {
          setIsAppAdmin(true);
        } else {
          setIsAppAdmin(false);
        }

        setLoading(false);
      });
    }).catch(error => {
      console.error("Critical Error: Failed to load Firebase auth modules.", error);
      setConfigError(true);
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
