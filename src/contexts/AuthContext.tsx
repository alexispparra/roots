
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { USE_MOCK_DATA, mockUser } from '@/lib/mock-data';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setUser(mockUser);
      setIsAppAdmin(true); // Simulate admin user for testing
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

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
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAppAdmin }}>
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
