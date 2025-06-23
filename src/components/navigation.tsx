"use client";

import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  ArrowRightLeft,
  BarChart2,
  Home,
  LayoutGrid,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  { href: "/", label: "Panel", icon: Home },
  { href: "/transactions", label: "Transacciones", icon: ArrowRightLeft },
  { href: "/accounts", label: "Cuentas", icon: Wallet },
  { href: "/categories", label: "Categorías", icon: LayoutGrid },
  { href: "/charts", label: "Reportes", icon: BarChart2 },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
