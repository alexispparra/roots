
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


// --- Firebase Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);

  useEffect(() => {
    // Attempt to get Firebase instances. If not configured, this will return null.
    const firebase = getFirebaseInstances();

    // If Firebase is not configured, we stop loading and set user to null.
    // This is the safe path that prevents crashes.
    if (!firebase) {
        setLoading(false);
        setUser(null);
        setIsAppAdmin(false);
        return;
    }

    // If Firebase is configured, dynamically import auth functions and set up the listener.
    let unsubscribe: () => void;
    import('firebase/auth').then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
            setUser(user);
            if (user && process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL && user.email === process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL) {
                setIsAppAdmin(true);
            } else {
                setIsAppAdmin(false);
            }
            setLoading(false);
        });
    }).catch(error => {
        console.error("Failed to load Firebase auth modules", error);
        setLoading(false);
    });

    // Cleanup subscription on unmount
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
