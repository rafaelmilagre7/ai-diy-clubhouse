
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
import { useOnboardingCompletionCheck } from '@/hooks/onboarding/useOnboardingCompletionCheck';
import { useAuth } from '@/contexts/auth';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const location = useLocation();
  const { hasAccess: hasNetworkingAccess } = useNetworkingAccess();
  const { profile } = useAuth();
  const { data: onboardingStatus, isLoading: onboardingLoading } = useOnboardingCompletionCheck();

  // Determinar o item do onboarding baseado no status
  const getOnboardingItem = () => {
    if (onboardingLoading) {
      return {
        title: "Carregando...",
        href: "/onboarding-new",
        icon: BookOpen,
      };
    }

    if (onboardingStatus?.isCompleted) {
      return {
        title: "Review do Onboarding",
        href: "/profile/onboarding-review",
        icon: FileText,
      };
    }

    return {
      title: "Onboarding",
      href: "/onboarding-new",
      icon: BookOpen,
    };
  };

  const onboardingItem = getOnboardingItem();

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

  // Adicionar networking apenas se o usuário tem acesso
  if (hasNetworkingAccess) {
    menuItems.splice(5, 0, {
      title: "Networking",
      href: "/networking",
      icon: Users,
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
      {menuItems.map((item) => (
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
      ))}
    </>
  );
};
