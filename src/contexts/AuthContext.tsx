"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseInstances, APP_ADMIN_EMAIL } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
  configError: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // This is the single point of truth for initialization.
      // If it throws, we catch it and set the error state.
      const firebase = getFirebaseInstances();
      
      const authModulePromise = import('firebase/auth');
      
      authModulePromise.then(({ onAuthStateChanged }) => {
        const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
          setUser(currentUser);
          
          const adminEmail = APP_ADMIN_EMAIL || "";
          setIsAppAdmin(!!(currentUser && adminEmail && currentUser.email === adminEmail && !adminEmail.startsWith("REEMPLAZA")));
          
          setLoading(false);
          setConfigError(null); // Clear error on successful auth state change
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
      }).catch(err => {
         console.error("Failed to load firebase/auth module", err);
         setConfigError("Error crítico al cargar los módulos de Firebase.");
         setLoading(false);
      });

    } catch (error: any) {
      console.error("Caught Firebase Initialization Error in AuthContext:", error.message);
      // Set the user-friendly error message from the exception thrown by getFirebaseInstances.
      setConfigError(error.message);
      setLoading(false);
    }
  }, []);
  
  const value = { user, loading, isAppAdmin, configError };

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
