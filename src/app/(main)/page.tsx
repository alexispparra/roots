"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";


export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Panel Global</CardTitle>
          <CardDescription>Un resumen de todos tus emprendimientos.</CardDescription>
        </CardHeader>
      </Card>
      
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Modo de Recuperación</AlertTitle>
        <AlertDescription>
          La visualización de proyectos está temporalmente desactivada para resolver un problema del servidor. Tus datos están seguros.
        </AlertDescription>
      </Alert>
    </div>
  );
}
