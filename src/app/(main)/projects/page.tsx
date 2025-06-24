
"use client";

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { CreateProjectDialog } from "@/components/create-project-dialog";


export default function ProjectsPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Mis Proyectos</CardTitle>
            <CardDescription>Gestiona todos tus emprendimientos desde un solo lugar.</CardDescription>
          </div>
          <CreateProjectDialog />
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="pt-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Modo de Recuperación</AlertTitle>
                <AlertDescription>
                La visualización de proyectos está temporalmente desactivada para resolver un problema del servidor. Tus datos están seguros.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
