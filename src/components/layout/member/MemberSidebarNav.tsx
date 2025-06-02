
import React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarNavItem } from "./navigation/SidebarNavItem";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Target,
  Bell
} from "lucide-react";
import { useNotifications } from "@/hooks/notifications/useNotifications";

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav: React.FC<MemberSidebarNavProps> = ({ sidebarOpen }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      title: "Aprendizado",
      href: "/learning",
      icon: BookOpen,
      badge: null
    },
    {
      title: "Networking",
      href: "/networking", 
      icon: Users,
      badge: null
    },
    {
      title: "Trilha de Implementação",
      href: "/implementation-trail",
      icon: Target,
      badge: null
    }
  ];

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navigationItems.map((item) => (
        <SidebarNavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          isActive={location.pathname === item.href}
          sidebarOpen={sidebarOpen}
          badge={item.badge}
        >
          {item.title}
        </SidebarNavItem>
      ))}
    </nav>
  );
};
