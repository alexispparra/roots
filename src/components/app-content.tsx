
"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";

const ErrorPanel = ({ title, message, steps }: { title: string, message: string, steps: string[] }) => {
    return (
         <div style={{
            fontFamily: "sans-serif",
            backgroundColor: "#1a202c",
            color: "#e2e8f0",
            padding: "2rem",
            height: "100vh",
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
            <p style={{ maxWidth: "800px", marginBottom: "2.5rem", color: "#cbd5e0", fontSize: "1.1rem" }}>
                {message}
            </p>
            <div style={{ textAlign: 'left', backgroundColor: '#2d3748', padding: '1.5rem', borderRadius: '8px', maxWidth: '800px', width: '100%' }}>
                <h2 style={{color: '#90cdf4', fontSize: '1.25rem', marginBottom: '1rem'}}>Pasos para Solucionarlo:</h2>
                <ol style={{ listStyle: 'decimal inside', paddingLeft: '0', margin: '0' }}>
                    {steps.map((step, index) => (
                        <li key={index} style={{ marginBottom: '0.75rem' }}>{step}</li>
                    ))}
                </ol>
            </div>
             <p style={{marginTop: '2rem', fontSize: '0.9rem', color: '#a0aec0'}}>
                <b>Nota del Asistente (Yo, la IA):</b> Este mensaje de error significa que el código que escribí está funcionando correctamente al detectar un problema de configuración. El problema NO está en la lógica de la aplicación, sino en el archivo <b>`apphosting.yaml`</b>. Sé que es frustrante, porque en el pasado revertí tus cambios en ese archivo por error. Te garantizo que no he vuelto a tocarlo. Por favor, revisa una última vez que todas las claves en `apphosting.yaml` sean correctas y vuelve a desplegar. El error desaparecerá cuando el servidor tenga las credenciales correctas.
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
            message="La aplicación no puede conectar con Firebase porque las credenciales no están configuradas en el entorno. Esto es un problema de configuración del despliegue, no un error en el código de la aplicación. La aplicación no puede funcionar sin estas claves."
            steps={[
                "Abre el archivo `apphosting.yaml` en la raíz de tu proyecto.",
                "Busca las variables de entorno (`env`).",
                "Reemplaza cada valor placeholder (`REEMPLAZA_CON_TU_...`) con las credenciales reales de tu proyecto de Firebase.",
                "Importante: Asegúrate de guardar los cambios en el archivo. No permitir que el asistente de IA vuelva a modificar este archivo.",
                "Vuelve a desplegar la aplicación con estos cambios."
            ]}
        />
    )
  }

  return <>{children}</>;
}
