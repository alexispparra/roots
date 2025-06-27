
"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Loader2 } from "lucide-react";

const ErrorPanel = ({ title, message }: { title: string, message: React.ReactNode }) => {
    return (
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
    )
}

export function AppContent({ children }: { children: React.ReactNode }) {
  const { configError, loading } = useAuth();

  if (loading) {
     return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (configError) {
    return (
        <ErrorPanel
            title="Error Crítico de Configuración de Firebase"
            message={
                <>
                    <p>{configError}</p>
                    <p style={{ marginTop: "1rem" }}><strong>La Solución Final y Definitiva:</strong></p>
                    <ol style={{ listStyleType: 'decimal', paddingLeft: '2rem', marginTop: '0.5rem' }}>
                        <li>Abre el archivo: <code style={{ backgroundColor: '#4a5568', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.95em' }}>src/lib/firebase.ts</code></li>
                        <li>Dentro de ese archivo, rellena los valores "REEMPLAZA_CON_TU_..." con tus credenciales reales de Firebase.</li>
                        <li>Guarda el archivo y vuelve a desplegar la aplicación (o reinicia el servidor local).</li>
                    </ol>
                </>
            }
        />
    )
  }

  return <>{children}</>;
}
