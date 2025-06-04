import React from 'react';
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import PALETTE from '../theme.js';

function ProjectCuentas({ project, setProjects, user }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [form, setForm] = React.useState({ fecha: '', descripcion: '', monto: '', categoria: '', formaDePago: '' });
  const formasDePago = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];

  const handleAddExpense = () => {
    if (!form.descripcion || !form.monto || !form.categoria || !form.formaDePago || !form.fecha) return;
    const updated = { ...project };
    updated.expenses = [...(project.expenses || []), { ...form, id: Date.now(), amount: Number(form.monto), user: user || 'Sin usuario' }];
    setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
    setForm({ fecha: '', descripcion: '', monto: '', categoria: '', formaDePago: '' });
    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto', backgroundColor: PALETTE.beige, borderRadius: 24, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
      <Typography variant="h5" gutterBottom sx={{ color: PALETTE.brownDark, fontWeight: 600 }}>Cuentas y Gastos</Typography>
      <Button variant="contained" sx={{ mb: 2, backgroundColor: PALETTE.orangePastel, '&:hover': { backgroundColor: PALETTE.orangePastelDark }, borderRadius: 24, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }} onClick={() => setOpenDialog(true)}>
        Registrar Gasto
      </Button>
      <Paper sx={{ mb: 3, backgroundColor: PALETTE.beige, borderRadius: 24, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: PALETTE.brown, fontWeight: 600 }}>Fecha</TableCell>
              <TableCell sx={{ color: PALETTE.brown, fontWeight: 600 }}>Usuario</TableCell>
              <TableCell sx={{ color: PALETTE.brown, fontWeight: 600 }}>Descripción</TableCell>
              <TableCell sx={{ color: PALETTE.brown, fontWeight: 600 }}>Categoría</TableCell>
              <TableCell sx={{ color: PALETTE.brown, fontWeight: 600 }}>Forma de Pago</TableCell>
              <TableCell align="right" sx={{ color: PALETTE.brown, fontWeight: 600 }}>Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(project.expenses || []).map(g => (
              <TableRow key={g.id}>
                <TableCell sx={{ color: PALETTE.brown }}>{g.fecha || g.date || '-'}</TableCell>
                <TableCell sx={{ color: PALETTE.brown }}>{g.user || g.usuario || '-'}</TableCell>
                <TableCell sx={{ color: PALETTE.brown }}>{g.descripcion}</TableCell>
                <TableCell sx={{ color: PALETTE.brown }}>{g.categoria || g.category}</TableCell>
                <TableCell sx={{ color: PALETTE.brown }}>{g.formaDePago}</TableCell>
                <TableCell align="right" sx={{ color: PALETTE.brown }}>${Number(g.monto || g.amount).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {(project.expenses || []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: PALETTE.greenDark, padding: 20, borderRadius: 24, backgroundColor: PALETTE.beige }}>Sin gastos registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} sx={{ borderRadius: 24 }}>
        <DialogTitle sx={{ color: PALETTE.brownDark, fontWeight: 600, backgroundColor: PALETTE.beige, borderRadius: 24 }}>Registrar Gasto</DialogTitle>
        <DialogContent sx={{ backgroundColor: PALETTE.beige, borderRadius: 24 }}>
          <TextField label="Fecha" type="date" fullWidth margin="dense" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ backgroundColor: PALETTE.beige }} />
          <TextField label="Descripción" fullWidth margin="dense" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} sx={{ backgroundColor: PALETTE.beige }} />
          <TextField label="Monto" type="number" fullWidth margin="dense" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} sx={{ backgroundColor: PALETTE.beige }} />
          <TextField label="Categoría" select fullWidth margin="dense" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} sx={{ backgroundColor: PALETTE.beige }}>
            {(project.categories || []).map(cat => (
              <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Forma de Pago" select fullWidth margin="dense" value={form.formaDePago} onChange={e => setForm({ ...form, formaDePago: e.target.value })} sx={{ backgroundColor: PALETTE.beige, borderRadius: 24 }} SelectProps={{ native: false }}>
            {formasDePago.map(fp => (
              <MenuItem key={fp} value={fp}>{fp}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: PALETTE.brownDark }}>Cancelar</Button>
          <Button onClick={handleAddExpense} variant="contained" sx={{ backgroundColor: PALETTE.orangePastel, '&:hover': { backgroundColor: PALETTE.orangePastelDark } }}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectCuentas;
