
"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    // This effect runs on mount to handle the result of a Google sign-in redirect.
    if (auth) {
        getRedirectResult(auth)
        .then((result) => {
            // If 'result' is not null, a user has successfully signed in.
            // The onAuthStateChanged listener in AuthContext will handle the state update
            // and the main useEffect below will handle the redirection. We just show a success toast.
            if (result) {
              toast({ title: "Inicio de sesión exitoso." });
            }
        })
        .catch((error) => {
            console.error("Error processing Google redirect:", error);
            // The user will see the login page again, where they can retry.
            // A toast can inform them of the specific error.
             toast({
                variant: "destructive",
                title: "Error de Inicio de Sesión",
                description: `Hubo un problema al procesar el inicio de sesión de Google: ${error.message}`,
             });
        });
    }
  // The empty dependency array ensures this effect runs only once when the component mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    // If the auth check is done and we have a user,
    // they shouldn't be on the login/register pages.
    // Redirect them to the app's main page.
    if (!authLoading && user) {
      router.replace('/projects');
    }
  }, [user, authLoading, router]);

  // While checking auth state, or if there's a user and we're about to redirect,
  // show a loader.
  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the check is done and there's no user, show the content (login/register page).
  return <>{children}</>;
}
