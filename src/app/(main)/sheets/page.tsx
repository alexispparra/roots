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
    <Card className="light-data-card">
      <CardHeader>
        <CardTitle className="font-headline">Datos de Google Sheets</CardTitle>
        <CardDescription>
          Visualización de datos desde tu hoja de cálculo conectada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Función en Rediseño</AlertTitle>
            <AlertDescription>
              La integración con Google Sheets se está rediseñando para permitir que cualquier usuario conecte su propia cuenta de forma segura (vía OAuth 2.0). Esta función estará disponible en una futura actualización.
            </AlertDescription>
          </Alert>
      </CardContent>
    </Card>
  );
}
