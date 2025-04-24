
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
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  console.log("AdminSidebarNav renderizando, location:", window.location.pathname);

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
    return window.location.pathname === href || window.location.pathname.startsWith(href + '/');
  };

  const handleBackToDashboard = () => {
    try {
      setIsRedirecting(true);
      console.log("Redirecionando para dashboard de membro");
      
      toast("Redirecionando para área de membro...");
      
      // Usar navigate primeiro para tentar transição via React Router
      navigate("/dashboard", { replace: true });
      
      // Forçar um redirecionamento após uma pequena pausa para garantir que a navegação aconteça
      setTimeout(() => {
        window.location.href = "/dashboard";
        setIsRedirecting(false);
      }, 100);
    } catch (error) {
      console.error("Erro ao redirecionar:", error);
      // Fallback: se falhar, fazer redirecionamento direto
      window.location.href = "/dashboard";
      setIsRedirecting(false);
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
          disabled={isRedirecting}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
          {sidebarOpen && <span>{isRedirecting ? "Redirecionando..." : "Voltar ao Dashboard"}</span>}
        </Button>
      </div>
    </div>
  );
};
