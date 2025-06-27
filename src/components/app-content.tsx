
"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";

const ErrorPanel = ({ title, message }: { title: string, message: string }) => {
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
            <div style={{ textAlign: "center", lineHeight: "1.6" }}>
                <h1 style={{ color: "#f56565", fontSize: "1.75rem", marginBottom: "1rem" }}>
                  {title}
                </h1>
                <p style={{ maxWidth: "600px", color: "#cbd5e0", fontSize: "1.1rem" }}>
                    {message}
                </p>
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
            message="La aplicación no puede conectar con Firebase porque las credenciales no están configuradas. Por favor, revisa que el archivo `.env` esté correctamente configurado con las claves de tu proyecto de Firebase."
        />
    )
  }

  return <>{children}</>;
}
