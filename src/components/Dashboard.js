import React from 'react';
import PALETTE from '../theme.js';

import { useState } from 'react';

const Dashboard = ({ user, projects, onAddProject }) => {
  // Filtrar proyectos donde el usuario participa
  // Suponiendo que cada proyecto tiene un campo "usuarios" (array de nombres o ids)
  const myProjects = (projects || []).filter(p => !p.usuarios || p.usuarios.includes(user));
  const enDesarrollo = myProjects.filter(p => p.status !== 'Completado').length;
  const terminados = myProjects.filter(p => p.status === 'Completado').length;

  // Calcular gastos del usuario en todos sus proyectos
  let totalGastado = 0;
  const resumenProyectos = myProjects.map(p => {
    // Suponiendo que cada gasto tiene un campo "usuario" (nombre)
    const gastosUsuario = (p.gastos || []).filter(g => g.usuario === user);
    const suma = gastosUsuario.reduce((sum, g) => sum + Number(g.monto), 0);
    totalGastado += suma;
    return { nombre: p.name || p.nombre, id: p.id, suma };
  });

  // Estado modal alta proyecto
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', fecha: '' });
  const [error, setError] = useState('');

  // Responsivo: FAB arriba derecha en desktop, abajo derecha en mobile
  const fabStyle = {
    position: 'fixed',
    right: 24, bottom: window.innerWidth < 700 ? 24 : 'unset', top: window.innerWidth >= 700 ? 32 : 'unset',
    zIndex: 1001,
    background: PALETTE.terracotta,
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 56, height: 56,
    boxShadow: '0 2px 12px #0002',
    fontSize: 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      setTimeout(() => setError(''), 1800);
      return;
    }
    onAddProject({ ...form, id: Date.now() });
    setForm({ name: '', description: '', fecha: '' });
    setOpenModal(false);
  };

  return (
    <div style={{ padding: '40px', background: PALETTE.greenDark, minHeight: '100vh', maxWidth: 1000, margin: '0 auto', position: 'relative', borderRadius: 32, boxShadow: PALETTE.shadow }}>
      <h1 style={{ color: PALETTE.beige, fontWeight: 700, fontSize: 36, marginBottom: 28 }}>¡Hola, {user}!</h1>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', margin: '32px 0 24px 0' }}>
        <div style={{ flex: 1, minWidth: 220, background: PALETTE.beige, borderRadius: 24, boxShadow: PALETTE.shadow, padding: 32 }}>
          <h2 style={{ color: PALETTE.pastelPink, fontWeight: 600, marginBottom: 12 }}>Resumen Personal</h2>
          <div style={{ color: PALETTE.sage, fontSize: 17, marginBottom: 10 }}>Proyectos en desarrollo: <b>{enDesarrollo}</b></div>
          <div style={{ color: PALETTE.sage, fontSize: 17, marginBottom: 10 }}>Proyectos terminados: <b>{terminados}</b></div>
          <div style={{ color: PALETTE.sage, fontSize: 17, marginBottom: 10 }}>Total gastado por ti: <b>${totalGastado.toLocaleString()}</b></div>
        </div>
        <div style={{ flex: 2, minWidth: 320, background: PALETTE.beige, borderRadius: 24, boxShadow: PALETTE.shadow, padding: 32 }}>
          <h3 style={{ color: PALETTE.pastelPink, marginBottom: 12 }}>Gasto por proyecto</h3>
          <h3 style={{ color: PALETTE.evergreen, marginBottom: 12 }}>Gasto por proyecto</h3>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {resumenProyectos.length === 0 && <li style={{ color: '#aaa' }}>No tienes proyectos asignados.</li>}
            {resumenProyectos.map(r => (
              <li key={r.id} style={{ marginBottom: 8, color: '#333', fontWeight: 500 }}>
                {r.nombre}: <span style={{ color: PALETTE.terracotta }}>${r.suma.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px #0001', padding: 22, marginTop: 24 }}>
        <h3 style={{ color: PALETTE.terracotta, marginBottom: 12 }}>Calendario de actividades</h3>
        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 20, border: '2px dashed #e2e2e2', borderRadius: 10 }}>
          Aquí se verá el calendario de actividades de tus proyectos
        </div>
      </div>
      {/* FAB para alta de proyecto */}
      <button
        aria-label="Agregar proyecto"
        style={fabStyle}
        onClick={() => setOpenModal(true)}
        title="Agregar proyecto"
      >
        +
      </button>

      {/* Modal alta proyecto */}
      {openModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(40,40,40,0.25)', zIndex: 1200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <form onSubmit={handleSubmit} style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 32px #0003',
            padding: 28,
            minWidth: window.innerWidth < 500 ? '90vw' : 370,
            maxWidth: 420,
            width: '100%',
            display: 'flex', flexDirection: 'column', gap: 18,
            position: 'relative',
          }}>
            <h2 style={{ color: PALETTE.evergreen, marginBottom: 8 }}>Nuevo Proyecto</h2>
            <label style={{ fontWeight: 500, color: PALETTE.terracotta }}>Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
              required
              autoFocus
              maxLength={40}
            />
            <label style={{ fontWeight: 500, color: PALETTE.sage }}>Descripción</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 15, minHeight: 56, resize: 'vertical' }}
              maxLength={120}
            />
            <label style={{ fontWeight: 500, color: PALETTE.sage }}>Fecha de inicio</label>
            <input
              type="date"
              value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 15 }}
            />
            {error && <div style={{ color: PALETTE.terracotta, fontWeight: 600 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                style={{ flex: 1, background: PALETTE.sage, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
              >Cancelar</button>
              <button
                type="submit"
                style={{ flex: 1, background: PALETTE.terracotta, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
              >Agregar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
