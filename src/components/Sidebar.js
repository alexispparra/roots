import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import PALETTE from '../theme.js';

const sidebarStyle = {
  width: 220,
  height: '100vh',
  background: PALETTE.greenDark,
  color: PALETTE.beige,
  display: 'flex',
  flexDirection: 'column',
  padding: '30px 0',
  position: 'fixed',
  left: 0,
  top: 0,
  boxShadow: PALETTE.shadow,
  borderRadius: '0 32px 32px 0',
  zIndex: 1200,
  transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
};

const mobileSidebarStyle = {
  ...sidebarStyle,
  width: '80vw',
  maxWidth: 340,
  height: '100vh',
  padding: '20px 0',
  transform: 'translateX(-100%)',
  position: 'fixed',
  left: 0,
  top: 0,
  boxShadow: PALETTE.shadow,
  background: PALETTE.greenDark,
};

const linkStyle = {
  color: PALETTE.beige,
  textDecoration: 'none',
  padding: '14px 32px',
  fontWeight: 500,
  fontSize: '1.1rem',
  borderRadius: '0 24px 24px 0',
  margin: '2px 0',
  transition: 'box-shadow 0.2s, background 0.2s',
  display: 'block',
  background: 'transparent',
  boxShadow: 'none',
};
const activeStyle = {
  background: PALETTE.orangePastel,
  color: PALETTE.greenDark,
  boxShadow: '0 2px 12px rgba(66,82,74,0.08)',
};


const Sidebar = ({ user, onLogout, projects }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(window.innerWidth >= 700);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Responsivo: sidebar abierto solo en desktop
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 700);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  React.useEffect(() => {
    // Detecta si estamos en un proyecto
    const match = location.pathname.match(/\/proyectos\/(\d+)/);
    if (match) {
      setSelectedProject(match[1]);
      setOpen(true);
    } else {
      setSelectedProject(null);
    }
  }, [location.pathname]);

  const handleProjectClick = (id) => {
    setSelectedProject(id);
    setOpen(true);
    navigate(`/proyectos/${id}`);
    // En mobile, cierra el sidebar tras navegar
    if (window.innerWidth < 700) setSidebarOpen(false);
  };

  // Submenú lateral dentro del proyecto
  // Eliminamos menú redundante 'Dashboard': sólo mostramos submenú si se selecciona Cuentas o Categorías

  // --- Responsive Sidebar ---
  // Si mobile: overlay y hamburguesa
  // Si desktop: sidebar fijo
  return (
    <>
      {/* Botón hamburguesa visible solo en mobile */}
      {window.innerWidth < 700 && (
        <button
          aria-label="Abrir menú"
          style={{
            position: 'fixed', top: 18, left: 18, zIndex: 1400,
            background: PALETTE.evergreen, color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44,
            fontSize: 26, boxShadow: '0 2px 8px #0002', display: sidebarOpen ? 'none' : 'block', cursor: 'pointer',
          }}
          onClick={() => setSidebarOpen(true)}
        >☰</button>
      )}
      {/* Overlay en mobile */}
      {window.innerWidth < 700 && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(40,40,40,0.22)', zIndex: 1199 }}
        />
      )}
      <aside
        className="sidebar"
        style={{
          ...(window.innerWidth < 700 ? {
            ...mobileSidebarStyle,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          } : sidebarStyle),
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh',
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '0 0 30px 32px', color: '#333'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: PALETTE.lightText }}>ROOTS</span>
          <span style={{ fontSize: 15, color: PALETTE.lightText, marginTop: 8, marginBottom: 4, background: PALETTE.terracotta, padding: '2px 10px', borderRadius: 8 }}>
            {user}
          </span>
        </div>
        <NavLink end to="/" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>Inicio</NavLink>
        {/* Sección Proyectos */}
        <div style={{ margin: '18px 0 0 0' }}>
          <div style={{
            fontWeight: 800,
            color: PALETTE.terracotta,
            fontSize: 15,
            marginLeft: 10,
            marginBottom: 10,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            background: PALETTE.ivory,
            padding: '4px 12px 3px 12px',
            borderRadius: 8,
            boxShadow: '0 1px 4px #d6b7a2',
            border: `1.5px solid ${PALETTE.terracotta}`,
            display: 'inline-block',
          }}>PROYECTOS</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 220, overflowY: 'auto' }}>
            {projects && projects.length === 0 && <li style={{ color: '#aaa', marginLeft: 22, fontSize: 14 }}>Sin proyectos</li>}
            {projects && projects.map(p => (
              <li key={p.id}>
                <button
                  onClick={() => handleProjectClick(p.id)}
                  style={{
                    ...linkStyle,
                    background: selectedProject == p.id ? PALETTE.terracotta : '#f8f9fa',
                    color: selectedProject == p.id ? '#fff' : PALETTE.evergreen,
                    fontSize: 15,
                    padding: window.innerWidth < 700 ? '11px 16px' : '7px 18px',
                    marginLeft: 8,
                    marginBottom: 3,
                    border: selectedProject == p.id ? `2px solid ${PALETTE.terracotta}` : '1.5px solid #f2f2f2',
                    borderRadius: 8,
                    width: '94%',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: selectedProject == p.id ? 700 : 500,
                    boxShadow: selectedProject == p.id ? '0 2px 12px #e7b8a6' : '0 1px 4px #0001',
                    transition: 'all 0.18s',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f2e7e1'}
                  onMouseOut={e => e.currentTarget.style.background = selectedProject == p.id ? PALETTE.terracotta : '#f8f9fa'}
                  onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px #c9e4c5'}
                  onBlur={e => e.currentTarget.style.boxShadow = selectedProject == p.id ? '0 2px 12px #e7b8a6' : '0 1px 4px #0001'}
                >
                  <span style={{ fontSize: 19 }}>{selectedProject == p.id ? '📂' : '📁'}</span>
                  {p.name?.trim() ? p.name : p.nombre?.trim() ? p.nombre : 'Sin nombre'}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Submenú del proyecto activo */}
        {selectedProject && (
          <div style={{
            margin: '32px 0 0 0',
            padding: '22px 0 16px 0',
            borderRadius: 18,
            background: '#f8fafb',
            boxShadow: '0 4px 18px #0001',
            marginLeft: 10,
            marginRight: 10,
            border: `1.5px solid ${PALETTE.sage}`,
            minWidth: 0,
          }}>
            <div style={{
              fontWeight: 800,
              color: PALETTE.terracotta,
              fontSize: 15,
              marginLeft: 7,
              marginBottom: 10,
              letterSpacing: 1.1,
              textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 7,
              background: PALETTE.ivory,
              padding: '4px 12px 3px 12px',
              borderRadius: 8,
              boxShadow: '0 1px 4px #d6b7a2',
              border: `1.5px solid ${PALETTE.terracotta}`,
              width: 'fit-content',
            }}>
              <span style={{ fontSize: 20 }}>🔗</span>
              Menú de {(() => {
                const p = projects.find(p => String(p.id) === String(selectedProject));
                return p?.name?.trim() ? p.name : p?.nombre?.trim() ? p.nombre : 'Sin nombre';
              })()}
            </div>

            <NavLink to={`/proyectos/${selectedProject}/cuentas`} style={({isActive}) => ({
              ...linkStyle,
              marginLeft: 18,
              fontSize: 16,
              color: isActive ? PALETTE.terracotta : PALETTE.evergreen,
              background: isActive ? '#fff6f2' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              borderRadius: 9,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              marginBottom: 2,
              border: isActive ? `2px solid ${PALETTE.terracotta}` : '2px solid transparent',
              boxShadow: isActive ? '0 2px 12px #e7b8a6' : 'none',
              transition: 'all 0.17s',
            })}><span style={{ fontSize: 17 }}>💰</span>Cuentas</NavLink>
            <NavLink to={`/proyectos/${selectedProject}/categorias`} style={({isActive}) => ({
              ...linkStyle,
              marginLeft: 18,
              fontSize: 16,
              color: isActive ? PALETTE.terracotta : PALETTE.evergreen,
              background: isActive ? '#fff6f2' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              borderRadius: 9,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              marginBottom: 2,
              border: isActive ? `2px solid ${PALETTE.terracotta}` : '2px solid transparent',
              boxShadow: isActive ? '0 2px 12px #e7b8a6' : 'none',
              transition: 'all 0.17s',
            })}><span style={{ fontSize: 17 }}>🏷️</span>Categorías</NavLink>
          </div>
        )}
        {/* Ajustes y Cerrar sesión al fondo */}
        <div style={{ flex: 1 }} />
        <div style={{ height: 1, background: '#e8e8e8', margin: '18px 0 8px 10px', width: '85%', borderRadius: 2 }} />
        <NavLink to="/ajustes" style={({isActive}) => ({
          ...linkStyle,
          marginTop: 12,
          marginLeft: 10,
          fontWeight: 800,
          color: PALETTE.terracotta,
          background: PALETTE.ivory,
          borderRadius: 8,
          fontSize: 15,
          padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 9,
          border: `1.5px solid ${PALETTE.terracotta}`,
          boxShadow: '0 1px 4px #d6b7a2',
          textTransform: 'uppercase',
          letterSpacing: 1.1,
        })}><span style={{ fontSize: 16 }}>⚙️</span>Ajustes</NavLink>
        <button
          onClick={onLogout}
          style={{
            margin: '13px 10px 18px 10px',
            background: PALETTE.terracotta,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 15,
            width: '88%',
            boxShadow: '0 2px 6px #e7b8a6',
            letterSpacing: 1,
            textTransform: 'uppercase',
            transition: 'background 0.18s',
          }}
        >Cerrar sesión</button>
      </aside>
    </>
  );
};

export default Sidebar;
