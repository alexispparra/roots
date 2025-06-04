import React, { useState } from "react";
import PALETTE from "./theme.js";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Por favor, ingresa tu usuario");
      return;
    }
    onLogin(username.trim());
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: PALETTE.ivory
    }}>
      <div style={{
        background: PALETTE.sage,
        padding: 32,
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(100,100,100,0.08)",
        minWidth: 320
      }}>
        <h1 style={{ color: PALETTE.evergreen, marginBottom: 18 }}>Bienvenido a ROOTS</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: `1px solid ${PALETTE.evergreen}`,
              marginBottom: 12,
              fontSize: 16
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "none",
              background: PALETTE.terracotta,
              color: PALETTE.ivory,
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer"
            }}
          >Ingresar</button>
          {error && <div style={{ color: "#a33", marginTop: 10 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
