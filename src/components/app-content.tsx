
"use client";

import { useAuth } from "@/contexts/AuthContext";
import React from "react";

const ConfigValue = ({ value }: { value: string | undefined }) => {
    if (value === undefined || value === "") {
        return <span style={{ color: '#e53e3e' }}>🔴 No Encontrada</span>;
    }
    if (value.startsWith('REEMPLAZA')) {
        return <span style={{ color: '#dd6b20' }}>🟡 Placeholder Detectado</span>;
    }
    const visiblePart = value.substring(0, 4);
    return <span style={{ color: '#38a169' }}>✅ Encontrada (empieza con: {visiblePart}...)</span>;
};

const ErrorPanel = ({ title, message, steps, debugConfig }: { title: string, message: string, steps: string[], debugConfig?: Record<string, string | undefined> }) => {
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
                <h2 style={{color: '#90cdf4', fontSize: '1.25rem', marginBottom: '1rem'}}>Pasos para Solucionarlo:</h2>
                <ol style={{ listStyle: 'decimal inside', paddingLeft: '0', margin: '0' }}>
                    {steps.map((step, index) => (
                        <li key={index} style={{ marginBottom: '0.75rem' }}>{step}</li>
                    ))}
                </ol>
            </div>
            
            {debugConfig && (
                <div style={{ textAlign: 'left', backgroundColor: '#2d3748', padding: '1.5rem', borderRadius: '8px', maxWidth: '800px', width: '100%' }}>
                    <h2 style={{ color: '#90cdf4', fontSize: '1.25rem', marginBottom: '1rem' }}>Panel de Diagnóstico en Vivo</h2>
                    <p style={{fontSize: '0.9rem', color: '#a0aec0', marginBottom: '1.5rem'}}>
                        Esto es lo que la aplicación está recibiendo del entorno. Compara estos estados con tu archivo <strong>.env</strong>.
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <tbody>
                            {Object.entries(debugConfig).map(([key, value]) => (
                                <tr key={key} style={{ borderBottom: '1px solid #4a5568' }}>
                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#a0aec0' }}>{key}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace' }}><ConfigValue value={value} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

             <p style={{marginTop: '2rem', fontSize: '0.9rem', color: '#a0aec0'}}>
                <b>Nota del Asistente (Yo, la IA):</b> Mis disculpas por los repetidos fracasos. En lugar de adivinar, esta pantalla ahora te muestra exactamente lo que la aplicación ve (o no ve), permitiéndonos resolver el problema juntos. El error está casi con seguridad en el archivo `.env`.
            </p>
        </div>
    )
}

export function AppContent({ children }: { children: React.ReactNode }) {
  const { configError, debugConfig } = useAuth();

  if (configError) {
    return (
        <ErrorPanel
            title="Error Crítico de Configuración de Firebase"
            message="La aplicación no puede conectar con Firebase porque las credenciales no están configuradas correctamente en el entorno. Revisa el panel de diagnóstico de abajo para identificar la clave que está fallando."
            steps={[
                "Asegúrate de que el archivo `.env` exista en la raíz de tu proyecto.",
                "Compara los valores de tu archivo `.env` con los resultados del panel de diagnóstico.",
                "Corrige cualquier valor que esté 'No Encontrada' o que sea un 'Placeholder' en tu archivo `.env`.",
                "Si hiciste cambios, por favor, vuelve a desplegar la aplicación.",
            ]}
            debugConfig={debugConfig}
        />
    )
  }

  return <>{children}</>;
}
