
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Home, Settings, Users, BookOpen, Award, HelpCircle } from 'lucide-react';
import { SidebarNavItem } from './SidebarNavItem';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  // Adicionar debugging para identificar o problema
  console.log('🔍 [SIDEBAR-NAV] Componente renderizado');
  
  try {
    const { user, profile, isAdmin } = useAuth();
    
    console.log('✅ [SIDEBAR-NAV] Contexto obtido com sucesso:', {
      hasUser: !!user,
      hasProfile: !!profile,
      isAdmin,
      userEmail: user?.email
    });

    const navigationItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/solutions', label: 'Soluções', icon: BookOpen },
      { href: '/certificates', label: 'Certificados', icon: Award },
      { href: '/profile', label: 'Perfil', icon: Settings },
      { href: '/support', label: 'Suporte', icon: HelpCircle },
    ];

    // Adicionar item de admin apenas se for admin
    if (isAdmin) {
      navigationItems.push({
        href: '/admin',
        label: 'Admin',
        icon: Users
      });
    }

    return (
      <div className="space-y-2">
        {navigationItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            sidebarOpen={sidebarOpen}
          />
        ))}
      </div>
    );
  } catch (error) {
    console.error('❌ [SIDEBAR-NAV] Erro ao obter contexto de autenticação:', error);
    
    // Fallback: renderizar navegação básica sem contexto
    return (
      <div className="space-y-2">
        <div className="p-4 text-red-500 text-sm">
          Erro no contexto de autenticação
        </div>
        <SidebarNavItem
          href="/dashboard"
          label="Dashboard"
          icon={Home}
          sidebarOpen={sidebarOpen}
        />
      </div>
    );
  }
};
