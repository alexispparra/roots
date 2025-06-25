
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  useEffect(() => {
    // This effect runs once on mount to check for a redirect result.
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          // If result is not null, a user has signed in.
          // The onAuthStateChanged listener in AuthContext will handle the state update and redirection.
          // We don't need to do anything with the result object here.
        })
        .catch((error) => {
          console.error("Error from Google redirect:", error);
          toast({
            variant: "destructive",
            title: "Error de Inicio de Sesión",
            description: `Hubo un problema con el inicio de sesión de Google: ${error.message}`,
          });
        })
        .finally(() => {
          setIsCheckingRedirect(false);
        });
    } else {
      setIsCheckingRedirect(false);
    }
  }, [toast]);


  useEffect(() => {
    // Si el chequeo de auth terminó y SÍ hay un usuario,
    // no debería estar en las páginas de login/registro.
    // Lo redirigimos a la app.
    if (!authLoading && user) {
      router.replace('/projects');
    }
  }, [user, authLoading, router]);

  // Mientras se comprueba el estado de auth, o si estamos procesando un redirect,
  // o si hay un usuario y estamos a punto de redirigir, mostramos un loader.
  if (authLoading || isCheckingRedirect || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si el chequeo terminó y no hay usuario, mostramos el contenido (login/register page).
  return <>{children}</>;
}
