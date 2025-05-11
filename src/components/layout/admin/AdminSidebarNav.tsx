
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Settings,
  MessageSquare,
  ChevronLeft,
  BookOpen,
  Gauge,
  Calendar,
  GraduationCap,
  Shield,
  FileText
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
  
  console.log("AdminSidebarNav renderizando, location:", location.pathname);

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
      title: "Sugestões",
      href: "/admin/suggestions",
      icon: MessageSquare,
    },
    {
      title: "Onboarding",
      href: "/admin/onboarding",
      icon: BookOpen,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: Gauge,
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
    {
      title: "Alunos",
      href: "/formacao/alunos",
      icon: Users,
    },
  ];

  // Itens de menu para gerenciamento de papéis e permissões
  const rbacItems = [
    {
      title: "Papéis",
      href: "/admin/roles",
      icon: Shield,
      permission: "roles.view"
    },
    {
      title: "Log de Auditoria",
      href: "/admin/permissions/audit",
      icon: FileText,
      permission: "permissions.view"
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderMenuItem = (item: any) => {
    // Se não tiver permissão específica, não renderize
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    return (
      <Button
        key={item.href}
        variant={isActive(item.href) ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-2",
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
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 space-y-1">
        {menuItems.map(item => renderMenuItem(item))}

        <Separator className="my-4" />
        
        {sidebarOpen && (
          <div className="mb-2 px-2 text-xs font-semibold text-gray-500">
            ÁREA DE FORMAÇÃO
          </div>
        )}
        
        {formacaoItems.map(item => renderMenuItem(item))}

        {/* Nova seção para RBAC */}
        <Separator className="my-4" />
        
        {sidebarOpen && (
          <div className="mb-2 px-2 text-xs font-semibold text-gray-500">
            GERENCIAMENTO DE ACESSO
          </div>
        )}
        
        {rbacItems.map(item => renderMenuItem(item))}

        <Separator className="my-4" />

        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2",
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
