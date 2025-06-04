import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useFirestore } from '../utils/firebase-hooks';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const Dashboard = () => {
  // Datos de ejemplo - estos vendrán de Firebase
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Simulación de datos de proyectos
  React.useEffect(() => {
    // Aquí irá la lógica para obtener datos de Firebase
    const exampleProjects = [
      {
        name: 'Proyecto A',
        location: { lat: -33.4489, lng: -70.6693 },
        progress: 75,
        status: 'En progreso',
      },
      {
        name: 'Proyecto B',
        location: { lat: -33.4373, lng: -70.6456 },
        progress: 45,
        status: 'Planificación',
      },
    ];
    setProjects(exampleProjects);
    setLoading(false);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tablero Principal
      </Typography>

      <Grid container spacing={3}>
        {/* Estadísticas rápidas */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Proyectos Totales
              </Typography>
              <Typography variant="h3" component="div">
                {projects.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Mapa de Proyectos */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Ubicación de Proyectos
            </Typography>
            <LoadScript googleMapsApiKey="TU_API_KEY_AQUI">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat: -33.4489, lng: -70.6693 }}
                zoom={12}
              >
                {projects.map((project, index) => (
                  <div key={index}>
                    {/* Aquí irán los marcadores de los proyectos */}
                  </div>
                ))}
              </GoogleMap>
            </LoadScript>
          </Paper>
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Progreso de Proyectos
            </Typography>
            {/* Aquí irá el componente de gráficos */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
