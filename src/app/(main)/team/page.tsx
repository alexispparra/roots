
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Gestión de Equipo y Permisos</CardTitle>
          <CardDescription>
            Asigna roles a los participantes en cada proyecto. Solo los administradores pueden cambiar los permisos.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="pt-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Modo de Recuperación</AlertTitle>
                <AlertDescription>
                La gestión de equipos está temporalmente desactivada mientras se resuelve un problema del servidor. Tus datos están seguros.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
