"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GoogleSheetsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Datos de Google Sheets</CardTitle>
        <CardDescription>
          Visualización de datos desde tu hoja de cálculo conectada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Integración Pausada Temporalmente</AlertTitle>
            <AlertDescription>
              La integración en tiempo real con Google Sheets está causando inestabilidad en el servidor.
              Se ha desactivado temporalmente para restaurar el funcionamiento de la aplicación.
            </AlertDescription>
          </Alert>
      </CardContent>
    </Card>
  );
}
