"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminUsersManager } from "@/features/authorization/components/admin-users-manager";

export default function AdminPage() {
  const { isAppAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAppAdmin) {
      router.push('/projects'); // Redirect non-admins to the main projects page
    }
  }, [isAppAdmin, authLoading, router]);

  if (authLoading || !isAppAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Gestión de Usuarios</CardTitle>
          <CardDescription>
            Aprueba, rechaza o modifica el estado de los usuarios registrados en la aplicación.
          </CardDescription>
        </CardHeader>
      </Card>
      <AdminUsersManager />
    </div>
  );
}
