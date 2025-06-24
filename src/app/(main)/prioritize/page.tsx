"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WandSparkles } from "lucide-react";

export default function PrioritizePage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Priorización con IA</CardTitle>
          <CardDescription>
            Usa la IA para analizar los datos de tu proyecto y la información de una Hoja de Cálculo de Google para priorizar tareas y obtener sugerencias.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Alert>
            <WandSparkles className="h-4 w-4" />
            <AlertTitle>Función en Mantenimiento</AlertTitle>
            <AlertDescription>
              La priorización con IA está temporalmente desactivada para resolver un conflicto de dependencias. Estará disponible de nuevo pronto. Disculpa las molestias.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
