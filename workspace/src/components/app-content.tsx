
"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";

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
  const { configError } = useAuth();

  if (configError) {
    return (
        <ErrorPanel
            title="Error Crítico de Configuración de Firebase"
            message={
                <>
                    <p>La aplicación no puede conectar con Firebase porque las credenciales no están configuradas en el entorno. Esto suele deberse a un problema con el archivo <strong>.env</strong>.</p>
                    <p style={{ marginTop: "1rem" }}><strong>Pasos para Solucionarlo:</strong></p>
                    <ul style={{ listStyleType: 'decimal', paddingLeft: '2rem', marginTop: '0.5rem' }}>
                        <li>Asegúrate de que el archivo <strong>.env</strong> exista en la raíz de tu proyecto.</li>
                        <li>Verifica que todas las variables <code>NEXT_PUBLIC_...</code> dentro del archivo <strong>.env</strong> tengan valores válidos y no los placeholders "REEMPLAZA_CON_TU...".</li>
                        <li>Si hiciste cambios en el archivo <strong>.env</strong>, por favor, vuelve a desplegar la aplicación para que tome los nuevos valores.</li>
                    </ul>
                </>
            }
        />
    )
  }

  return <>{children}</>;
}
