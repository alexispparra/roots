
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
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true); // Start as true

  useEffect(() => {
    // This effect runs once on mount to handle the result of a Google sign-in redirect.
    if (auth) {
        getRedirectResult(auth)
        .then((result) => {
            // If 'result' is not null, a user has successfully signed in.
            // The onAuthStateChanged listener in AuthContext will handle the state update,
            // so we don't need to do anything with the user object here.
            if (result) {
              // A successful redirect login was processed.
              // The main useEffect below will handle the navigation once the user state is updated.
              toast({ title: "Inicio de sesión exitoso." });
            }
        })
        .catch((error) => {
            // This can happen if the user backs out, or if there's a configuration error.
            console.error("Error processing Google redirect:", error);
            // Don't show a toast for common cases like 'auth/cancelled-popup-request'
            if (error.code !== 'auth/cancelled-popup-request') {
                toast({
                    variant: "destructive",
                    title: "Error de Inicio de Sesión",
                    description: `Hubo un problema al procesar el inicio de sesión: ${error.message}`,
                });
            }
        })
        .finally(() => {
            // No matter the outcome, we're done processing the redirect.
            setIsProcessingRedirect(false);
        });
    } else {
        // If auth is not configured, we're not processing anything.
        setIsProcessingRedirect(false);
    }
    // The empty dependency array ensures this effect runs only once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    // This effect handles redirection based on the user's state.
    // It will not run until the redirect processing is complete AND the auth state is no longer loading.
    if (!isProcessingRedirect && !authLoading && user) {
      router.replace('/projects');
    }
  }, [user, authLoading, router, isProcessingRedirect]);

  // Show a loader if we're still checking the initial auth state OR processing a potential redirect.
  // Also show a loader if we have a user and are about to redirect them.
  if (authLoading || isProcessingRedirect || user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If all checks are done and there's no user, show the content (login/register page).
  return <>{children}</>;
}
