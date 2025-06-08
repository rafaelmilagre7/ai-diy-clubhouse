
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Settings,
  MessageSquare,
  ChevronLeft,
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  User,
  Gift,
  Bug
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { usePermissions } from "@/hooks/auth/usePermissions";

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Eventos",
      href: "/admin/events",
      icon: Calendar,
    },
    {
      title: "Usuários",
      href: "/admin/users",
      icon: Users,
      permission: "users.view"
    },
    {
      title: "Soluções",
      href: "/admin/solutions",
      icon: Lightbulb,
    },
    {
      title: "Ferramentas",
      href: "/admin/tools",
      icon: Settings,
    },
    {
      title: "Benefícios",
      href: "/admin/benefits",
      icon: Gift,
    },
    {
      title: "Sugestões",
      href: "/admin/suggestions",
      icon: MessageSquare,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: LayoutDashboard,
    },
  ];

  const formacaoItems = [
    {
      title: "LMS Dashboard",
      href: "/formacao",
      icon: GraduationCap,
    },
    {
      title: "Cursos",
      href: "/formacao/cursos",
      icon: BookOpen,
    },
    {
      title: "Aulas",
      href: "/formacao/aulas",
      icon: BookOpen,
    },
  ];

  const rbacItems = [
    {
      title: "Papéis",
      href: "/admin/roles",
      icon: Settings,
      permission: "roles.view"
    },
    {
      title: "Convites",
      href: "/admin/invites",
      icon: Mail,
      permission: "users.invite"
    },
    {
      title: "WhatsApp Debug",
      href: "/admin/whatsapp-debug",
      icon: Bug,
      permission: "admin.all"
    },
  ];

  function isActive(href: string) {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  }

  function renderMenuItem(item: any) {
    const isAdmin = hasPermission('admin.all');
    
    if (item.permission && !hasPermission(item.permission) && !isAdmin) {
      return null;
    }

    return (
      <Button
        key={item.href}
        variant={isActive(item.href) ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-2 h-9 text-sm font-medium",
          !sidebarOpen && "justify-center",
          isActive(item.href) && "bg-viverblue hover:bg-viverblue/90"
        )}
        asChild
      >
        <Link to={item.href}>
          <item.icon className="h-4 w-4" />
          {sidebarOpen && <span>{item.title}</span>}
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-col h-full px-3 py-2">
      <div className="flex-1 space-y-1">
        {/* Menu Principal */}
        <div className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </div>

        <div className="h-2"></div>
        
        {sidebarOpen && (
          <div className="px-2 text-xs font-semibold text-gray-500">
            ÁREA DE FORMAÇÃO
          </div>
        )}
        
        <div className="space-y-1">
          {formacaoItems.map(item => renderMenuItem(item))}
        </div>

        <div className="h-2"></div>
        
        {sidebarOpen && (
          <div className="px-2 text-xs font-semibold text-gray-500">
            GERENCIAMENTO DE ACESSO
          </div>
        )}
        
        <div className="space-y-1">
          {rbacItems.map(item => renderMenuItem(item))}
        </div>
      </div>

      {/* Botão fixo no rodapé */}
      <div className="mt-auto pt-3 border-t border-gray-700">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 h-9",
            !sidebarOpen && "justify-center"
          )}
          asChild
        >
          <Link to="/dashboard">
            <ChevronLeft className="h-4 w-4" />
            {sidebarOpen && <span>Voltar ao Dashboard</span>}
          </Link>
        </Button>
      </div>
    </div>
  );
}
