
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Settings, 
  Gift,
  MessageSquare,
  ShieldCheck,
  User,
  BookOpen,
  Map,
  Calendar,
  GraduationCap,
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
  const { user, profile, isAdmin } = useAuth();

  console.log("MemberSidebarNav - Verificação de Admin:", {
    user: !!user,
    userEmail: user?.email,
    profile: !!profile,
    profileRole: profile?.role,
    isAdmin,
    shouldShowAdmin: isAdmin || profile?.role === 'admin' || user?.email === 'rafael@viverdeia.ai'
  });

  // Verificação mais robusta para admin
  const isUserAdmin = isAdmin || 
                     profile?.role === 'admin' || 
                     user?.email === 'rafael@viverdeia.ai' ||
                     user?.email?.includes('@viverdeia.ai');

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
      href: "/sugestoes",
      icon: Lightbulb,
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
                !sidebarOpen && "justify-center px-2",
                active && "hubla-active-nav",
                item.highlight && "relative"
              )}
              asChild
            >
              <Link to={item.href}>
                <item.icon className={cn(
                  "h-4 w-4 shrink-0", 
                  active ? "text-viverblue" : "text-neutral-400"
                )} />
                {sidebarOpen && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            </Button>
          );
        })}

        {/* Painel Admin - Apenas para administradores */}
        {isUserAdmin && (
          <div className="pt-2 border-t border-[#2A2E42] mt-4">
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-3 border-viverblue/30 text-viverblue hover:bg-[#181A2A]",
                !sidebarOpen && "justify-center px-2"
              )}
              asChild
            >
              <Link to="/admin">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="truncate">Painel Admin</span>}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
