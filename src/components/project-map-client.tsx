'use client';

import { useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Loader2, AlertTriangle } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816,
};

type ProjectMapClientProps = {
  address: string;
};

export default function ProjectMapClient({ address }: ProjectMapClientProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries: ['places'],
  });

  // For now, we will just center on Buenos Aires.
  // In a real scenario, you'd use the Geocoding API to get lat/lng from the address.
  // This is kept simple to ensure stability.
  const center = useMemo(() => defaultCenter, []);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error al cargar el mapa</p>
        <p className="text-xs text-center">No se pudo contactar con los servicios de Google Maps.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Cargando mapa...</p>
      </div>
    );
  }
  
  if (!apiKey) {
     return (
      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Mapa no configurado</p>
        <p className="text-xs text-center">La clave de API de Google Maps no está disponible.</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}
