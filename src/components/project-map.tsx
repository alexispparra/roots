"use client";

import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, AdvancedMarkerF } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, KeyRound, MapPin } from 'lucide-react';

const mapContainerStyle = {
  height: '400px',
  width: '100%',
  borderRadius: 'var(--radius)',
};

const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816, // Buenos Aires
};

const libraries: ("geocoding")[] = ['geocoding'];
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || '';

type ProjectMapProps = {
  address: string;
};

export function ProjectMap({ address }: ProjectMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && address) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address, region: 'AR' }, (results, status) => {
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

  if (!address) {
     return (
        <Alert>
            <MapPin className="h-4 w-4" />
            <AlertTitle>Sin Ubicación</AlertTitle>
            <AlertDescription>
                Este proyecto no tiene una dirección definida. Edita el proyecto para añadir una y verla en el mapa.
            </AlertDescription>
        </Alert>
    );
  }

  if (!apiKey) {
    return (
        <Alert variant="destructive">
            <KeyRound className="h-4 w-4" />
            <AlertTitle>Falta la API Key de Google Maps</AlertTitle>
            <AlertDescription>
                Debes añadir tu clave de API al archivo `.env` en la raíz de tu proyecto. El archivo debe contener la línea: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_CLAVE_AQUI`.
            </AlertDescription>
        </Alert>
    );
  }
  
  if (!mapId) {
    return (
        <Alert variant="destructive">
            <KeyRound className="h-4 w-4" />
            <AlertTitle>Falta el Map ID de Google Maps</AlertTitle>
            <AlertDescription>
                Para usar los nuevos marcadores avanzados, necesitas un "Map ID". Por favor, créalo en la consola de Google Cloud y añádelo a tu archivo `.env` como `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=TU_MAP_ID_AQUI`.
            </AlertDescription>
        </Alert>
    );
  }


  if (loadError) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al cargar el mapa</AlertTitle>
            <AlertDescription>
                No se pudo cargar Google Maps. Esto puede deberse a que la API Key es inválida, no has habilitado la facturación en Google Cloud, o la URL de este sitio no está autorizada.
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
            mapId={mapId}
        >
            {markerPosition && <AdvancedMarkerF position={markerPosition} />}
        </GoogleMap>
    </div>
  );
}
