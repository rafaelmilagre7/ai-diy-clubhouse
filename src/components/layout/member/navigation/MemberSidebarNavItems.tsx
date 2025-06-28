
import React from 'react';
import { 
  Home, 
  BookOpen, 
  Wrench, 
  Users, 
  Calendar,
  MessageSquare,
  Lightbulb,
  Settings,
  Shield,
  BarChart3,
  UserPlus,
  Mail,
  Database
} from 'lucide-react';
import { MemberSidebarNavItem } from './MemberSidebarNavItem';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const { profile } = useSimpleAuth();
  
  // Verificar se é admin baseado no SimpleAuth
  const isAdmin = profile?.user_roles?.name === 'admin';

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {/* Navegação Principal */}
      <div className="space-y-1">
        <MemberSidebarNavItem
          to="/dashboard"
          icon={Home}
          label="Dashboard"
          sidebarOpen={sidebarOpen}
        />
        
        <MemberSidebarNavItem
          to="/learning"
          icon={BookOpen}
          label="Aprendizado"
          sidebarOpen={sidebarOpen}
        />
        
        <MemberSidebarNavItem
          to="/solutions"
          icon={Lightbulb}
          label="Soluções"
          sidebarOpen={sidebarOpen}
        />
        
        <MemberSidebarNavItem
          to="/tools"
          icon={Wrench}
          label="Ferramentas"
          sidebarOpen={sidebarOpen}
        />
        
        <MemberSidebarNavItem
          to="/comunidade"
          icon={MessageSquare}
          label="Comunidade"
          sidebarOpen={sidebarOpen}
        />
        
        <MemberSidebarNavItem
          to="/events"
          icon={Calendar}
          label="Eventos"
          sidebarOpen={sidebarOpen}
        />
        
        <MemberSidebarNavItem
          to="/suggestions"
          icon={Lightbulb}
          label="Sugestões"
          sidebarOpen={sidebarOpen}
        />
      </div>

      {/* Seção Admin */}
      {isAdmin && (
        <>
          {sidebarOpen && (
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Administração
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <MemberSidebarNavItem
              to="/admin"
              icon={Shield}
              label="Painel Admin"
              sidebarOpen={sidebarOpen}
              adminOnly={true}
            />
            
            <MemberSidebarNavItem
              to="/admin/analytics"
              icon={BarChart3}
              label="Analytics"
              sidebarOpen={sidebarOpen}
              adminOnly={true}
            />
            
            <MemberSidebarNavItem
              to="/admin/users"
              icon={Users}
              label="Usuários"
              sidebarOpen={sidebarOpen}
              adminOnly={true}
            />
            
            <MemberSidebarNavItem
              to="/admin/invites"
              icon={UserPlus}
              label="Convites"
              sidebarOpen={sidebarOpen}
              adminOnly={true}
            />
            
            <MemberSidebarNavItem
              to="/admin/communications"
              icon={Mail}
              label="Comunicações"
              sidebarOpen={sidebarOpen}
              adminOnly={true}
            />
          </div>
        </>
      )}

      {/* Configurações */}
      <div className="mt-8 space-y-1">
        <MemberSidebarNavItem
          to="/profile"
          icon={Settings}
          label="Perfil"
          sidebarOpen={sidebarOpen}
        />
      </div>
    </nav>
  );
};
