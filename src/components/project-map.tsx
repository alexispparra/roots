"use client";

import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { MapPin } from 'lucide-react';

export function ProjectMap({ address }: { address: string }) {
  return (
    <Alert>
        <MapPin className="h-4 w-4" />
        <AlertTitle>Función de Mapa Deshabilitada</AlertTitle>
        <AlertDescription>
            El mapa está deshabilitado temporalmente para resolver un problema técnico.
        </AlertDescription>
    </Alert>
  );
}
