import React from 'react';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryList = ({ projects }) => {
  // Obtener todas las categorías únicas de todos los proyectos
  const allExpenses = projects.flatMap(p => p.gastos || []);
  const allCategories = Array.from(new Set(allExpenses.map(e => e.categoria)));
  const [selected, setSelected] = React.useState(null);

  // Total de gastos global
  const total = allExpenses.reduce((sum, e) => sum + Number(e.monto), 0);

  // Gastos de la categoría seleccionada
  const selectedExpenses = allExpenses.filter(e => e.categoria === selected);
  const totalSelected = selectedExpenses.reduce((sum, e) => sum + Number(e.monto), 0);
  const percent = total > 0 ? ((totalSelected / total) * 100).toFixed(1) : 0;

  // Datos para el gráfico
  const pieData = {
    labels: [selected || 'Sin seleccionar', 'Resto'],
    datasets: [
      {
        data: [totalSelected, Math.max(total - totalSelected, 0)],
        backgroundColor: [
          '#C66A5A', '#A1A79E'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div style={{padding: '40px', maxWidth: 800, margin: '0 auto'}}>
      <h2 style={{color: '#333'}}>Categorías</h2>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 220 }}>
          <h4 style={{ color: '#68756D', marginBottom: 10 }}>Todas las categorías</h4>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {allCategories.length === 0 && <li style={{ color: '#aaa' }}>No hay categorías con gastos.</li>}
            {allCategories.map(cat => (
              <li key={cat}>
                <button
                  onClick={() => setSelected(cat)}
                  style={{
                    background: selected === cat ? '#C66A5A' : '#f8f9fa',
                    color: selected === cat ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: 8,
                    marginBottom: 8,
                    padding: '8px 14px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: selected === cat ? '0 2px 8px #c66a5a33' : 'none'
                  }}
                >{cat}</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          {selected ? (
            <>
              <h4 style={{ color: '#C66A5A' }}>Gastos en "{selected}"</h4>
              <ul style={{ padding: 0, listStyle: 'none', marginBottom: 18 }}>
                {selectedExpenses.length === 0 && <li style={{ color: '#aaa' }}>No hay gastos en esta categoría.</li>}
                {selectedExpenses.map(g => (
                  <li key={g.id} style={{ background: '#f5f5f5', marginBottom: 8, borderRadius: 6, padding: 8 }}>
                    <b>${Number(g.monto).toLocaleString()}</b> - {g.descripcion} <span style={{ color: '#888', fontSize: 13 }}>({g.fecha})</span>
                  </li>
                ))}
              </ul>
              <div style={{ maxWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px #0001', padding: 16 }}>
                <Pie data={pieData} />
                <div style={{ textAlign: 'center', marginTop: 10, color: '#68756D', fontWeight: 600 }}>
                  {percent}% del total de gastos
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: '#aaa', marginTop: 40 }}>Selecciona una categoría para ver sus gastos.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
