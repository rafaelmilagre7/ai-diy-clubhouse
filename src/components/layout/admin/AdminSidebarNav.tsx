
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Settings,
  MessageSquare,
  ChevronLeft,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log("AdminSidebarNav renderizando, location:", location.pathname);

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Usuários",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Perfis de Implementação",
      href: "/admin/implementation-profiles",
      icon: UserCheck,
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
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleBackToDashboard = () => {
    console.log("Função handleBackToDashboard executada, redirecionando para o dashboard de membro");
    
    // Usar uma combinação de abordagens para garantir o redirecionamento
    try {
      // Método 1: Navegação direta com história de navegação limpa
      navigate("/dashboard", { replace: true });
      
      // Método 2: setTimeout para garantir que o redirecionamento aconteça após outros processos
      setTimeout(() => {
        // Método 3: Usar window.location como último recurso se a navegação falhar
        window.location.href = "/dashboard";
      }, 100);
    } catch (error) {
      console.error("Erro durante navegação para dashboard:", error);
      // Fallback final
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 space-y-1">
        {menuItems.map((item) => (
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
        ))}

        <Separator className="my-4" />

        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2",
            !sidebarOpen && "justify-center"
          )}
          onClick={handleBackToDashboard}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          {sidebarOpen && <span>Voltar ao Dashboard</span>}
        </Button>
      </div>
    </div>
  );
};
