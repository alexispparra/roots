import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFirestore } from '../utils/firebase-hooks';

const Categories = () => {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState(null);

  // Simulación de datos de categorías
  React.useEffect(() => {
    // Aquí irá la lógica para obtener datos de Firebase
    const exampleCategories = [
      {
        id: 1,
        name: 'Materiales de Construcción',
        type: 'Gasto',
        color: '#C66A5A',
        description: 'Materiales para construcción y acabados',
      },
      {
        id: 2,
        name: 'Mano de Obra',
        type: 'Gasto',
        color: '#A8D5BA',
        description: 'Pagos a trabajadores y contratistas',
      },
      {
        id: 3,
        name: 'Ingresos',
        type: 'Ingreso',
        color: '#4CAF50',
        description: 'Pagos recibidos por proyectos',
      },
    ];
    setCategories(exampleCategories);
    setLoading(false);
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setOpenDialog(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Categorías
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Listado de Categorías</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
        >
          Nueva Categoría
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Chip
                    label={category.type}
                    color={category.type === 'Ingreso' ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: category.color,
                      borderRadius: '50%',
                    }}
                  />
                </TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditCategory(category)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para agregar/editar categoría */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre de la Categoría"
            margin="dense"
            defaultValue={selectedCategory?.name}
          />
          <TextField
            fullWidth
            label="Descripción"
            margin="dense"
            multiline
            rows={3}
            defaultValue={selectedCategory?.description}
          />
          <TextField
            fullWidth
            label="Color (hex)"
            margin="dense"
            defaultValue={selectedCategory?.color}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Categories;
