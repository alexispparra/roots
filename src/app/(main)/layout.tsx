
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Navigation } from "@/components/navigation";
import { Logo } from "@/components/logo";
import { ProjectsProvider } from "@/contexts/ProjectsContext";
import { AuthGuard, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      toast({ title: "Has cerrado sesión." });
      // The AuthGuard will handle redirecting to the login page automatically
      // after the user state changes to null.
    }
  };

  return (
    <AuthGuard>
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
              <Button variant="ghost" className="w-full justify-start p-2" onClick={handleLogout} disabled={!auth}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
              </Button>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </ProjectsProvider>
    </AuthGuard>
  );
}
