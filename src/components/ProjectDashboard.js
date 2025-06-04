import React from 'react';
import PALETTE from '../theme.js';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import MoneyIcon from '@mui/icons-material/Money';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TimelineIcon from '@mui/icons-material/Timeline';
import PeopleIcon from '@mui/icons-material/People';

import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);


const ProjectDashboard = ({ project, onAddCategory, onAddExpense }) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [newCategory, setNewCategory] = React.useState({
    name: '',
    icon: '',
    color: '',
  });
  const [newExpense, setNewExpense] = React.useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Filtros de fecha y avanzados
  const [dateFilter, setDateFilter] = React.useState('mes');
  const [userFilter, setUserFilter] = React.useState('todos');
  const [categoryFilter, setCategoryFilter] = React.useState('todas');
  const [customDate, setCustomDate] = React.useState(new Date().toISOString().split('T')[0]);

  // Filtra gastos según filtro
  const filterExpenses = (expenses) => {
    const now = new Date();
    if (dateFilter === 'dia') {
      return expenses.filter(e => {
        const d = new Date(e.date || e.fecha);
        return d.toISOString().split('T')[0] === now.toISOString().split('T')[0];
      });
    }
    if (dateFilter === 'semana') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 6);
      return expenses.filter(e => {
        const d = new Date(e.date || e.fecha);
        return d >= weekAgo && d <= now;
      });
    }
    if (dateFilter === 'mes') {
      return expenses.filter(e => {
        const d = new Date(e.date || e.fecha);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (dateFilter === 'año') {
      return expenses.filter(e => {
        const d = new Date(e.date || e.fecha);
        return d.getFullYear() === now.getFullYear();
      });
    }
    return expenses;
  };

  let filteredExpenses = filterExpenses(project.expenses || []);
  if (userFilter !== 'todos') {
    filteredExpenses = filteredExpenses.filter(e => (e.user || e.usuario) === userFilter);
  }
  if (categoryFilter !== 'todas') {
    filteredExpenses = filteredExpenses.filter(e => (e.category || e.categoria) === categoryFilter);
  }

  // Cálculos de estadísticas filtradas
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const categoriesStats = (project.categories || []).reduce((acc, cat) => {
    const catExpenses = filteredExpenses.filter(e => e.category === cat.name || e.categoria === cat.name);
    acc[cat.name] = {
      total: catExpenses.reduce((sum, e) => sum + e.amount, 0),
      percentage: totalExpenses ? (catExpenses.reduce((sum, e) => sum + e.amount, 0) / totalExpenses * 100).toFixed(1) : 0,
    };
    return acc;
  }, {});

  // Gastos por usuario
  const expensesByUser = {};
  filteredExpenses.forEach(e => {
    const usuario = e.user || e.usuario || 'Sin usuario';
    expensesByUser[usuario] = (expensesByUser[usuario] || 0) + e.amount;
  });

  // Chart data
  const barData = {
    labels: Object.keys(expensesByUser),
    datasets: [{
      label: 'Gastos por usuario',
      data: Object.values(expensesByUser),
      backgroundColor: PALETTE.beigeRgba(0.85),
    }]
  };
  const pieData = {
    labels: Object.keys(categoriesStats),
    datasets: [{
      data: Object.values(categoriesStats).map(s => s.total),
      backgroundColor: (project.categories || []).map(c => c.color || PALETTE.greenDark),
      borderWidth: 1,
    }]
  };

  // Funciones para categorías
  const handleAddCategory = () => {
    if (newCategory.name && newCategory.icon && newCategory.color) {
      const category = {
        ...newCategory,
        id: new Date().getTime(),
      };
      onAddCategory(category);
      setNewCategory({
        name: '',
        icon: '',
        color: '',
      });
      setOpenDialog(false);
    }
  };

  // Funciones para gastos
  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.category && newExpense.description) {
      const expense = {
        ...newExpense,
        id: new Date().getTime(),
        date: new Date(newExpense.date).toISOString(),
      };
      onAddExpense(expense);
      setNewExpense({
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const rows = [
      ['Fecha', 'Usuario', 'Descripción', 'Categoría', 'Forma de Pago', 'Monto'],
      ...filteredExpenses.map(e => [
        e.date || e.fecha || '',
        e.user || e.usuario || '',
        e.description || e.descripcion || '',
        e.category || e.categoria || '',
        e.formaDePago || '',
        e.amount || e.monto || '',
      ])
    ];
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_proyecto_${project.name || project.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Usuarios y categorías únicos
  const usuarios = Array.from(new Set((project.expenses || []).map(e => e.user || e.usuario).filter(Boolean)));
  const categorias = Array.from(new Set((project.categories || []).map(c => c.name)));

  return (
    <Box sx={{ p: 3, backgroundColor: PALETTE.greenDark }}>
      {/* Filtros avanzados */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: PALETTE.brownDark8756D }}>Filtrar por:</span>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ fontSize: 15, padding: '5px 12px', borderRadius: 24, border: '1px solid #ccc', background: PALETTE.orangePastel }}>
          <option value="dia">Día</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
          <option value="año">Año</option>
          <option value="todos">Todos</option>
        </select>
        <select value={userFilter} onChange={e => setUserFilter(e.target.value)} style={{ fontSize: 15, padding: '5px 12px', borderRadius: 24, border: '1px solid #ccc', background: PALETTE.orangePastel }}>
          <option value="todos">Todos los usuarios</option>
          {usuarios.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ fontSize: 15, padding: '5px 12px', borderRadius: 24, border: '1px solid #ccc', background: PALETTE.orangePastel }}>
          <option value="todas">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant="outlined" size="small" sx={{ ml: 2 }} onClick={handleExportCSV}>Exportar CSV</Button>
        <Button variant="contained" size="small" sx={{ ml: 1, bgcolor: PALETTE.greenDark, color: '#333' }} onClick={() => setNewExpense({ ...newExpense, category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] })}>Registrar Gasto</Button>
      </Box>

      {/* Estadísticas principales */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: PALETTE.beigeLight }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: PALETTE.contrastText }}>
                Presupuesto
              </Typography>
              <Typography variant="h3" sx={{ color: PALETTE.darkText }}>
                ${project.budget?.toLocaleString?.() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gastos Totales
              </Typography>
              <Typography variant="h3" sx={{ color: PALETTE.darkText }}>
                ${totalExpenses.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Porcentaje Utilizado
      </Typography>
      <Typography variant="h3" sx={{ color: PALETTE.darkText }}>
        {project.budget ? (totalExpenses / project.budget * 100).toFixed(1) : 0}%
      </Typography>
    </CardContent>
  </Card>
</Grid>
</Grid>

{/* El resto del dashboard continúa aquí, asegurando cierre correcto de tags y sin return duplicado */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: PALETTE.contrastText }}>Gastos por usuario</Typography>
            <Bar data={barData} options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: PALETTE.contrastText }}>Gastos por categoría</Typography>
            <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Distribución de gastos por categoría (tabla resumen) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: PALETTE.contrastText }}>Resumen por categoría</Typography>
        <Paper sx={{ p: 2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ background: PALETTE.beigeLight }}>
                <th style={{ padding: 7, textAlign: 'left' }}>Categoría</th>
                <th style={{ padding: 7, textAlign: 'right' }}>Total</th>
                <th style={{ padding: 7, textAlign: 'right' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoriesStats).map(([cat, stats]) => (
                <tr key={cat}>
                  <td style={{ padding: 7 }}>{cat}</td>
                  <td style={{ padding: 7, textAlign: 'right' }}>${stats.total.toLocaleString()}</td>
                  <td style={{ padding: 7, textAlign: 'right' }}>{stats.percentage}%</td>
                </tr>
              ))}
              {Object.keys(categoriesStats).length === 0 && (
                <tr><td colSpan={3} style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>Sin gastos en este período</td></tr>
              )}
            </tbody>
          </table>
        </Paper>
      </Box>

      {/* Categorías (mantén el resto del layout) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: PALETTE.contrastText }}>Categorías</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2 }}
        >
          Nueva Categoría
        </Button>
        <List>
          {project.categories?.map((category) => (
            <React.Fragment key={category.id}>
              <ListItem>
                <ListItemIcon sx={{ color: category.color }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText
                  inherit={category.name}
                  secondary={`Gastado: $${categoriesStats[category.name]?.total?.toLocaleString() || 0} (${categoriesStats[category.name]?.percentage || 0}%)`}
                />
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    setNewExpense({
                      amount: '',
                      category: category.name,
                      date: new Date().toISOString().split('T')[0],
                      description: '',
                    });
                    handleAddExpense();
                  }}
                >
                  Agregar Gasto
                </Button>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Diálogo para agregar categoría */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Nueva Categoría
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Icono"
            fullWidth
            value={newCategory.icon}
            onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Color (hex)"
            fullWidth
            value={newCategory.color}
            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddCategory}>Agregar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para agregar gasto */}
      <Dialog open={newExpense.category !== ''} onClose={() => setNewExpense({
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      })} maxWidth="sm" fullWidth>
        <DialogTitle>
          Nuevo Gasto
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Monto"
            fullWidth
            type="number"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Fecha"
            fullWidth
            type="date"
            value={newExpense.date}
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewExpense({
            amount: '',
            category: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
          })}>Cancelar</Button>
          <Button onClick={handleAddExpense}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDashboard;
