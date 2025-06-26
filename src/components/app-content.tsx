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
        <div style={{ backgroundColor: "#212121", padding: "1.5rem", borderRadius: "8px", textAlign: "left" }}>
          <h2 style={{ color: "#80cbc4", fontSize: "1.2rem", marginBottom: "1rem" }}>Pasos para Solucionarlo:</h2>
          <ol style={{ paddingLeft: "20px", margin: "0" }}>
            <li style={{ marginBottom: "0.5rem" }}>Abre el archivo <code style={{ color: "#fff", backgroundColor: "#424242", padding: "2px 5px", borderRadius: "4px" }}>apphosting.yaml</code> en la raíz de tu proyecto.</li>
            <li style={{ marginBottom: "0.5rem" }}>Busca las variables bajo <code style={{ color: "#fff", backgroundColor: "#424242", padding: "2px 5px", borderRadius: "4px" }}>environmentVariables</code> en las secciones <code style={{ color: "#fff", backgroundColor: "#424242", padding: "2px 5px", borderRadius: "4px" }}>build</code> y <code style={{ color: "#fff", backgroundColor: "#424242", padding: "2px 5px", borderRadius: "4px" }}>runConfig</code>.</li>
            <li style={{ marginBottom: "0.5rem" }}>Reemplaza cada valor <code style={{ color: "#ffab91" }}>"REEMPLAZA_CON_TU_..."</code> con las credenciales reales de tu proyecto de Firebase.</li>
            <li style={{ marginBottom: "0.5rem" }}>Asegúrate de que no haya errores de tipeo al copiar y pegar.</li>
            <li>Vuelve a desplegar tu aplicación.</li>
          </ol>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
