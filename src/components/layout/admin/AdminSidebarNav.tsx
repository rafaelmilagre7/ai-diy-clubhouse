
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  Settings,
  BookOpen,
  CalendarDays,
  Mail,
  Boxes,
  MessageSquare,
  Lightbulb,
  UserCog,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLMSAccess } from "@/hooks/auth/useLMSAccess";

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  const location = useLocation();
  const { hasLMSAccess } = useLMSAccess();

  const navItems = [
    { 
      to: "/admin", 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      label: "Dashboard",
      isExact: true
    },
    { 
      to: "/admin/solutions", 
      icon: <Boxes className="h-5 w-5" />, 
      label: "Soluções" 
    },
    ...(hasLMSAccess ? [{
      to: "/admin/courses", 
      icon: <BookOpen className="h-5 w-5" />, 
      label: "Área de Formação" 
    }] : []),
    { 
      to: "/admin/users", 
      icon: <Users className="h-5 w-5" />, 
      label: "Usuários" 
    },
    { 
      to: "/admin/invites", 
      icon: <Mail className="h-5 w-5" />, 
      label: "Convites" 
    },
    { 
      to: "/admin/events", 
      icon: <CalendarDays className="h-5 w-5" />, 
      label: "Eventos" 
    },
    { 
      to: "/admin/roles", 
      icon: <UserCog className="h-5 w-5" />, 
      label: "Perfis" 
    },
    { 
      to: "/admin/suggestions", 
      icon: <Lightbulb className="h-5 w-5" />, 
      label: "Sugestões" 
    },
    { 
      to: "/admin/onboarding", 
      icon: <MessageSquare className="h-5 w-5" />, 
      label: "Onboarding" 
    },
    { 
      to: "/admin/config", 
      icon: <Settings className="h-5 w-5" />, 
      label: "Configurações" 
    }
  ];

  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.isExact}
          className={({ isActive }) => cn(
            "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
            isActive 
              ? "bg-gray-700 text-white" 
              : "text-gray-300 hover:bg-gray-700 hover:text-white",
            !sidebarOpen && "justify-center px-2"
          )}
        >
          <div className="flex items-center">
            {item.icon}
            {sidebarOpen && (
              <span className="ml-3">{item.label}</span>
            )}
          </div>
        </NavLink>
      ))}
    </nav>
  );
};
