
'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

// Buenos Aires as a fallback for stable rendering
const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816,
};

type GeocodedLocation = {
  lat: number;
  lng: number;
};

// This is a temporary, simplified version for debugging.
// It will be replaced once we confirm the base map loading works.
export function ProjectMap({ address }: { address: string | null | undefined }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
  });

  const [location, setLocation] = useState<GeocodedLocation | null>(null);

  // This effect now safely handles geocoding ONLY on the client-side,
  // after the map script has loaded.
  useEffect(() => {
    if (isLoaded && address && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setLocation({ lat: lat(), lng: lng() });
        } else {
          console.error(`Geocode was not successful for address "${address}" for the following reason: ${status}`);
          setLocation(null); // Fallback to default if geocoding fails
        }
      });
    }
  }, [isLoaded, address]);

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
      center={location || defaultCenter}
      zoom={location ? 15 : 10}
      options={{ disableDefaultUI: true, zoomControl: true }}
    >
      {location && <Marker position={location} />}
    </GoogleMap>
  );
}
