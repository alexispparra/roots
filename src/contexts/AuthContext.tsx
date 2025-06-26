
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseInstances } from '@/lib/firebase';

// --- Type Definition ---
type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAppAdmin: boolean;
  configError: string | null;
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
    const firebase = getFirebaseInstances();
    
    if (!firebase) {
      setConfigError(
        "La aplicación no puede conectar con Firebase porque las credenciales no están configuradas en el entorno. " +
        "Esto es un problema de configuración del despliegue, no un error en el código de la aplicación. " +
        "La aplicación no puede funcionar sin estas claves."
      );
      setLoading(false);
      return;
    }

    let unsubscribe: () => void;
    
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        setUser(user);
        
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
      setConfigError("Error irrecuperable al cargar los módulos de Firebase. Revisa la consola del navegador y del servidor para más detalles.");
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
