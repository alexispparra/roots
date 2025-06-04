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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const BasicProjectManager = () => {
  const [projects, setProjects] = React.useState([]);
  const [newProject, setNewProject] = React.useState({
    name: '',
    location: '',
    budget: '',
  });
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleAddProject = () => {
    if (newProject.name && newProject.location && newProject.budget) {
      const newId = projects.length + 1;
      const project = {
        id: newId,
        name: newProject.name,
        location: newProject.location,
        budget: parseFloat(newProject.budget),
        expenses: [],
        categories: [],
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Proyectos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Proyectos Activos
            </Typography>
            <Grid container spacing={2}>
              {projects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card>
                    <CardContent>
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
                        Gastos: ${project.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        Ver Dashboard
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

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

// export default BasicProjectManager;
// ⚠️ Este componente está deshabilitado para evitar conflictos con la gestión real de proyectos en App.js.
// Usa solo ProjectList y ProjectDetail para la gestión de proyectos.
