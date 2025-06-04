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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Category as CategoryIcon,
  Money as MoneyIcon,
  Receipt as ReceiptIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

const FinanceTracker = () => {
  const [projects, setProjects] = React.useState([]);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [newProject, setNewProject] = React.useState({
    name: '',
    location: '',
    budget: '',
  });
  const [openDialog, setOpenDialog] = React.useState(false);
  const [categories, setCategories] = React.useState([
    { id: 1, name: 'Construcción', icon: <CategoryIcon />, color: '#A8D5BA' },
    { id: 2, name: 'Materiales', icon: <MoneyIcon />, color: '#C66A5A' },
    { id: 3, name: 'Personal', icon: <PeopleIcon />, color: '#8BB9A2' },
    { id: 4, name: 'Equipamiento', icon: <ReceiptIcon />, color: '#D98C80' },
    { id: 5, name: 'Licencias', icon: <TimelineIcon />, color: '#C4E7D2' },
  ]);

  const handleAddProject = () => {
    if (newProject.name && newProject.location && newProject.budget) {
      const project = {
        id: Date.now(),
        name: newProject.name,
        location: newProject.location,
        budget: parseFloat(newProject.budget),
        expenses: [],
        createdAt: new Date().toISOString(),
      };
      
      setProjects(prev => [...prev, project]);
      setNewProject({
        name: '',
        location: '',
        budget: '',
      });
      setOpenDialog(false);
    }
  };

  const calculateTotalExpenses = (project) => {
    return project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Proyectos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
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
                <ListItem key={category.id} button>
                  <ListItemIcon sx={{ color: category.color }}>
                    {category.icon}
                  </ListItemIcon>
                  <ListItemText primary={category.name} />
                </ListItem>
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
            <Box sx={{ height: 'calc(100% - 48px)', overflow: 'auto' }}>
              {projects.map((project) => (
                <Card key={project.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ubicación: {project.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Presupuesto: ${project.budget.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Gastos: ${calculateTotalExpenses(project).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => setSelectedProject(project)}
                        >
                          Ver Detalles
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo para agregar proyecto */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nuevo Proyecto</DialogTitle>
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
          <Button onClick={handleAddProject}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinanceTracker;
