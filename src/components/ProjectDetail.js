import React from 'react';
import { useParams, Link, Routes, Route } from 'react-router-dom';
import ProjectTabs from './ProjectTabs.js';
import ProjectDashboard from './ProjectDashboard.js';
import ProjectCuentas from './ProjectCuentas.js';
import ProjectCategorias from './ProjectCategorias.js';

const formasDePago = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];

function ProjectDetail({ projects, setProjects, user }) {
  const { projectId } = useParams();
  const projectIndex = projects.findIndex(p => String(p.id) === String(projectId));
  const project = projects[projectIndex];

  // Estado local para gastos y categorías (sin persistencia)
  const [expenseForm, setExpenseForm] = React.useState({
    fecha: '',
    descripcion: '',
    monto: '',
    categoria: '',
    formaDePago: ''
  });
  const [newCategory, setNewCategory] = React.useState('');
  const [showAddCategory, setShowAddCategory] = React.useState(false);

  if (!project) {
    return (
      <div style={{ padding: 40, color: 'red' }}>
        Proyecto no encontrado.<br/>
        <div style={{ color: '#333', fontWeight: 'normal', marginTop: 20 }}>
          <b>ID buscado:</b> {projectId}<br/>
          <b>Proyectos actuales:</b>
          <pre style={{ background: '#f3f3f3', padding: 10, borderRadius: 4, maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(projects, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // Inicializa gastos/categorías si no existen
  const gastos = project.gastos || [];
  const categorias = project.categorias || [];

  // Agregar gasto
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.descripcion || !expenseForm.monto || !expenseForm.categoria || !expenseForm.formaDePago || !expenseForm.fecha) return;
    const nuevoGasto = {
      ...expenseForm,
      id: Date.now()
    };
    const nuevosGastos = [...gastos, nuevoGasto];
    const nuevosProyectos = [...projects];
    nuevosProyectos[projectIndex] = {
      ...project,
      gastos: nuevosGastos,
      categorias // mantiene las categorías
    };
    setProjects(nuevosProyectos);
    setExpenseForm({ fecha: '', descripcion: '', monto: '', categoria: '', formaDePago: '' });
  };

  // Agregar categoría
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const nuevasCategorias = [...categorias, newCategory.trim()].filter((v, i, a) => a.indexOf(v) === i);
    const nuevosProyectos = [...projects];
    nuevosProyectos[projectIndex] = {
      ...project,
      categorias: nuevasCategorias,
      gastos
    };
    setProjects(nuevosProyectos);
    setNewCategory('');
    setShowAddCategory(false);
  };

  // Eliminar categoría
  const handleDeleteCategory = (cat) => {
    const nuevasCategorias = categorias.filter(c => c !== cat);
    // Elimina también los gastos asociados a esa categoría
    const nuevosGastos = gastos.filter(g => g.categoria !== cat);
    const nuevosProyectos = [...projects];
    nuevosProyectos[projectIndex] = {
      ...project,
      categorias: nuevasCategorias,
      gastos: nuevosGastos
    };
    setProjects(nuevosProyectos);
  };

  // Eliminar gasto
  const handleDeleteExpense = (gastoId) => {
    const nuevosGastos = gastos.filter(g => g.id !== gastoId);
    const nuevosProyectos = [...projects];
    nuevosProyectos[projectIndex] = {
      ...project,
      gastos: nuevosGastos,
      categorias
    };
    setProjects(nuevosProyectos);
  };

  // Relación categoría-emoji (puedes ampliar luego)
  const categoryIcons = {
    'Construcción': '🏗️',
    'Mantenimiento': '🛠️',
    'Honorarios': '💼',
    'Insumos': '🧱',
    'Servicios': '💡',
    'Otros': '🗂️',
  };
  return (
    <div style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
      <Routes>
        <Route index element={<ProjectDashboard project={project} onAddCategory={() => {}} onAddExpense={() => {}} />} />
        <Route path="cuentas" element={<ProjectCuentas project={project} setProjects={setProjects} user={user} />} />
        <Route path="categorias/*" element={<ProjectCategorias project={project} setProjects={setProjects} user={user} />} />
      </Routes>
    </div>
  );
}

export default ProjectDetail;
