
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Lightbulb, 
  BookOpen, 
  Settings,
  User,
  MessageSquare,
  Route,
  GraduationCap,
  Calendar,
  FileText
} from 'lucide-react';
import { useNetworkingAccess } from '@/hooks/networking/useNetworkingAccess';
import { useUnifiedOnboardingValidation } from '@/hooks/onboarding/useUnifiedOnboardingValidation';
import { useAuth } from '@/contexts/auth';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const location = useLocation();
  const { hasAccess: hasNetworkingAccess, isLoading: networkingLoading } = useNetworkingAccess();
  const { profile } = useAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();

  console.log('🔍 MemberSidebarNavItems: Status do networking:', {
    hasNetworkingAccess,
    networkingLoading,
    isOnboardingComplete,
    onboardingLoading,
    userRole: profile?.role
  });

  // Determinar o item do onboarding baseado no status
  const getOnboardingItem = () => {
    if (onboardingLoading) {
      console.log('🔄 MemberSidebarNavItems: Carregando status do onboarding...');
      return {
        title: "Carregando...",
        href: "/onboarding-new",
        icon: BookOpen,
      };
    }

    // Se o onboarding foi completado, mostrar o link para review
    if (isOnboardingComplete) {
      console.log('✅ MemberSidebarNavItems: Onboarding completo, mostrando review');
      return {
        title: "Review do Onboarding",
        href: "/profile/onboarding-review",
        icon: FileText,
      };
    }

    // Se não foi completado, mostrar onboarding normal
    console.log('⚠️ MemberSidebarNavItems: Onboarding não completo, mostrando onboarding');
    return {
      title: "Onboarding",
      href: "/onboarding-new",
      icon: BookOpen,
    };
  };

  const onboardingItem = getOnboardingItem();
  console.log('🔍 MemberSidebarNavItems: Item final do onboarding:', onboardingItem);

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    onboardingItem,
    {
      title: "Trilha de Implementação",
      href: "/implementation-trail",
      icon: Route,
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
      title: "Comunidade",
      href: "/comunidade",
      icon: MessageSquare,
    }
  ];

  // Adicionar networking se o usuário tem acesso
  if (hasNetworkingAccess && !networkingLoading) {
    console.log('✅ MemberSidebarNavItems: Adicionando networking ao menu');
    menuItems.splice(5, 0, {
      title: "Networking",
      href: "/networking",
      icon: Users,
    });
  } else {
    console.log('❌ MemberSidebarNavItems: Networking não disponível', {
      hasNetworkingAccess,
      networkingLoading
    });
  }

  // Adicionar área de formação se o usuário tem acesso
  if (profile?.role === 'formacao' || profile?.role === 'admin') {
    menuItems.push({
      title: "Área de Formação",
      href: "/formacao",
      icon: GraduationCap,
    });
  }

  // Adicionar eventos se for admin
  if (profile?.role === 'admin') {
    menuItems.push({
      title: "Eventos",
      href: "/events",
      icon: Calendar,
    });
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {menuItems.map((item) => {
        console.log(`🔍 MemberSidebarNavItems: Renderizando item ${item.title} com href ${item.href}`);
        return (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-2 mb-1",
              !sidebarOpen && "justify-center px-2",
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
      })}
    </>
  );
};
