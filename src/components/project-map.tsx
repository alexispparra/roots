"use client";

import { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, AdvancedMarker } from "@react-google-maps/api";
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, MapPin, AlertTriangle } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

// A default center, e.g., Buenos Aires, Argentina
const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816
};

// Geocoding function
const getCoordinates = async (address: string, apiKey: string): Promise<{ lat: number, lng: number } | null> => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK') {
            return data.results[0].geometry.location;
        } else {
            console.error('Geocoding failed:', data.status, data.error_message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching geocode data:', error);
        return null;
    }
};

export function ProjectMap({ address }: { address: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "",
    libraries: ['marker'], // Important for AdvancedMarker
  });

  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodingStatus, setGeocodingStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');

  useEffect(() => {
    if (address && apiKey) {
        setGeocodingStatus('loading');
        getCoordinates(address, apiKey).then(location => {
            if (location) {
                setCenter(location);
                setMarkerPosition(location);
                setGeocodingStatus('success');
            } else {
                setGeocodingStatus('error');
            }
        });
    }
  }, [address, apiKey]);

  if (!apiKey || !mapId) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Configuración de Mapa Incompleta</AlertTitle>
        <AlertDescription>
          Por favor, asegúrate de que las variables <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> y <code>NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID</code> estén definidas en tu archivo <code>.env</code>.
        </AlertDescription>
      </Alert>
    );
  }

  if (!address) {
     return (
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertTitle>Sin Dirección</AlertTitle>
        <AlertDescription>
            Este proyecto no tiene una dirección para mostrar en el mapa.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (loadError) {
      return (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al Cargar el Mapa</AlertTitle>
            <AlertDescription>
              Hubo un problema al cargar la API de Google Maps. Revisa la API Key y la conexión a internet.
            </AlertDescription>
          </Alert>
      );
  }

  if (!isLoaded || geocodingStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando mapa...</span>
      </div>
    );
  }
  
  if (geocodingStatus === 'error') {
       return (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No se pudo encontrar la dirección</AlertTitle>
            <AlertDescription>
              Google Maps no pudo localizar la dirección: "{address}". Por favor, verifica que sea correcta.
            </AlertDescription>
          </Alert>
      );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      options={{
          mapId: mapId,
          disableDefaultUI: true,
          zoomControl: true,
      }}
    >
      {markerPosition && <AdvancedMarker position={markerPosition} />}
    </GoogleMap>
  );
}
