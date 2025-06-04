import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProjectList from './components/ProjectList.js';
import ProjectDetail from './components/ProjectDetail.js';
import PALETTE from "./theme.js";
import Sidebar from './components/Sidebar.js';
import Dashboard from './components/Dashboard.js';
import Login from './Login.js';
import Graficos from './pages/Graficos.js';
import CategoryList from './components/CategoryList.js';

function App() {
  // Usuario autenticado
  const [user, setUser] = React.useState(() => {
    return localStorage.getItem('roots-user') || '';
  });
  
  const handleLogin = (username) => {
    setUser(username);
    localStorage.setItem('roots-user', username);
  };
  const handleLogout = () => {
    setUser('');
    localStorage.removeItem('roots-user');
  };

  // Persistencia en localStorage
  const [projects, setProjects] = React.useState(() => {
    const stored = localStorage.getItem('roots-projects');
    return stored ? JSON.parse(stored) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('roots-projects', JSON.stringify(projects));
  }, [projects]);

  const handleAddProject = (project) => {
    setProjects(prev => [...prev, project]);
  };

  const handleDeleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };



  if (!user) {
    return <Login onLogin={handleLogin} />;
  }
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div style={{ display: 'flex', minHeight: '100vh', background: PALETTE.greenDark }}>
        <Sidebar user={user} onLogout={handleLogout} projects={projects} style={{ borderRadius: 32, boxShadow: PALETTE.shadow }} />
        <main style={{ marginLeft: 220, flex: 1, background: PALETTE.beige, borderRadius: 32, boxShadow: PALETTE.shadow, minHeight: '100vh', padding: 0 }}>
          <div style={{ background: PALETTE.orangePastel, color: PALETTE.brownDark, padding: 16, textAlign: 'center', fontWeight: 'bold', fontSize: 15, borderRadius: 24, margin: 18 }}>
            ⚠️ En el entorno de preview de Windsurf, los proyectos <u>no quedan guardados</u> después de recargar la página. Esto es una limitación del entorno, no de la app.
          </div>
          <Routes>
            <Route path="/" element={<Dashboard user={user} projects={projects} onAddProject={handleAddProject} />} />
            <Route path="proyectos" element={<ProjectList projects={projects} onAddProject={handleAddProject} onDeleteProject={handleDeleteProject} user={user} />} />
            <Route path="proyectos/:projectId/*" element={<ProjectDetail projects={projects} setProjects={setProjects} user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
