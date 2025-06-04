import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useFirestore } from '../utils/firebase-hooks';

const Settings = () => {
  const [settings, setSettings] = React.useState({
    currency: 'CLP',
    language: 'es',
    notifications: true,
    theme: 'light',
    defaultProjectStatus: 'Planificación',
  });

  const handleSettingChange = (key) => (event) => {
    setSettings({
      ...settings,
      [key]: event.target.value,
    });
  };

  const handleSwitchChange = (key) => (event) => {
    setSettings({
      ...settings,
      [key]: event.target.checked,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ajustes
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Preferencias Generales
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Moneda</InputLabel>
          <Select
            value={settings.currency}
            label="Moneda"
            onChange={handleSettingChange('currency')}
          >
            <MenuItem value="CLP">CLP (Pesos Chilenos)</MenuItem>
            <MenuItem value="USD">USD (Dólares)</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Idioma</InputLabel>
          <Select
            value={settings.language}
            label="Idioma"
            onChange={handleSettingChange('language')}
          >
            <MenuItem value="es">Español</MenuItem>
            <MenuItem value="en">Inglés</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications}
              onChange={handleSwitchChange('notifications')}
            />
          }
          label="Notificaciones"
          sx={{ mb: 3 }}
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Integracones
        </Typography>
        <TextField
          fullWidth
          label="API Key de Google Maps"
          value={settings.googleMapsKey}
          onChange={handleSettingChange('googleMapsKey')}
          sx={{ mb: 3 }}
        />
        <TextField
          fullWidth
          label="ID de Hoja de Google Sheets"
          value={settings.googleSheetsId}
          onChange={handleSettingChange('googleSheetsId')}
          sx={{ mb: 3 }}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Valores por Defecto
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Estado de Proyecto por Defecto</InputLabel>
          <Select
            value={settings.defaultProjectStatus}
            label="Estado de Proyecto por Defecto"
            onChange={handleSettingChange('defaultProjectStatus')}
          >
            <MenuItem value="Planificación">Planificación</MenuItem>
            <MenuItem value="En construcción">En construcción</MenuItem>
            <MenuItem value="Finalizado">Finalizado</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    </Box>
  );
};

export default Settings;
