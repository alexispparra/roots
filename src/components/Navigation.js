import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountBalance as AccountsIcon,
  Analytics as AnalyticsIcon,
  Category as CategoriesIcon,
  CalendarToday as CalendarIcon,
  Store as SuppliersIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const Navigation = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const menuItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/' },
    { text: 'Cuentas', icon: <AccountsIcon />, path: '/accounts' },
    { text: 'Gráficos', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Categorías', icon: <CategoriesIcon />, path: '/categories' },
    { text: 'Recordatorios/Calendario', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Proveedores', icon: <SuppliersIcon />, path: '/suppliers' },
    { text: 'Ajustes', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Button
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            Menú
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ROOTS APP
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleMenuClick(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default Navigation;
