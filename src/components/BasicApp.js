import React from 'react';

const BasicApp = () => {
  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1>Proyectos</h1>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button style={{
          padding: '10px 20px',
          background: '#A8D5BA',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Nuevo Proyecto
        </button>
      </div>
      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Lista de Proyectos</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {/* Ejemplo de tarjeta de proyecto */}
          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3>Proyecto Ejemplo</h3>
            <p>Ubicación: Ejemplo</p>
            <p>Presupuesto: $100,000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicApp;
