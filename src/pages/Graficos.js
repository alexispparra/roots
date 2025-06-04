import React from "react";
import PALETTE from "../theme.js";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Graficos({ projects, user }) {
  // Datos de ejemplo
  const categorias = ["Construcción", "Materiales", "Honorarios", "Servicios", "Otros"];
  const gastosPorCategoria = [1200000, 800000, 400000, 200000, 150000];
  const proyectosPorUsuario = [3, 2, 1];
  const usuarios = [user, "usuario2", "usuario3"];

  const pieData = {
    labels: categorias,
    datasets: [
      {
        data: gastosPorCategoria,
        backgroundColor: [
          PALETTE.sage,
          PALETTE.terracotta,
          PALETTE.evergreen,
          PALETTE.blush,
          PALETTE.ivory
        ],
        borderWidth: 1
      }
    ]
  };

  const barData = {
    labels: usuarios,
    datasets: [
      {
        label: "Proyectos por usuario",
        data: proyectosPorUsuario,
        backgroundColor: PALETTE.evergreen
      }
    ]
  };

  return (
    <div style={{ padding: 40 }}>
      <h2 style={{ color: PALETTE.evergreen, fontWeight: 700 }}>Gráficos de gastos y usuarios</h2>
      <div style={{ display: "flex", gap: 40, marginTop: 32, flexWrap: "wrap" }}>
        <div style={{ width: 340, background: PALETTE.ivory, padding: 18, borderRadius: 12 }}>
          <h4 style={{ color: PALETTE.terracotta }}>Gastos por categoría</h4>
          <Pie data={pieData} />
        </div>
        <div style={{ width: 340, background: PALETTE.ivory, padding: 18, borderRadius: 12 }}>
          <h4 style={{ color: PALETTE.terracotta }}>Proyectos por usuario</h4>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
}
