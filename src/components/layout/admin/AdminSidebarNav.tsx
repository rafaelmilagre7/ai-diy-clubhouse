
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
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderMenuItem = (item: any) => {
    const isAdmin = hasPermission('admin.all');
    
    if (item.permission && !hasPermission(item.permission) && !isAdmin) {
      return null;
    }

    return (
      <Button
        key={item.href}
        variant={isActive(item.href) ? "default" : "ghost"}
        className={cn(
          "w-full justify-start gap-2 mb-1",
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
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-3" style={{ height: "calc(100vh - 140px)" }}>
        <div className="py-4 space-y-2">
          <div className="space-y-1">
            {menuItems.map(item => renderMenuItem(item))}
          </div>

          <Separator className="my-3" />
          
          {sidebarOpen && (
            <div className="mb-2 px-2 text-xs font-semibold text-gray-500">
              ÁREA DE FORMAÇÃO
            </div>
          )}
          
          <div className="space-y-1">
            {formacaoItems.map(item => renderMenuItem(item))}
          </div>

          <Separator className="my-3" />
          
          {sidebarOpen && (
            <div className="mb-2 px-2 text-xs font-semibold text-gray-500">
              GERENCIAMENTO DE ACESSO
            </div>
          )}
          
          <div className="space-y-1">
            {rbacItems.map(item => renderMenuItem(item))}
          </div>
        </div>
      </ScrollArea>

      <div className="px-3 py-4 border-t border-gray-700 mt-auto space-y-2">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2",
            !sidebarOpen && "justify-center"
          )}
          asChild
        >
          <Link to="/dashboard">
            <User className="h-4 w-4" />
            {sidebarOpen && <span>Painel do Membro</span>}
          </Link>
        </Button>
        
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
