import React from 'react';
import { NavLink, Routes, Route, useParams, useLocation, useNavigate } from 'react-router-dom';
import Graficos from '../pages/Graficos.js';
import CategoryList from './CategoryList.js';

// Placeholder components
const CalendarPage = () => (
  <div style={{padding: 40}}>
    <h3 style={{color: '#C66A5A'}}>Calendario</h3>
    <div style={{height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 20, border: '2px dashed #e2e2e2', borderRadius: 10}}>
      Aquí se verá el calendario del proyecto.
    </div>
  </div>
);
const SuppliersPage = () => (
  <div style={{padding: 40}}>
    <h3 style={{color: '#C66A5A'}}>Proveedores</h3>
    <div style={{color:'#666'}}>Aquí se gestionarán los proveedores de este proyecto.</div>
  </div>
);

export default function ProjectTabs({ project, user, setProjects }) {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { label: 'Detalle', path: '' },
    { label: 'Gráficos', path: 'graficos' },
    { label: 'Categorías', path: 'categorias' },
    { label: 'Calendario', path: 'calendario' },
    { label: 'Proveedores', path: 'proveedores' },
  ];

  React.useEffect(() => {
    // Si entra directo a /proyectos/:id, redirige a Detalle
    if (location.pathname === `/proyectos/${projectId}`) {
      navigate('');
    }
  }, [location, projectId, navigate]);

  return (
    <div style={{marginTop: 24}}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end
            style={({isActive}) => ({
              background: isActive ? '#C66A5A' : '#f8f9fa',
              color: isActive ? '#fff' : '#333',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: isActive ? '0 2px 8px #c66a5a33' : 'none'
            })}
          >{tab.label}</NavLink>
        ))}
      </div>
      <Routes>
        <Route index element={<div> {/* Detalle del proyecto se renderiza en ProjectDetail */} </div>} />
        <Route path="graficos" element={<Graficos projects={[project]} user={user} />} />
        <Route path="categorias" element={<CategoryList projects={[project]} />} />
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="proveedores" element={<SuppliersPage />} />
      </Routes>
    </div>
  );
}
