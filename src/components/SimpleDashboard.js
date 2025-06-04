import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const statuses = ['Planificación', 'En progreso', 'Completado', 'Pausado'];

const SimpleDashboard = () => {
  const [projects, setProjects] = React.useState([
    {
      id: 1,
      name: 'Proyecto A',
      location: 'Zona Sur',
      status: 'En progreso',
      progress: 75,
      image: 'https://via.placeholder.com/400x200',
      budget: 5000000,
    },
    {
      id: 2,
      name: 'Proyecto B',
      location: 'Centro',
      status: 'Planificación',
      progress: 45,
      image: 'https://via.placeholder.com/400x200',
      budget: 8000000,
    },
  ]);
  const [notifications, setNotifications] = React.useState(3);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [newProject, setNewProject] = React.useState({
    name: '',
    location: '',
    status: 'Planificación',
    budget: '',
    progress: 0,
  });

  const handleAddProject = () => {
    if (newProject.name && newProject.location && newProject.budget) {
      const newId = projects.length + 1;
      const newBudget = parseFloat(newProject.budget);
      const newProjectData = {
        id: newId,
        name: newProject.name,
        location: newProject.location,
        status: newProject.status,
        progress: newProject.progress,
        image: 'https://via.placeholder.com/400x200',
        budget: newBudget,
      };
      
      setProjects(prevProjects => [...prevProjects, newProjectData]);
      setNewProject({
        name: '',
        location: '',
        status: 'Planificación',
        budget: '',
        progress: 0,
      });
      setOpenDialog(false);
      setNotifications(notifications + 1);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setNewProject({
      ...project,
    });
    setOpenDialog(true);
  };

  const handleSaveEdit = () => {
    if (selectedProject && newProject.name && newProject.location && newProject.budget) {
      const updatedProjects = projects.map(p => 
        p.id === selectedProject.id ? newProject : p
      );
      setProjects(updatedProjects);
      setSelectedProject(null);
      setNewProject({
        name: '',
        location: '',
        status: 'Planificación',
        budget: '',
        progress: 0,
      });
      setOpenDialog(false);
      setNotifications(notifications + 1);
    }
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      setProjects(projects.filter((p) => p.id !== projectId));
      setNotifications(notifications + 1);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tablero Principal
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
        {/* Estadísticas rápidas */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Proyectos Totales
            </Typography>
            <Typography variant="h3" component="div">
              {projects.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Presupuesto Total
            </Typography>
            <Typography variant="h3" component="div">
              ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Proyectos en Progreso
            </Typography>
            <Typography variant="h3" component="div">
              {projects.filter(p => p.status === 'En progreso').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Notificaciones
            </Typography>
            <Typography variant="h3" component="div">
              <Badge badgeContent={notifications} color="error">
                <NotificationsIcon sx={{ fontSize: 40 }} />
              </Badge>
            </Typography>
          </Paper>
        </Grid>

        {/* Tarjetas de proyectos */}
        {projects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={project.image}
                alt={project.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {project.name}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ubicación: {project.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Estado: {project.status}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Presupuesto: ${project.budget.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Progreso: {project.progress}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton onClick={() => handleEditProject(project)}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteProject(project.id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogo para agregar/editar proyecto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
            label="Estado"
            fullWidth
            value={newProject.status}
            onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
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
          <TextField
            margin="dense"
            label="Progreso"
            fullWidth
            type="number"
            value={newProject.progress}
            onChange={(e) => setNewProject({ ...newProject, progress: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={selectedProject ? handleSaveEdit : handleAddProject}>
            {selectedProject ? 'Guardar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// export default SimpleDashboard;
// ⚠️ Este componente está deshabilitado para evitar conflictos con la gestión real de proyectos en App.js.
// Usa solo ProjectList y ProjectDetail para la gestión de proyectos.
