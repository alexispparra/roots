'use client'

import { useState, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
}

const defaultCenter = {
  lat: -34.6037, // Buenos Aires
  lng: -58.3816,
}

export function ProjectMap({ address }: { address: string | null | undefined }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(defaultCenter)
  const [geocodingError, setGeocodingError] = useState<string | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
  })

  useEffect(() => {
    if (isLoaded && address) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location
          setCenter({
            lat: location.lat(),
            lng: location.lng(),
          })
          setGeocodingError(null)
        } else {
          setGeocodingError(`No se pudo encontrar la dirección: "${address}". Mostrando ubicación predeterminada.`)
          setCenter(defaultCenter)
        }
      })
    } else if (isLoaded && !address) {
      setCenter(defaultCenter)
      setGeocodingError(null)
    }
  }, [address, isLoaded])
  
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
  
  if (loadError) {
    return (
       <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al Cargar el Mapa</AlertTitle>
        <AlertDescription>
          No se pudo cargar el script de Google Maps. Revisa tu clave de API y la conexión.
        </AlertDescription>
      </Alert>
    )
  }

  if (!isLoaded) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />
  }

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
  )
}
