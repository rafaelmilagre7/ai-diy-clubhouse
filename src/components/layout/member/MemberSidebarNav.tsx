
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
  Map,
  Calendar,
  GraduationCap,
  Wrench,
  MessagesSquare,
  Network,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { isActiveRoute } from "@/components/community/utils/routingUtils";
import { useUnifiedOnboardingValidation } from "@/hooks/onboarding/useUnifiedOnboardingValidation";

interface SidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen }: SidebarNavProps) => {
  const location = useLocation();
  const { isAdmin, isFormacao, profile } = useAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();

  console.log('🔍 MemberSidebarNav: Status do networking e onboarding:', {
    isOnboardingComplete,
    onboardingLoading,
    isAdmin,
    userRole: profile?.role
  });

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Onboarding",
      href: "/onboarding-new",
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

  // Adicionar networking se o usuário completou o onboarding OU é admin
  const hasNetworkingAccess = isAdmin || isOnboardingComplete;
  if (hasNetworkingAccess && !onboardingLoading) {
    console.log('✅ MemberSidebarNav: Adicionando networking ao menu');
    menuItems.splice(5, 0, {
      title: "Networking",
      href: "/networking",
      icon: Users,
    });
  } else {
    console.log('❌ MemberSidebarNav: Networking não disponível', {
      hasNetworkingAccess,
      onboardingLoading,
      isAdmin,
      isOnboardingComplete
    });
  }

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
        
        {isFormacao && (
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-3 border-viverblue/30 text-viverblue hover:bg-[#181A2A] mt-4",
              !sidebarOpen && "justify-center"
            )}
            asChild
          >
            <Link to="/formacao">
              <GraduationCap className="h-4 w-4" />
              {sidebarOpen && <span>Área de Cursos</span>}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
