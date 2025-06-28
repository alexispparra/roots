"use client";

import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle } from 'lucide-react';

const mapContainerStyle = {
  height: '400px',
  width: '100%',
  borderRadius: 'var(--radius)',
};

const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816, // Buenos Aires
};

type ProjectMapProps = {
  address: string;
};

export function ProjectMap({ address }: ProjectMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['geocoding'],
  });

  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && address) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newCenter = { lat: location.lat(), lng: location.lng() };
          setCenter(newCenter);
          setMarkerPosition(newCenter);
          setGeocodingError(null);
        } else {
          console.error(`Geocode was not successful for the following reason: ${status}`);
          setGeocodingError(`No se pudo encontrar la dirección: "${address}". Por favor, verifica que sea correcta.`);
          setMarkerPosition(null);
        }
      });
    }
  }, [isLoaded, address]);

  if (loadError) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al cargar el mapa</AlertTitle>
            <AlertDescription>
                No se pudo cargar Google Maps. Por favor, revisa la configuración de la API Key.
            </AlertDescription>
        </Alert>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  return (
    <div>
        {geocodingError && (
            <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error de Ubicación</AlertTitle>
                <AlertDescription>{geocodingError}</AlertDescription>
            </Alert>
        )}
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={markerPosition ? 15 : 10}
        >
            {markerPosition && <MarkerF position={markerPosition} />}
        </GoogleMap>
    </div>
  );
}
