
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseInstances } from '@/lib/firebase';

// --- Type Definition ---
type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
};

// --- Context Object ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Production-Ready Firebase Auth Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);

  useEffect(() => {
    const firebase = getFirebaseInstances();
    // If firebase is not configured, we are in a state where auth cannot function.
    // We stop loading and the user remains null.
    if (!firebase) {
      setLoading(false);
      return;
    }

    let unsubscribe: () => void;
    
    // Dynamically import auth functions to ensure they only run when firebase is available.
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        setUser(user);
        
        // Check if the logged-in user is the designated application admin.
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
    <AuthContext.Provider value={{ user, loading, isAppAdmin }}>
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
