
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Settings, 
  Trophy,
  Gift,
  MessageSquare,
  ShieldCheck,
  User,
  Award,
  BookOpen,
  Map,
  Calendar,
  GraduationCap,
  Book,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface SidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen }: SidebarNavProps) => {
  const location = useLocation();
  const { isAdmin, isFormacao } = useAuth();

  // Log para verificar se o componente está sendo renderizado
  console.log("MemberSidebarNav renderizando, sidebarOpen:", sidebarOpen);
  console.log("Caminho atual:", location.pathname);

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Onboarding",
      href: "/onboarding",
      icon: BookOpen,
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
      title: "Formação",
      href: "/learning",
      icon: Book,
    },
    {
      title: "Ferramentas",
      href: "/tools",
      icon: Wrench,
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
    },
    {
      title: "Eventos",
      href: "/events",
      icon: Calendar,
    }
  ];

  const isActive = (href: string) => {
    console.log(`Verificando se ${href} está ativo para ${location.pathname}`);
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
        
        {isFormacao && (
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 border-viverblue text-viverblue hover:bg-viverblue/10 mt-4",
              !sidebarOpen && "justify-center"
            )}
            asChild
          >
            <Link to="/formacao">
              <GraduationCap className="h-4 w-4" />
              {sidebarOpen && <span>Área de Formação</span>}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
