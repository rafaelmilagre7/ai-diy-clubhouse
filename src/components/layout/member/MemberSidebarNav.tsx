
import { cn } from "@/lib/utils";
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
  Map,
  Calendar,
  GraduationCap,
  Wrench,
  MessagesSquare,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface SidebarNavProps {
  sidebarOpen: boolean;
  isAdmin?: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen, isAdmin = false }: SidebarNavProps) => {
  const location = useLocation();

  // Log para depuração
  console.log("MemberSidebarNav rendering with isAdmin:", isAdmin);

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
      title: "Cursos",
      href: "/learning",
      icon: GraduationCap,
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
    },
    {
      title: "Indicações",
      href: "/referrals",
      icon: UserPlus,
    }
  ];

  const isActive = (href: string) => {
    // Para a comunidade, considerar tanto o caminho antigo quanto o novo
    if (href === "/comunidade") {
      return location.pathname === "/comunidade" || 
             location.pathname === "/forum" || 
             location.pathname.startsWith("/comunidade/") ||
             location.pathname.startsWith("/forum/");
    }
    
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="space-y-2 py-4">
      <div className="px-3 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 rounded-lg hover:bg-[#181A2A] text-neutral-400 dark:text-neutral-300",
              !sidebarOpen && "justify-center",
              isActive(item.href) && "hubla-active-nav"
            )}
            asChild
          >
            <Link to={item.href}>
              <item.icon className={cn(
                "h-4 w-4", 
                isActive(item.href) ? "text-viverblue" : "text-neutral-400"
              )} />
              {sidebarOpen && <span>{item.title}</span>}
            </Link>
          </Button>
        ))}

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
