
'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
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

type GeocodeResult = {
  lat: number;
  lng: number;
};

export function ProjectMap({ address }: { address: string | null | undefined }) {
  const [isClient, setIsClient] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState<GeocodeResult>(defaultCenter);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // This ensures the component only renders on the client, preventing server-side crashes.
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    preventGoogleFontsLoading: true,
    // The disabled property ensures useJsApiLoader doesn't run until the API key is present and we're on the client
    disabled: !isClient || !apiKey, 
  });

  useEffect(() => {
    // Geocoding logic now runs safely inside this useEffect, only on the client-side.
    if (isLoaded && address) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setCenter({
            lat: location.lat(),
            lng: location.lng(),
          });
          setGeocodingError(null);
        } else {
          console.warn(`Geocode was not successful for the following reason: ${status}`);
          setGeocodingError(`No se pudo encontrar la dirección: "${address}". Mostrando ubicación predeterminada.`);
          setCenter(defaultCenter);
        }
      });
    } else if (isLoaded && !address) {
      // If no address is provided, just use the default center without an error message.
      setCenter(defaultCenter);
      setGeocodingError(null);
    }
  }, [address, isLoaded]);

  // Render a skeleton during server-side rendering or before the client has mounted.
  if (!isClient) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  // Graceful handling of missing API key. This is the first line of defense.
  if (!apiKey) {
    return (
       <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Configuración Incompleta</AlertTitle>
        <AlertDescription>
          La clave de API de Google Maps no está configurada. Por favor, añádela a tu archivo `.env` para mostrar el mapa.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Handle script loading errors.
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

  // Show skeleton while the script is loading.
  if (!isLoaded) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  // Render the map only when everything is ready.
  return (
    <>
      {geocodingError && (
        <Alert variant="default" className="mb-4">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Aviso de Ubicación</AlertTitle>
           <AlertDescription>{geocodingError}</AlertDescription>
        </Alert>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={address && !geocodingError ? 15 : 10}
        options={{ 
            disableDefaultUI: true, 
            zoomControl: true,
            mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
        }}
      >
        {address && !geocodingError && <Marker position={center} />}
      </GoogleMap>
    </>
  );
}
