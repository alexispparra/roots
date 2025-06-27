"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";

const ErrorPanel = ({ title, message, errorCode }: { title: string, message: React.ReactNode, errorCode: string }) => {
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
                   <p style={{ marginTop: "1rem" }}><strong>Mensaje de error del SDK de Firebase:</strong></p>
                    <pre style={{ backgroundColor: '#4a5568', padding: '0.5rem 0.8rem', borderRadius: '0.25rem', fontSize: '0.9em', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: '0.5rem' }}>
                        <code>{errorCode}</code>
                    </pre>
                </div>
            </div>
        </div>
    )
}

export function AppContent({ children }: { children: React.ReactNode }) {
  const { configError } = useAuth();

  if (configError) {
    return (
        <ErrorPanel
            title="Error de Conexión con Firebase"
            errorCode={configError}
            message={
                <>
                    <p>La aplicación no pudo inicializar Firebase. Esto casi siempre se debe a un problema con las credenciales de configuración en tu archivo <strong>.env</strong>.</p>
                    <p style={{ marginTop: "1rem" }}><strong>Cómo solucionarlo:</strong></p>
                    <ol style={{ listStyleType: 'decimal', paddingLeft: '2rem', marginTop: '0.5rem' }}>
                        <li>Abre el archivo <strong>.env</strong> en la raíz de tu proyecto.</li>
                        <li>Compara cuidadosamente cada clave (<code>NEXT_PUBLIC_FIREBASE_API_KEY</code>, etc.) con los valores que te proporciona tu Firebase Console para asegurarte de que no haya errores de tipeo.</li>
                        <li>El mensaje de error de abajo te dará la pista más importante (ej: `Firebase: Error (auth/invalid-api-key)` te indica que la API Key es incorrecta).</li>
                        <li>Si realizaste cambios, vuelve a desplegar la aplicación para que tome los nuevos valores.</li>
                    </ol>
                </>
            }
        />
    )
  }

  return <>{children}</>;
}