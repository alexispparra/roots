"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Briefcase,
  Settings,
  Shield,
  Wallet,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";


export function Navigation() {
  const pathname = usePathname();
  const { isAppAdmin } = useAuth();
  
  const isProjectsActive = pathname.startsWith("/projects") || pathname.startsWith("/project-detail");

  return (
    <SidebarMenu>
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
