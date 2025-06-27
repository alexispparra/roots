
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseInstances, APP_ADMIN_EMAIL } from '@/lib/firebase';

// --- Type Definition ---
type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
  configError: string | null; // Export the error state
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
    // This effect now robustly handles initialization.
    try {
      // The getFirebaseInstances function is now the single source of truth for validation.
      // If it throws, we catch it and display the error.
      const firebase = getFirebaseInstances();
      
      // We only proceed if we get valid instances.
      const authModulePromise = import('firebase/auth');
      
      authModulePromise.then(({ onAuthStateChanged }) => {
        const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
          setUser(currentUser);
          
          // The admin email might also be a placeholder, so we check that too.
          const adminEmail = APP_ADMIN_EMAIL || "";
          setIsAppAdmin(!!(currentUser && adminEmail && currentUser.email === adminEmail && !adminEmail.startsWith("REEMPLAZA")));
          
          setLoading(false);
          setConfigError(null); // Clear error on success
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
      }).catch(err => {
         // This would be a bundler error, highly unlikely.
         console.error("Failed to load firebase/auth module", err);
         setConfigError("Error crítico al cargar los módulos de Firebase.");
         setLoading(false);
      });

    } catch (error: any) {
      console.error("Firebase Initialization Failed:", error.message);
      // Set the user-friendly error message caught from getFirebaseInstances.
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


// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
