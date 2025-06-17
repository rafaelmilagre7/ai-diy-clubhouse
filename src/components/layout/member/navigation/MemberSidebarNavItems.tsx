
import React from 'react';
import { useAuth } from "@/contexts/auth/OptimizedAuthContext";
import { MemberSidebarNavItem } from './MemberSidebarNavItem';
import { 
  LayoutDashboard, 
  Lightbulb, 
  Wrench, 
  User, 
  Calendar,
  GraduationCap,
  MessageCircle,
  Gift,
  Route
} from 'lucide-react';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const { isAdmin } = useAuth();

  const navigationItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      to: '/trilha-implementacao',
      icon: Route,
      label: 'Trilha de Implementação'
    },
    {
      to: '/solutions',
      icon: Lightbulb,
      label: 'Soluções'
    },
    {
      to: '/tools',
      icon: Wrench,
      label: 'Ferramentas'
    },
    {
      to: '/learning',
      icon: GraduationCap,
      label: 'Aprendizado'
    },
    {
      to: '/comunidade',
      icon: MessageCircle,
      label: 'Comunidade'
    },
    {
      to: '/events',
      icon: Calendar,
      label: 'Eventos'
    },
    {
      to: '/benefits',
      icon: Gift,
      label: 'Benefícios'
    },
    {
      to: '/profile',
      icon: User,
      label: 'Perfil'
    }
  ];

  // Admin items
  const adminItems = [
    {
      to: '/admin',
      icon: LayoutDashboard,
      label: 'Admin Dashboard',
      adminOnly: true
    }
  ];

  const allItems = isAdmin ? [...navigationItems, ...adminItems] : navigationItems;

  return (
    <div className="space-y-1 px-3">
      {allItems.map((item) => (
        <MemberSidebarNavItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          sidebarOpen={sidebarOpen}
          adminOnly={item.adminOnly}
        />
      ))}
    </div>
  );
};
