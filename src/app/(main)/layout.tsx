"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Navigation } from "@/components/navigation";
import { Logo } from "@/components/logo";
import { ProjectsProvider } from "@/contexts/ProjectsContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, signOut, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Si el chequeo de auth terminó y NO hay un usuario,
    // no puede estar en la app. Lo redirigimos a login.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);


  const handleLogout = async () => {
    try {
        await signOut();
        toast({ title: "Has cerrado sesión." });
        // La redirección a /login es manejada por el useEffect de arriba
        // cuando el estado del usuario se vuelve nulo.
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.",
        });
    }
  };

  // Mientras se comprueba el estado de auth, o si no hay usuario (y estamos a punto de redirigir),
  // mostramos un loader a pantalla completa. Esto previene el "parpadeo" de contenido protegido.
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si el chequeo de auth terminó y tenemos un usuario, renderizamos el layout de la app.
  return (
    <ProjectsProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4">
            <Logo className="text-foreground group-data-[collapsible=icon]:hidden" />
            <Logo className="hidden size-8 text-foreground group-data-[collapsible=icon]:block" />
          </SidebarHeader>
          <SidebarContent>
            <Navigation />
          </SidebarContent>
          <SidebarFooter className="p-2">
            <div className="p-2 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
                      {user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 truncate">
                      <p className="text-sm font-semibold truncate">{user?.displayName || "Usuario"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start p-2" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6 md:hidden">
            <SidebarTrigger />
            <Logo className="h-7 w-auto" />
            <div className="w-7" /> {/* Spacer to center the logo */}
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 min-h-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProjectsProvider>
  );
}
