
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { 
  Home, 
  Settings, 
  Users, 
  BookOpen, 
  Award, 
  HelpCircle,
  GraduationCap,
  Network,
  MessageSquare,
  Wrench,
  Lightbulb,
  Calendar,
  Trophy
} from 'lucide-react';
import { MemberSidebarNavItem } from './MemberSidebarNavItem';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const { user, profile, isAdmin } = useAuth();
  
  console.log('🔍 [SIDEBAR-NAV] Componente renderizado');
  
  try {
    console.log('✅ [SIDEBAR-NAV] Contexto obtido com sucesso:', {
      hasUser: !!user,
      hasProfile: !!profile,
      isAdmin,
      userEmail: user?.email
    });

    const navigationItems = [
      { to: '/dashboard', label: 'Dashboard', icon: Home },
      { to: '/solutions', label: 'Soluções', icon: BookOpen },
      { to: '/learning', label: 'Formação', icon: GraduationCap },
      { to: '/tools', label: 'Ferramentas', icon: Wrench },
      { to: '/networking', label: 'Networking', icon: Network },
      { to: '/comunidade', label: 'Comunidade', icon: MessageSquare },
      { to: '/suggestions', label: 'Sugestões', icon: Lightbulb },
      { to: '/events', label: 'Eventos', icon: Calendar },
      { to: '/learning/certificates', label: 'Certificados', icon: Award },
      { to: '/benefits', label: 'Benefícios', icon: Trophy },
      { to: '/profile', label: 'Perfil', icon: Settings },
      { to: '/support', label: 'Suporte', icon: HelpCircle },
    ];

    // Adicionar item de admin apenas se for admin
    if (isAdmin) {
      navigationItems.push({
        to: '/admin',
        label: 'Admin',
        icon: Users
      });
    }

    return (
      <div className="space-y-1 px-3 py-4">
        {navigationItems.map((item) => (
          <MemberSidebarNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            sidebarOpen={sidebarOpen}
          />
        ))}
      </div>
    );
  } catch (error) {
    console.error('❌ [SIDEBAR-NAV] Erro ao obter contexto de autenticação:', error);
    
    return (
      <div className="space-y-2 px-3 py-4">
        <div className="p-4 text-red-500 text-sm">
          Erro no contexto de autenticação
        </div>
        <MemberSidebarNavItem
          to="/dashboard"
          label="Dashboard"
          icon={Home}
          sidebarOpen={sidebarOpen}
        />
      </div>
    );
  }
};
