
"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Home,
  Settings,
  Tag,
  ChevronRight,
  FolderKanban,
  WandSparkles,
  Wallet,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/contexts/ProjectsContext";


export function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentProjectId = searchParams.get('id');
  const currentCategoryName = searchParams.get('category');
  const { projects } = useProjects();
  
  const activeProjectsData = projects.filter(p => p.status === 'En Curso');

  const [openProjects, setOpenProjects] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (currentProjectId) {
      setOpenProjects(prev => ({ ...prev, [currentProjectId]: true }));
    }
  }, [currentProjectId]);

  const toggleProject = (projectId: string) => {
    setOpenProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const isProjectsActive = pathname.startsWith("/projects") || pathname === "/project-detail";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === "/"}
          tooltip="Panel"
        >
          <Link href="/">
            <Home />
            <span>Panel</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isProjectsActive}
          tooltip="Proyectos"
        >
          <Link href="/projects">
            <Briefcase />
            <span>Proyectos</span>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
          {activeProjectsData.map((project) => (
            <SidebarMenuSubItem key={project.id} className="flex flex-col items-start">
               <div className="flex w-full items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleProject(project.id)
                  }}
                 >
                    <ChevronRight className={cn("h-4 w-4 transition-transform", openProjects[project.id] && "rotate-90")} />
                 </Button>
                <Link href={`/project-detail?id=${project.id}`} className={cn("flex-1 text-sm font-normal text-sidebar-foreground hover:text-sidebar-accent-foreground hover:underline truncate py-2 -ml-2 pl-2", currentProjectId === project.id && 'font-semibold text-sidebar-accent-foreground')}>
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </div>
                </Link>
              </div>
              {openProjects[project.id] && project.categories.length > 0 && (
                <ul className="pl-10 w-full flex flex-col gap-1 pb-1">
                  {project.categories.map(category => (
                    <li key={category.name}>
                      <Link 
                        href={`/project-detail?id=${project.id}&tab=categories&category=${encodeURIComponent(category.name)}`} 
                        className={cn(
                          "flex items-center gap-2 p-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          pathname === '/project-detail' && currentProjectId === project.id && currentCategoryName && decodeURIComponent(currentCategoryName) === category.name && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        )}
                      >
                          <Tag className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{category.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </SidebarMenuItem>
      
       <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === "/accounts"}
          tooltip="Cuentas"
        >
          <Link href="/accounts">
            <Wallet />
            <span>Cuentas</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === "/team"}
          tooltip="Equipo"
        >
          <Link href="/team">
            <Users />
            <span>Equipo</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === "/prioritize"}
          tooltip="Prioridad IA"
        >
          <Link href="/prioritize">
            <WandSparkles />
            <span>Prioridad IA</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={pathname === "/settings"}
          tooltip="Configuración"
        >
          <Link href="/settings">
            <Settings />
            <span>Configuración</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
