"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

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
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
            <Users className="h-16 w-16 mb-4" />
          <p>La gestión de equipos estará disponible aquí pronto.</p>
           <p className="text-xs mt-2">Esta función se habilitará en una futura actualización.</p>
        </CardContent>
      </Card>
    </div>
  );
}
