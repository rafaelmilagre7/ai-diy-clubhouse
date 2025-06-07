
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Settings, 
  Trophy,
  Gift,
  MessageSquare,
  ShieldCheck,
  User,
  BookOpen,
  Calendar,
  Wrench,
  MessagesSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { isActiveRoute } from "@/components/community/utils/routingUtils";

interface SidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen }: SidebarNavProps) => {
  const location = useLocation();
  const { isAdmin, profile } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    // REMOVIDO: Trilha de Implementação (Fase 2)
    // {
    //   title: "Trilha de Implementação",
    //   href: "/implementation-trail",
    //   icon: Map,
    // },
    {
      title: "Soluções",
      href: "/solutions",
      icon: Lightbulb,
    },
    {
      title: "Cursos",
      href: "/learning",
      icon: BookOpen,
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
      title: "Comunidade",
      href: "/comunidade",
      icon: MessagesSquare,
      highlight: true
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

  return (
    <div className="space-y-2 py-4">
      <div className="px-3 space-y-1">
        {menuItems.map((item) => {
          const active = isActiveRoute(location.pathname, item.href);
          
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 rounded-lg hover:bg-[#181A2A] text-neutral-400 dark:text-neutral-300",
                !sidebarOpen && "justify-center",
                active && "hubla-active-nav",
                item.highlight && "relative"
              )}
              asChild
            >
              <Link to={item.href}>
                <item.icon className={cn(
                  "h-4 w-4", 
                  active ? "text-viverblue" : "text-neutral-400"
                )} />
                {sidebarOpen && (
                  <span>{item.title}</span>
                )}
              </Link>
            </Button>
          );
        })}

        {isAdmin && (
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-3 border-viverblue/30 text-viverblue hover:bg-[#181A2A] mt-4",
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
