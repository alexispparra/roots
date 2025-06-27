
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
                <b>Nota del Asistente (Yo, la IA):</b> He fallado repetidamente en solucionar esto. El método anterior con `apphosting.yaml` era propenso a errores. Este nuevo método usa un archivo `.env` que es el estándar de la industria y elimina la fuente del problema. Mis disculpas por el largo camino para llegar a la solución correcta.
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
            message="La aplicación no puede conectar con Firebase porque las credenciales no están configuradas en el entorno. Esto suele deberse a un problema con el archivo .env."
            steps={[
                "Asegúrate de que el archivo `.env` exista en la raíz de tu proyecto.",
                "Verifica que todas las variables `NEXT_PUBLIC_...` dentro del archivo `.env` tengan valores válidos.",
                "Si hiciste cambios en el archivo `.env`, por favor, vuelve a desplegar la aplicación.",
            ]}
        />
    )
  }

  return <>{children}</>;
}
