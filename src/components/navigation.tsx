
"use client";

import React from "react";
import { usePathname } from "next/navigation";
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
  FolderKanban,
  Tag,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const activeProjectsData = [
    { 
        id: 'PROJ-001', 
        name: 'Lanzamiento App Móvil', 
        href: '/project-detail',
        categories: [
            { name: "Desarrollo", href: "/project-detail#categories" },
            { name: "Diseño UI/UX", href: "/project-detail#categories" },
            { name: "Marketing", href: "/project-detail#categories" },
        ]
    },
    { 
        id: 'PROJ-003', 
        name: 'Campaña Marketing Q3', 
        href: '/project-detail',
        categories: [
            { name: "Publicidad", href: "/project-detail#categories" },
            { name: "Contenido", href: "/project-detail#categories" },
        ]
    },
];

export function Navigation() {
  const pathname = usePathname();
  // We can't know which project is active from the path, so we'll default to closed.
  // A real implementation would fetch project data and match the path.
  const [openProjects, setOpenProjects] = React.useState<Record<string, boolean>>({});

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
            <SidebarMenuSubItem key={project.id}>
              <div className="flex items-center gap-1 pr-2">
                 <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0"
                  onClick={() => toggleProject(project.id)}
                 >
                    <ChevronRight className={cn("h-4 w-4 transition-transform", openProjects[project.id] && "rotate-90")} />
                 </Button>
                <Link href={project.href} className="flex-1 text-sm font-normal text-sidebar-foreground hover:text-sidebar-accent-foreground hover:underline truncate">
                  {project.name}
                </Link>
              </div>
              {openProjects[project.id] && (
                <ul className="pl-10 mt-1 flex flex-col gap-1">
                  {project.categories.map(category => (
                    <li key={category.name}>
                      <Link href={category.href} className={cn("flex items-center gap-2 p-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", pathname.endsWith(category.href) && "bg-sidebar-accent text-sidebar-accent-foreground")}>
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
