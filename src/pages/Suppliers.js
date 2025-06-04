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
  Rating,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFirestore } from '../utils/firebase-hooks';

const Suppliers = () => {
  const [suppliers, setSuppliers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState(null);

  // Simulación de datos de proveedores
  React.useEffect(() => {
    // Aquí irá la lógica para obtener datos de Firebase
    const exampleSuppliers = [
      {
        id: 1,
        name: 'Constructora ABC',
        type: 'Construcción',
        rating: 4.5,
        contact: {
          name: 'Juan Pérez',
          phone: '+56 9 1234 5678',
          email: 'contacto@constructoraabc.cl',
        },
        status: 'Activo',
        lastPurchase: '2025-05-15',
      },
      {
        id: 2,
        name: 'Materiales XYZ',
        type: 'Materiales',
        rating: 4.0,
        contact: {
          name: 'María González',
          phone: '+56 9 8765 4321',
          email: 'ventas@materialesxyz.cl',
        },
        status: 'Activo',
        lastPurchase: '2025-05-01',
      },
    ];
    setSuppliers(exampleSuppliers);
    setLoading(false);
  }, []);

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setOpenDialog(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Proveedores
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Listado de Proveedores</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddSupplier}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Calificación</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Última Compra</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>
                  <Chip
                    label={supplier.type}
                    size="small"
                    color={supplier.type === 'Construcción' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell>
                  <Rating
                    value={supplier.rating}
                    readOnly
                    precision={0.5}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={supplier.status}
                    size="small"
                    color={supplier.status === 'Activo' ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>{supplier.lastPurchase}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditSupplier(supplier)}>
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

      {/* Diálogo para agregar/editar proveedor */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre del Proveedor"
            margin="dense"
            defaultValue={selectedSupplier?.name}
          />
          <TextField
            fullWidth
            label="Tipo de Servicio"
            margin="dense"
            defaultValue={selectedSupplier?.type}
          />
          <TextField
            fullWidth
            label="Nombre de Contacto"
            margin="dense"
            defaultValue={selectedSupplier?.contact?.name}
          />
          <TextField
            fullWidth
            label="Teléfono de Contacto"
            margin="dense"
            defaultValue={selectedSupplier?.contact?.phone}
          />
          <TextField
            fullWidth
            label="Email de Contacto"
            type="email"
            margin="dense"
            defaultValue={selectedSupplier?.contact?.email}
          />
          <TextField
            fullWidth
            label="Calificación (1-5)"
            type="number"
            margin="dense"
            defaultValue={selectedSupplier?.rating}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Suppliers;
