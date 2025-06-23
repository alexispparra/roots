"use client";

import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Briefcase,
  Home,
  Settings,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  { href: "/", label: "Panel", icon: Home },
  { href: "/projects", label: "Proyectos", icon: Briefcase },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  // A simple way to handle active state for nested project routes
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
