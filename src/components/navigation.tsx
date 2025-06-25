
"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Briefcase,
  Settings,
  Shield,
  Wallet,
  Users,
  LayoutDashboard,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAppAdmin } = useAuth();
  const { projects, loading } = useProjects();
  
  const currentProjectId = searchParams.get('id') ?? searchParams.get('projectId');

  const activeProjects = projects.filter(
    (project) => project.status === 'planning' || project.status === 'in-progress'
  );

  return (
    <>
      <SidebarMenu>
        {/* Static links */}
         <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === "/projects"}>
            <Link href="/projects">
              <Briefcase />
              <span>Todos los Proyectos</span>
            </Link>
          </SidebarMenuButton>
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
        
        {isAppAdmin && (
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin"}
              tooltip="Administración"
            >
              <Link href="/admin">
                <Shield />
                <span>Administración</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>

      <SidebarSeparator />
      
      <div className="px-2">
        <SidebarGroupLabel>Mis Proyectos</SidebarGroupLabel>
      </div>

      {loading ? (
        <div className="p-2 space-y-1">
          <SidebarMenuSkeleton showIcon />
          <SidebarMenuSkeleton showIcon />
        </div>
      ) : activeProjects.length > 0 ? (
        <Accordion type="single" collapsible className="w-full px-2" defaultValue={currentProjectId ?? undefined}>
          {activeProjects.map((project) => (
            <AccordionItem value={project.id} key={project.id} className="border-none">
               <AccordionTrigger 
                  className="p-2 justify-start gap-2 text-sm rounded-md hover:bg-sidebar-accent hover:no-underline [&>svg]:size-4"
                  asChild
                >
                  <Link href={`/project-detail?id=${project.id}`} className="flex flex-1 items-center">
                    <span className="truncate flex-1 text-left">{project.name}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                  </Link>
              </AccordionTrigger>
              <AccordionContent className="pl-4 pb-1">
                 <ul className="flex flex-col gap-1 border-l border-sidebar-border ml-2 pl-4 py-1">
                    {project.categories.length > 0 ? project.categories.map(category => (
                       <li key={category.name}>
                         <Link href={`/project-category?projectId=${project.id}&categoryName=${encodeURIComponent(category.name)}`} className={cn("flex items-center gap-2 p-1.5 rounded-md text-sm hover:bg-sidebar-accent", pathname === '/project-category' && searchParams.get('projectId') === project.id && decodeURIComponent(searchParams.get('categoryName') ?? '') === category.name && 'bg-sidebar-accent font-semibold')}>
                           <ChevronRight className="h-4 w-4 shrink-0" /> <span className="truncate">{category.name}</span>
                         </Link>
                       </li>
                    )) : (
                      <li className="text-xs text-sidebar-foreground/70 p-1.5">No hay categorías</li>
                    )}
                 </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="p-4 text-center text-sm text-sidebar-foreground/70">
          No hay proyectos activos.
        </div>
      )}

      <div className="flex-grow" />

      <SidebarSeparator />
      
      <SidebarMenu>
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
    </>
  );
}
