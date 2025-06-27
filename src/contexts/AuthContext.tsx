
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getFirebaseInstances, APP_ADMIN_EMAIL } from '@/lib/firebase';

// --- Error Panel Component ---
// Self-contained for simplicity.
const ErrorPanel = ({ title, message }: { title: string, message: React.ReactNode }) => (
    <div style={{
        fontFamily: "sans-serif",
        backgroundColor: "#1a202c",
        color: "#e2e8f0",
        padding: "2rem",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        <div style={{ maxWidth: "650px", lineHeight: "1.7", border: "1px solid #4a5568", padding: "2rem", borderRadius: "0.5rem", backgroundColor: "#2d3748" }}>
            <h1 style={{ color: "#f56565", fontSize: "1.75rem", marginBottom: "1rem", borderBottom: "1px solid #4a5568", paddingBottom: "0.5rem" }}>
              {title}
            </h1>
            <div style={{ color: "#cbd5e0", fontSize: "1.1rem" }}>
              {message}
            </div>
        </div>
    </div>
);


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
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    // This effect now robustly handles initialization.
    try {
      const firebase = getFirebaseInstances();
      // If getFirebaseInstances succeeds, we proceed. If it fails, it throws and we catch.
      
      const authModulePromise = import('firebase/auth');
      
      authModulePromise.then(({ onAuthStateChanged }) => {
        const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
          setUser(currentUser);
          
          const adminEmail = APP_ADMIN_EMAIL || "";
          setIsAppAdmin(!!(currentUser && adminEmail && currentUser.email === adminEmail && !adminEmail.startsWith("REEMPLAZA")));
          
          setLoading(false);
        });

        // Cleanup subscription on component unmount
        return () => unsubscribe();
      }).catch(err => {
         // This would be a bundler error, highly unlikely.
         console.error("Failed to load firebase/auth module", err);
         setInitializationError("Error crítico al cargar los módulos de Firebase.");
         setLoading(false);
      });

    } catch (error: any) {
      console.error("Firebase Initialization Failed:", error.message);
      // Set a user-friendly error message to be displayed.
      setInitializationError(error.message || "Error al inicializar Firebase. Revisa las credenciales.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    // Render nothing or a minimal loader until initialization is complete or fails
    return null; 
  }
  
  if (initializationError) {
    return (
        <ErrorPanel
            title="Error Crítico de Configuración de Firebase"
            message={
                <>
                    <p>{initializationError}</p>
                    <p style={{ marginTop: "1rem" }}><strong>La Solución Final y Definitiva:</strong></p>
                    <ol style={{ listStyleType: 'decimal', paddingLeft: '2rem', marginTop: '0.5rem' }}>
                        <li>Abre el archivo: <code style={{ backgroundColor: '#4a5568', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.95em' }}>src/lib/firebase.ts</code></li>
                        <li>Dentro de ese archivo, rellena los valores "REEMPLAZA_CON_TU_..." con tus credenciales reales de Firebase.</li>
                        <li>Guarda el archivo y vuelve a desplegar la aplicación.</li>
                    </ol>
                </>
            }
        />
    );
  }

  const value = { user, loading, isAppAdmin };

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
