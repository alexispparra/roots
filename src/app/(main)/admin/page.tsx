
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Loader2 } from "lucide-react";


export default function AdminPage() {
  const { isAppAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAppAdmin) {
      router.push('/'); // Redirect non-admins to the dashboard
    }
  }, [isAppAdmin, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAppAdmin) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No tienes permiso para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Panel de Administración Global</CardTitle>
          <CardDescription>
            Gestiona los roles de todos los participantes en todos los proyectos de la aplicación.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Modo de Recuperación</AlertTitle>
                <AlertDescription>
                La administración de roles está temporalmente desactivada mientras se resuelve un problema del servidor. Tus datos están seguros.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
