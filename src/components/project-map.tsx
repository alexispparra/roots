'use client';

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

// Buenos Aires as a fallback
const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816,
};

export function ProjectMap({ address }: { address: string | null | undefined }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
       <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Configuración Incompleta</AlertTitle>
        <AlertDescription>
          La clave de API de Google Maps no está configurada. Por favor, añádela a tu archivo `.env` para mostrar el mapa.
        </AlertDescription>
      </Alert>
    )
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar el Mapa</AlertTitle>
        <AlertDescription>
          No se pudo cargar Google Maps. Revisa que tu clave de API sea correcta y que no haya problemas de conexión.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={10}
      options={{ disableDefaultUI: true, zoomControl: true }}
    >
      {/* Markers and other features will be added back once this base map works */}
    </GoogleMap>
  );
}
