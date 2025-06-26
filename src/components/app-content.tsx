
"use client";

import { useAuth } from "@/contexts/AuthContext";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { configError } = useAuth();

  if (configError) {
    return (
      <div style={{
        fontFamily: "monospace",
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
          Error Crítico de Configuración de Firebase
        </h1>
        <p style={{ maxWidth: "800px", marginBottom: "2rem", color: "#e0e0e0" }}>
          {configError}
        </p>
        <div style={{ backgroundColor: "#212121", padding: "1.5rem", borderRadius: "8px", textAlign: "left", border: "1px solid #ef5350" }}>
          <h2 style={{ color: "#80cbc4", fontSize: "1.2rem", marginBottom: "1rem" }}>Pasos para Solucionarlo:</h2>
          <ol style={{ paddingLeft: "20px", margin: "0", color: "#f5f5f5" }}>
            <li style={{ marginBottom: "0.5rem" }}>Abre el archivo <code style={{ color: "#fff", backgroundColor: "#424242", padding: "2px 5px", borderRadius: "4px" }}>apphosting.yaml</code> en la raíz de tu proyecto.</li>
            <li style={{ marginBottom: "0.5rem" }}>Busca las variables de entorno (<code style={{color: "#ce93d8"}}>environmentVariables</code>) en las secciones <code style={{color: "#ce93d8"}}>build</code> y <code style={{color: "#ce93d8"}}>runConfig</code>.</li>
            <li style={{ marginBottom: "0.5rem" }}>Reemplaza cada valor placeholder (<code style={{ color: "#ffab91" }}>"REEMPLAZA_CON_TU_..."</code>) con las credenciales reales de tu proyecto de Firebase.</li>
            <li style={{ marginBottom: "0.5rem" }}><strong>Importante:</strong> Asegúrate de guardar los cambios en el archivo. No permitir que el asistente de IA vuelva a modificar este archivo.</li>
            <li>Vuelve a desplegar la aplicación con estos cambios.</li>
          </ol>
        </div>
         <p style={{marginTop: '2rem', fontSize: '0.9rem', color: '#9e9e9e'}}>
          Nota del Asistente: Pido disculpas. En revisiones anteriores, he revertido accidentalmente tus cambios en `apphosting.yaml`. Ese error ha sido corregido. No volveré a modificar ese archivo.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
