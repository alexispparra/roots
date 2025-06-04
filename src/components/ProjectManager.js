import React from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Money as MoneyIcon,
  Receipt as ReceiptIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import ProjectDashboard from './ProjectDashboard';

const categories = [
  { id: 1, name: 'Construcción', icon: <CategoryIcon />, color: '#A8D5BA' },
  { id: 2, name: 'Materiales', icon: <MoneyIcon />, color: '#C66A5A' },
  { id: 3, name: 'Personal', icon: <PeopleIcon />, color: '#8BB9A2' },
  { id: 4, name: 'Equipamiento', icon: <ReceiptIcon />, color: '#D98C80' },
  { id: 5, name: 'Licencias', icon: <TimelineIcon />, color: '#C4E7D2' },
];

const ProjectManager = () => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [newProject, setNewProject] = React.useState({
    name: '',
    location: '',
    category: '',
    budget: '',
    expenses: [],
  });
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedDashboard, setSelectedDashboard] = React.useState(null);

  const handleAddProject = () => {
    if (newProject.name && newProject.location && newProject.budget) {
      const newId = projects.length + 1;
      const newBudget = parseFloat(newProject.budget);
      const project = {
        id: newId,
        name: newProject.name,
        location: newProject.location,
        category: newProject.category,
        budget: newBudget,
        expenses: [],
        categories: [],
        createdAt: new Date().toISOString(),
      };
      
      setProjects(prev => [...prev, project]);
      setNewProject({
        name: '',
        location: '',
        category: '',
        budget: '',
        expenses: [],
      });
      setOpenDialog(false);
    }
  };

  const handleAddCategory = (projectId, category) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? {
        ...p,
        categories: [...p.categories, category]
      } : p
    ));
  };

  const handleAddExpense = (projectId, expense) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? {
        ...p,
        expenses: [...p.expenses, expense]
      } : p
    ));
  };



  const handleEditProject = (project) => {
    setSelectedProject(project);
    setNewProject({
      ...project,
      budget: project.budget.toString(),
    });
    setOpenDialog(true);
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {selectedDashboard ? (
        <ProjectDashboard 
          project={selectedDashboard} 
          onAddCategory={(category) => handleAddCategory(selectedDashboard.id, category)}
          onAddExpense={(expense) => handleAddExpense(selectedDashboard.id, expense)}
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Gestión de Proyectos
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedProject(null);
                setOpenDialog(true);
              }}
            >
              Nuevo Proyecto
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Categorías */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Categorías
                </Typography>
                <List>
                  {categories.map((category) => (
                    <React.Fragment key={category.id}>
                      <ListItem button sx={{ '&:hover': { bgcolor: category.color } }}>
                        <ListItemIcon sx={{ color: category.color }}>
                          {category.icon}
                        </ListItemIcon>
                        <ListItemText primary={category.name} />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Proyectos */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Proyectos Activos
                </Typography>
                <Box sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
                  <Grid container spacing={2}>
                    {projects.map((project) => (
                      <Grid item xs={12} key={project.id}>
                        <Card sx={{ position: 'relative' }}>
                          {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: 8, right: 8 }} />}
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {project.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ubicación: {project.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Categoría: {project.category}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Presupuesto: ${project.budget.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Gastos: ${project.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              color="primary" 
                              onClick={() => setSelectedDashboard(project)}
                              disabled={loading}
                            >
                              Ver Dashboard
                            </Button>
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => handleEditProject(project)}
                              disabled={loading}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleDeleteProject(project.id)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Diálogo para agregar/editar proyecto */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Proyecto"
            fullWidth
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Ubicación"
            fullWidth
            value={newProject.location}
            onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Categoría"
            fullWidth
            value={newProject.category}
            onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.name}>
                <ListItemIcon sx={{ color: category.color }}>
                  {category.icon}
                </ListItemIcon>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Presupuesto"
            fullWidth
            type="number"
            value={newProject.budget}
            onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleAddProject}>
            {selectedProject ? 'Guardar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// export default ProjectManager;
// ⚠️ Este componente está deshabilitado para evitar conflictos con la gestión real de proyectos en App.js.
// Usa solo ProjectList y ProjectDetail para la gestión de proyectos.
