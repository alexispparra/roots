
"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el chequeo de auth terminó y SÍ hay un usuario,
    // no debería estar en las páginas de login/registro.
    // Lo redirigimos a la app.
    if (!loading && user) {
      router.replace('/projects');
    }
  }, [user, loading, router]);

  // Mientras se comprueba el estado de auth, o si hay un usuario
  // y estamos a punto de redirigir, mostramos un loader.
  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si el chequeo terminó y no hay usuario, mostramos el contenido (login/register page).
  return <>{children}</>;
}
