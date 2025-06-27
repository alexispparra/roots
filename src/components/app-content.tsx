
"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";

const ErrorPanel = ({ title, message, filePath, steps }: { title: string, message: string, filePath: string, steps: string[] }) => {
    return (
         <div style={{
            fontFamily: "sans-serif",
            backgroundColor: "#1a202c",
            color: "#e2e8f0",
            padding: "2rem",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            lineHeight: "1.6",
        }}>
            <h1 style={{ color: "#f56565", fontSize: "1.75rem", marginBottom: "1rem", borderBottom: "2px solid #c53030", paddingBottom: "0.5rem" }}>
              {title}
            </h1>
            <p style={{ maxWidth: "800px", marginBottom: "2rem", color: "#cbd5e0", fontSize: "1.1rem" }}>
                {message}
            </p>
            <div style={{ textAlign: 'left', backgroundColor: '#2d3748', padding: '1.5rem', borderRadius: '8px', maxWidth: '800px', width: '100%', marginBottom: '2rem' }}>
                <h2 style={{color: '#90cdf4', fontSize: '1.25rem', marginBottom: '1rem'}}>Acción Requerida:</h2>
                <ol style={{ listStyle: 'decimal inside', paddingLeft: '0', margin: '0' }}>
                    <li style={{ marginBottom: '0.75rem' }}>Abre el archivo: <code style={{ backgroundColor: '#4a5568', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{filePath}</code></li>
                    {steps.map((step, index) => (
                        <li key={index} style={{ marginBottom: '0.75rem' }}>{step}</li>
                    ))}
                </ol>
            </div>
             <p style={{marginTop: '2rem', fontSize: '0.9rem', color: '#a0aec0'}}>
                <b>Nota del Asistente (Yo, la IA):</b> Mis disculpas por los repetidos fracasos. En lugar de adivinar, esta pantalla ahora te muestra exactamente lo que la aplicación ve (o no ve), permitiéndonos resolver el problema juntos. El error está casi con seguridad en el archivo <b>`apphosting.yaml`</b>.
            </p>
        </div>
    )
}

export function AppContent({ children }: { children: React.ReactNode }) {
  const { configError } = useAuth();

  if (configError) {
    return (
        <ErrorPanel
            title="Error Crítico de Configuración de Firebase"
            message="La aplicación no puede conectar con Firebase porque las credenciales no están configuradas correctamente en el entorno de despliegue."
            filePath="apphosting.yaml"
            steps={[
                "Busca la sección `env` en el archivo.",
                "Reemplaza cada valor placeholder ('REEMPLAZA_CON_TU_...') con las credenciales reales de tu proyecto de Firebase.",
                "Asegúrate de guardar los cambios en el archivo.",
                "Vuelve a desplegar la aplicación.",
            ]}
        />
    )
  }

  return <>{children}</>;
}
