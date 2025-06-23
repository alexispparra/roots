
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    // If firebase is not configured, we're not loading and there's no user.
    // The app will run in demo mode.
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

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If Firebase is configured, and we're done loading, and there's no user, redirect to login.
        if (auth && !loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // If Firebase is configured and we're loading, or if there's no user yet (and we're not yet redirecting), show a loader.
    if (auth && (loading || !user)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // If Firebase is not configured, or if we have a user, show the content.
    return <>{children}</>;
};
