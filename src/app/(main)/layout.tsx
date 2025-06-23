import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Navigation } from "@/components/navigation";
import { Logo } from "@/components/logo";
import { ProjectsProvider } from "@/contexts/ProjectsContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        </Sidebar>
        <SidebarInset>
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProjectsProvider>
  );
}
