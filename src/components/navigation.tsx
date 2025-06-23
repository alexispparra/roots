"use client";

import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  BarChart2,
  Calendar,
  Home,
  LayoutGrid,
  Map,
  Settings,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/charts", label: "Charts", icon: BarChart2 },
  { href: "/map", label: "Projects Map", icon: Map },
  { href: "/prioritize", label: "AI Priority", icon: Sparkles },
  { href: "/reminders", label: "Reminders", icon: Calendar },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/settings", label: "Settings", icon: Settings },
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
