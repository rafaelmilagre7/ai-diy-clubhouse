
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MemberSidebarNavItem } from './MemberSidebarNavItem';
import { useOptimizedAuth } from '@/hooks/auth/useOptimizedAuth';
import { useOptimizedNetworkingAccess } from '@/hooks/networking/useOptimizedNetworkingAccess';
import { 
  Home, 
  Lightbulb, 
  Wrench, 
  Star, 
  Calendar, 
  BookOpen, 
  Users, 
  MessageSquare,
  Route,
  Gift
} from 'lucide-react';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const location = useLocation();
  const { isAdmin } = useOptimizedAuth();
  const { hasAccess: hasNetworkingAccess, isLoading: networkingLoading } = useOptimizedNetworkingAccess();

  // Memoizar verificação de rota ativa
  const isActiveRoute = useMemo(() => (path: string) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/');
  }, [location.pathname]);

  // Memoizar itens de navegação
  const navigationItems = useMemo(() => {
    const baseItems = [
      {
        to: '/dashboard',
        icon: Home,
        label: 'Dashboard',
        isActive: isActiveRoute('/dashboard') || isActiveRoute('/')
      },
      {
        to: '/implementation-trail',
        icon: Route,
        label: 'Trilha de IA',
        isActive: isActiveRoute('/implementation-trail')
      },
      {
        to: '/solutions',
        icon: Lightbulb,
        label: 'Soluções',
        isActive: isActiveRoute('/solutions')
      },
      {
        to: '/tools',
        icon: Wrench,
        label: 'Ferramentas',
        isActive: isActiveRoute('/tools')
      },
      {
        to: '/benefits',
        icon: Gift,
        label: 'Benefícios',
        isActive: isActiveRoute('/benefits')
      },
      {
        to: '/events',
        icon: Calendar,
        label: 'Eventos',
        isActive: isActiveRoute('/events')
      },
      {
        to: '/learning',
        icon: BookOpen,
        label: 'Aprendizado',
        isActive: isActiveRoute('/learning')
      },
      {
        to: '/comunidade',
        icon: MessageSquare,
        label: 'Comunidade',
        isActive: location.pathname.startsWith('/comunidade')
      }
    ];

    // Adicionar networking apenas se tiver acesso ou for admin
    if (hasNetworkingAccess || isAdmin) {
      baseItems.push({
        to: '/networking',
        icon: Users,
        label: 'Networking',
        isActive: isActiveRoute('/networking')
      });
    }

    return baseItems;
  }, [isActiveRoute, hasNetworkingAccess, isAdmin, location.pathname]);

  return (
    <>
      {navigationItems.map((item) => (
        <MemberSidebarNavItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive}
          sidebarOpen={sidebarOpen}
        />
      ))}
    </>
  );
};
