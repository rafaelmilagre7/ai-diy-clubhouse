
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Settings, 
  Gift,
  MessageSquare,
  ShieldCheck,
  User,
  Award,
  Map,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useLogging } from "@/hooks/useLogging";

interface SidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen }: SidebarNavProps) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { log } = useLogging("MemberSidebarNav");

  // Log para verificar a renderização e o estado atual
  log("Renderizando menu lateral", { 
    sidebarOpen, 
    currentPath: location.pathname
  });

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Perfil de Implementação",
      href: "/perfil-de-implementacao",
      icon: ClipboardList,
    },
    {
      title: "Trilha de Implementação",
      href: "/implementation-trail",
      icon: Map,
    },
    {
      title: "Soluções",
      href: "/solutions",
      icon: Lightbulb,
    },
    {
      title: "Ferramentas",
      href: "/tools",
      icon: Settings,
    },
    {
      title: "Benefícios",
      href: "/benefits",
      icon: Gift,
    },
    {
      title: "Sugestões",
      href: "/suggestions",
      icon: MessageSquare,
    },
    {
      title: "Conquistas",
      href: "/achievements",
      icon: Award,
    },
    {
      title: "Perfil",
      href: "/profile",
      icon: User,
    }
  ];

  const isActive = (href: string) => {
    // Se for a rota de soluções, considerar ativa também para solution/:id e solutions/:id
    if (href === "/solutions" && (
      location.pathname.startsWith("/solution/") || 
      location.pathname.startsWith("/solutions/")
    )) {
      return true;
    }
    
    // Para caminhos como /implementation/:id ou /implement/:id
    if (href === "/solutions" && (
      location.pathname.startsWith("/implement/") ||
      location.pathname.startsWith("/implementation/")
    )) {
      return true;
    }
    
    // Verificação normal para outras rotas
    return location.pathname === href || location.pathname.startsWith(href + '/');
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

        {isAdmin && (
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 border-viverblue text-viverblue hover:bg-viverblue/10 mt-4",
              !sidebarOpen && "justify-center"
            )}
            asChild
          >
            <Link to="/admin">
              <ShieldCheck className="h-4 w-4" />
              {sidebarOpen && <span>Painel Admin</span>}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
