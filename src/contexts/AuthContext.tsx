
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseInstances } from '@/lib/firebase';
import { USE_MOCK_DATA, mockUser } from '@/lib/mock-data';

// --- Type Definition ---
type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
};

// --- Context Object ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Mock Provider ---
// Contains NO Firebase code. Safe to run anywhere.
const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockUser); // Start with mock user logged in
  const [loading, setLoading] = useState(false); // Mock is never loading
  const [isAppAdmin, setIsAppAdmin] = useState(true); // Mock user is admin

  return (
    <AuthContext.Provider value={{ user, loading, isAppAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Firebase Provider ---
// Contains all Firebase logic. Only runs if USE_MOCK_DATA is false.
const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);

  useEffect(() => {
    const firebase = getFirebaseInstances();
    if (!firebase) {
      setLoading(false);
      return;
    }

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

// --- Main Provider ---
// This is the component you'll use in your layout.
// It decides whether to use the Mock or Firebase provider.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  if (USE_MOCK_DATA) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
};


// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
