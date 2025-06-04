import React from 'react';

const MinimalFinanceTracker = () => {
  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{
        color: '#333',
        marginBottom: '20px'
      }}>Gestión de Proyectos</h1>

      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          flex: 1,
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            color: '#666',
            marginBottom: '15px'
          }}>Categorías</h2>
          <ul style={{
            listStyle: 'none',
            padding: 0
          }}>
            <li style={{
              padding: '10px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                width: '20px',
                height: '20px',
                background: '#A8D5BA',
                borderRadius: '4px'
              }}></span>
              Construcción
            </li>
          </ul>
        </div>

        <div style={{
          flex: 2,
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            color: '#666',
            marginBottom: '15px'
          }}>Proyectos</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                color: '#333',
                marginBottom: '10px'
              }}>Proyecto Ejemplo</h3>
              <p style={{
                color: '#666',
                marginBottom: '5px'
              }}>Ubicación: Ejemplo</p>
              <p style={{
                color: '#666',
                marginBottom: '5px'
              }}>Presupuesto: $100,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalFinanceTracker;
