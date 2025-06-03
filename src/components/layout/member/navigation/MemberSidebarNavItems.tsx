
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

  // Memoizar itens de navegação com URLs em português
  const navigationItems = useMemo(() => {
    const baseItems = [
      {
        to: '/dashboard',
        icon: Home,
        label: 'Dashboard'
      },
      {
        to: '/trilha-implementacao',
        icon: Route,
        label: 'Trilha de IA'
      },
      {
        to: '/solucoes',
        icon: Lightbulb,
        label: 'Soluções'
      },
      {
        to: '/ferramentas',
        icon: Wrench,
        label: 'Ferramentas'
      },
      {
        to: '/beneficios',
        icon: Gift,
        label: 'Benefícios'
      },
      {
        to: '/eventos',
        icon: Calendar,
        label: 'Eventos'
      },
      {
        to: '/aprendizado',
        icon: BookOpen,
        label: 'Aprendizado'
      },
      {
        to: '/comunidade',
        icon: MessageSquare,
        label: 'Comunidade'
      }
    ];

    // Adicionar networking apenas se tiver acesso ou for admin
    if (hasNetworkingAccess || isAdmin) {
      baseItems.push({
        to: '/networking',
        icon: Users,
        label: 'Networking'
      });
    }

    return baseItems;
  }, [hasNetworkingAccess, isAdmin]);

  return (
    <>
      {navigationItems.map((item) => (
        <MemberSidebarNavItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          sidebarOpen={sidebarOpen}
        />
      ))}
    </>
  );
};
