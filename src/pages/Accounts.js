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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFirestore } from '../utils/firebase-hooks';

const Accounts = () => {
  const [accounts, setAccounts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState(null);

  // Simulación de datos de cuentas
  React.useEffect(() => {
    // Aquí irá la lógica para obtener datos de Firebase
    const exampleAccounts = [
      {
        id: 1,
        name: 'Cuenta Bancaria A',
        balance: 150000,
        type: 'Banco',
        status: 'Activa',
      },
      {
        id: 2,
        name: 'Cuenta Proyecto B',
        balance: 250000,
        type: 'Proyecto',
        status: 'Activa',
      },
    ];
    setAccounts(exampleAccounts);
    setLoading(false);
  }, []);

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setOpenDialog(true);
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAccount(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cuentas y Finanzas
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Listado de Cuentas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddAccount}
        >
          Nueva Cuenta
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Saldo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell>${account.balance.toLocaleString()}</TableCell>
                <TableCell>{account.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditAccount(account)}>
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

      {/* Diálogo para agregar/editar cuenta */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre de la Cuenta"
            margin="dense"
            defaultValue={selectedAccount?.name}
          />
          <TextField
            fullWidth
            label="Tipo"
            margin="dense"
            defaultValue={selectedAccount?.type}
          />
          <TextField
            fullWidth
            label="Saldo Inicial"
            type="number"
            margin="dense"
            defaultValue={selectedAccount?.balance}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Accounts;
