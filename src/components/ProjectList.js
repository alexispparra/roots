import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const spinnerStyle = {
  display: 'inline-block',
  width: 28,
  height: 28,
  border: '4px solid #ccc',
  borderTop: '4px solid #A1A79E',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const ProjectList = ({ projects, onAddProject, onDeleteProject }) => {
  const [form, setForm] = useState({ name: '', location: '', description: '' });
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

  useEffect(() => {
    console.log('[ProjectList] Rendered. Projects:', projects);
    return () => {
      console.log('[ProjectList] Unmounted');
    };
  }, [projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim() || !form.description.trim()) {
      setError("Todos los campos son obligatorios.");
      setTimeout(() => setError(""), 1800);
      return;
    }
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 900)); // Simula espera
      onAddProject({ ...form, id: Date.now() });
      setMessage("Proyecto agregado exitosamente.");
      setForm({ name: '', location: '', description: '' });
    } catch {
      setError("Ocurrió un error al agregar.");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 1800);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este proyecto?")) {
      setLoading(true);
      try {
        await new Promise(res => setTimeout(res, 700)); // Simula espera
        onDeleteProject(id);
        setMessage("Proyecto eliminado correctamente.");
      } catch (e) {
        setError("Ocurrió un error al eliminar.");
      }
      setLoading(false);
      setTimeout(() => setMessage(""), 1800);
    }
  };

  return (
    <div>
      <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, color: '#68756D', fontWeight: 700 }}>Proyectos</h2>
        {loading && (
          <div style={{ margin: '14px 0' }}>
            <span style={spinnerStyle} />
          </div>
        )}
        {message && <div style={{ color: '#2e7d32', background: '#e6f4ea', padding: 10, borderRadius: 8, marginBottom: 10 }}>{message}</div>}
        {error && <div style={{ color: '#a33', background: '#ffe5e5', padding: 10, borderRadius: 8, marginBottom: 10 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 500, marginBottom: 2 }}>Nombre del proyecto</label>
            <input
              type="text"
              placeholder="Nombre del proyecto"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 220 }}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 500, marginBottom: 2 }}>Ubicación</label>
            <input
              type="text"
              placeholder="Ubicación"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 180 }}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 500, marginBottom: 2 }}>Descripción</label>
            <textarea
              placeholder="Descripción"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 320, height: 100 }}
              required
            />
          </div>
          <button type="submit" style={{ padding: '8px 22px', borderRadius: 6, border: 'none', background: '#A1A79E', color: '#fff', fontWeight: 600, marginTop: 22 }}>
            Agregar
          </button>
        </form>
        <ul style={{ paddingLeft: 0 }}>
          {projects.map(project => (
            <li key={project.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, listStyle: 'none', background: '#f8f9fa', borderRadius: 8, padding: '8px 18px' }}>
              <div style={{ flex: 1 }}>
                <Link to={`/proyectos/${project.id}`} style={{ fontWeight: 600, color: '#68756D', textDecoration: 'none', fontSize: 17 }}>{project.name}</Link>
                <span style={{ color: '#aaa', fontSize: 14, marginLeft: 16 }}>{project.location}</span>
                <span style={{ color: '#888', fontSize: 14, marginLeft: 16 }}>{project.description}</span>
              </div>
              <button
                style={{ marginLeft: 12, background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 13 }}
                onClick={() => handleDelete(project.id)}
                title="Eliminar proyecto"
              >🗑️</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectList;
