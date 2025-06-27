
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseInstances, APP_ADMIN_EMAIL } from '@/lib/firebase';

// --- Type Definition ---
type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
  configError: boolean;
};

// --- Context Object ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Production-Ready Firebase Auth Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [configError, setConfigError] = useState<boolean>(false);

  useEffect(() => {
    // This logic now runs only on the client, preventing hydration errors.
    const firebase = getFirebaseInstances();

    if (!firebase) {
      // If instances are null, it means the config is invalid or initialization failed.
      setConfigError(true);
      setLoading(false);
      return;
    }
    
    // If we get here, config is valid and Firebase is initialized.
    let unsubscribe: () => void;
    
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        setUser(user);
        
        // Use a safe check for APP_ADMIN_EMAIL
        const adminEmail = APP_ADMIN_EMAIL || "";
        if (user && adminEmail && user.email === adminEmail && !adminEmail.startsWith("REEMPLAZA")) {
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

  const value = { user, loading, isAppAdmin, configError };

  return (
    <AuthContext.Provider value={value}>
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
