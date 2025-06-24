"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { Loader2, Shield } from "lucide-react";


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
    // Return null or a simple message, the redirect will handle the rest
    return null;
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
         <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
            <Shield className="h-16 w-16 mb-4" />
            <p>La administración global de usuarios estará disponible aquí pronto.</p>
            <p className="text-xs mt-2">Esta función se habilitará en una futura actualización.</p>
        </CardContent>
      </Card>
    </div>
  );
}
