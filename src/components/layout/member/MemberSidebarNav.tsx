
import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarNavItem } from "./navigation/SidebarNavItem";
import { 
  LayoutDashboard, 
  Lightbulb,
  Route,
  Wrench,
  Gift,
  MessageSquare,
  GraduationCap,
  Users,
  Calendar,
  User,
  Shield
} from "lucide-react";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { useAuth } from "@/contexts/auth";

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav: React.FC<MemberSidebarNavProps> = ({ sidebarOpen }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { profile } = useAuth();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      title: "Soluções",
      href: "/solutions",
      icon: Lightbulb,
      badge: null
    },
    {
      title: "Trilha de Implementação",
      href: "/implementation-trail",
      icon: Route,
      badge: null
    },
    {
      title: "Ferramentas",
      href: "/tools",
      icon: Wrench,
      badge: null
    },
    {
      title: "Benefícios",
      href: "/benefits",
      icon: Gift,
      badge: null
    },
    {
      title: "Comunidade",
      href: "/comunidade",
      icon: MessageSquare,
      badge: null
    },
    {
      title: "Aprendizado",
      href: "/learning",
      icon: GraduationCap,
      badge: null
    },
    {
      title: "Networking",
      href: "/networking",
      icon: Users,
      badge: null
    },
    {
      title: "Eventos",
      href: "/events",
      icon: Calendar,
      badge: null
    },
    {
      title: "Sugestões",
      href: "/suggestions",
      icon: Lightbulb,
      badge: null
    },
    {
      title: "Perfil",
      href: "/profile",
      icon: User,
      badge: null
    }
  ];

  // Adicionar item Admin apenas para admins
  if (profile?.role === 'admin') {
    navigationItems.push({
      title: "Admin",
      href: "/admin",
      icon: Shield,
      badge: null
    });
  }

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navigationItems.map((item) => (
        <SidebarNavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          isActive={location.pathname === item.href || location.pathname.startsWith(item.href + "/")}
          sidebarOpen={sidebarOpen}
          badge={item.badge}
        >
          {item.title}
        </SidebarNavItem>
      ))}
    </nav>
  );
};
