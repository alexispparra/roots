
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="grid gap-6">
      <Card className="light-data-card">
        <CardHeader>
          <CardTitle className="font-headline">Gestión de Equipo</CardTitle>
          <CardDescription>
            La gestión de equipos y permisos ahora se realiza dentro de cada proyecto específico.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
            <Users className="h-16 w-16 mb-4" />
          <p>Navega a un proyecto para gestionar sus participantes y roles desde la pestaña "Equipo".</p>
        </CardContent>
      </Card>
    </div>
  );
}
