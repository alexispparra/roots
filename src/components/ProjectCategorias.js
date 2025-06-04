import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import PALETTE from '../theme.js';

function ProjectCategorias({ project, setProjects, user }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState({ name: '', icon: '' });

  const handleAddCategory = () => {
    if (newCategory.name) {
      const updated = { ...project };
      updated.categories = [...(project.categories || []), { ...newCategory, id: Date.now() }];
      setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
      setNewCategory({ name: '', icon: '' });
      setOpenDialog(false);
    }
  };

  const handleDeleteCategory = (id) => {
    const updated = { ...project };
    updated.categories = (project.categories || []).filter(c => c.id !== id);
    setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto', backgroundColor: PALETTE.beige, borderRadius: 24, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
      <Typography variant="h5" gutterBottom sx={{ color: PALETTE.brownDark, fontWeight: 600 }}>Categorías del Proyecto</Typography>
      <Button variant="contained" startIcon={<AddIcon sx={{ color: PALETTE.orangePastel }} />} sx={{ mb: 2, backgroundColor: PALETTE.orangePastel, '&:hover': { backgroundColor: PALETTE.orangePastelDark }, borderRadius: 24, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }} onClick={() => setOpenDialog(true)}>
        Nueva Categoría
      </Button>
      <List>
        {(project.categories || []).map(category => (
          <React.Fragment key={category.id}>
            <ListItem sx={{ borderRadius: 24, backgroundColor: PALETTE.beige, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
              <ListItemIcon>
                {category.icon ? category.icon : <CategoryIcon />}
              </ListItemIcon>
              <ListItemText primary={category.name} primaryTypographyProps={{ style: { color: PALETTE.contrastText, fontWeight: 500 } }} />
              <Button size="small" color="error" onClick={() => handleDeleteCategory(category.id)} startIcon={<DeleteIcon sx={{ color: PALETTE.orangePastel }} />}>Eliminar</Button>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
        {(!project.categories || project.categories.length === 0) && (
          <ListItem><ListItemText primary="Sin categorías aún." primaryTypographyProps={{ style: { color: PALETTE.darkText } }} /></ListItem>
        )}
      </List>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} sx={{ borderRadius: 24 }}>
        <DialogTitle sx={{ backgroundColor: PALETTE.orangePastel, color: PALETTE.brownDark, borderRadius: 24 }}>Nueva Categoría</DialogTitle>
        <DialogContent sx={{ backgroundColor: PALETTE.beige, borderRadius: 24 }}>
          <TextField label="Nombre" fullWidth margin="dense" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} sx={{ backgroundColor: PALETTE.beige }} />
          {/* Icono opcional: puedes poner un emoji o dejar vacío para usar el genérico */}
          <TextField label="Icono (emoji o texto, opcional)" fullWidth margin="dense" value={newCategory.icon} onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })} sx={{ backgroundColor: PALETTE.beige }} />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: PALETTE.beige, borderRadius: 24 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: PALETTE.brownDark }}>Cancelar</Button>
          <Button onClick={handleAddCategory} variant="contained" sx={{ backgroundColor: PALETTE.orangePastel, '&:hover': { backgroundColor: PALETTE.orangePastelDark }, borderRadius: 24, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectCategorias;
