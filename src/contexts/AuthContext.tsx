
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { USE_MOCK_DATA, mockUser } from '@/lib/mock-data';
import type { User } from 'firebase/auth';

// --- Type Definition ---
type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
};

// --- Context Object ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// --- Mock Provider ---
const AuthProviderMock = ({ children }: { children: ReactNode }) => {
  const [user] = useState<User | null>(mockUser);
  const [loading] = useState(false);
  const [isAppAdmin] = useState(true); // Simulate admin for testing

  return (
    <AuthContext.Provider value={{ user, loading, isAppAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};


// --- Firebase Provider ---
const AuthProviderFirebase = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);

  useEffect(() => {
    // Dynamic import of firebase modules only in the firebase provider
    Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase')
    ]).then(([{ onAuthStateChanged }, { auth }]) => {
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
              setUser(user);
              if (user && process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL && user.email === process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL) {
                  setIsAppAdmin(true);
              } else {
                  setIsAppAdmin(false);
              }
              setLoading(false);
            });
            return () => unsubscribe();
        } else {
            // This case handles when Firebase is not configured in .env
            setUser(null);
            setIsAppAdmin(false);
            setLoading(false);
        }
    }).catch(error => {
        // This case handles if the dynamic import itself fails
        console.error("Failed to load Firebase auth modules", error);
        setUser(null);
        setIsAppAdmin(false);
        setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAppAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};


// --- Main Exported Provider ---
// This determines which provider to use based on the configuration.
export const AuthProvider = USE_MOCK_DATA ? AuthProviderMock : AuthProviderFirebase;


// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
