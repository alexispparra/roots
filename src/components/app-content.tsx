
"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";

const ErrorPanel = ({ message }: { message: string }) => {
    return (
         <div style={{
            fontFamily: "sans-serif",
            backgroundColor: "#111",
            color: "#ffcdd2",
            padding: "2rem",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            lineHeight: "1.6",
        }}>
            <h1 style={{ color: "#ef5350", fontSize: "1.5rem", marginBottom: "1rem" }}>
              Error Crítico de la Aplicación
            </h1>
            <p style={{ maxWidth: "800px", marginBottom: "2rem", color: "#e0e0e0" }}>
                {message}
            </p>
        </div>
    )
}

export function AppContent({ children }: { children: React.ReactNode }) {
  const { configError } = useAuth();

  if (configError) {
    return <ErrorPanel message="La aplicación no pudo inicializar Firebase. Revisa la consola del navegador para ver detalles técnicos." />;
  }

  return <>{children}</>;
}
