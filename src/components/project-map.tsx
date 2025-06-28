'use client';

import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, AdvancedMarker } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, MapPin } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816, // Buenos Aires
};

type GeocodedLocation = {
  lat: number;
  lng: number;
};

export function ProjectMap({ address }: { address: string | null | undefined }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    mapIds: mapId ? [mapId] : [],
  });

  const [location, setLocation] = useState<GeocodedLocation | null>(null);
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  useEffect(() => {
    if (isLoaded && address) {
      setGeocodingStatus('loading');
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setLocation({ lat: lat(), lng: lng() });
          setGeocodingStatus('success');
        } else {
          console.error(`Geocode was not successful for the following reason: ${status}`);
          setLocation(null);
          setGeocodingStatus('error');
        }
      });
    } else if (isLoaded && !address) {
        setGeocodingStatus('idle');
        setLocation(null);
    }
  }, [address, isLoaded]);

  const mapCenter = useMemo(() => {
    return location || defaultCenter;
  }, [location]);

  if (loadError || !apiKey) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar el Mapa</AlertTitle>
        <AlertDescription>
          No se pudo cargar el script de Google Maps. Por favor, verifica que la clave de API (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) sea correcta y esté configurada en tu archivo `.env`.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isLoaded || geocodingStatus === 'loading') {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={location ? 15 : 10}
      options={{ mapId: mapId, disableDefaultUI: true, zoomControl: true }}
    >
      {geocodingStatus === 'success' && location && (
        <AdvancedMarker position={location}>
            <MapPin className="h-8 w-8 text-primary" />
        </AdvancedMarker>
      )}
      
      {geocodingStatus === 'error' && (
         <div className="absolute inset-0 flex items-center justify-center bg-background/50">
             <Alert className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No se pudo encontrar la dirección</AlertTitle>
                <AlertDescription>
                    No pudimos geolocalizar la dirección: "{address}". Por favor, verifica que sea correcta.
                </AlertDescription>
            </Alert>
         </div>
      )}
    </GoogleMap>
  );
}