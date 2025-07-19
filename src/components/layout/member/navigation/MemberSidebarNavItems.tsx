
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
import { SidebarNavigationGroup } from './SidebarNavigationGroup';
import { TooltipNavItem } from './TooltipNavItem';

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

    return (
      <div className="flex-1 space-y-4 px-2 py-4">
        {/* Grupo: Início */}
        <SidebarNavigationGroup title="Início" sidebarOpen={sidebarOpen}>
          <TooltipNavItem
            to="/dashboard"
            label="Dashboard"
            icon={Home}
            sidebarOpen={sidebarOpen}
          />
        </SidebarNavigationGroup>

        {/* Separador visual */}
        {sidebarOpen && (
          <div className="mx-3 border-t border-border/50" />
        )}

        {/* Grupo: Aprendizado */}
        <SidebarNavigationGroup title="Aprendizado" sidebarOpen={sidebarOpen}>
          <TooltipNavItem
            to="/solutions"
            label="Soluções"
            icon={BookOpen}
            sidebarOpen={sidebarOpen}
            badge="12"
          />
          <TooltipNavItem
            to="/learning"
            label="Formação"
            icon={GraduationCap}
            sidebarOpen={sidebarOpen}
            isNew={true}
          />
          <TooltipNavItem
            to="/learning/certificates"
            label="Certificados"
            icon={Award}
            sidebarOpen={sidebarOpen}
          />
        </SidebarNavigationGroup>

        {/* Separador visual */}
        {sidebarOpen && (
          <div className="mx-3 border-t border-border/50" />
        )}

        {/* Grupo: Ferramentas */}
        <SidebarNavigationGroup title="Ferramentas" sidebarOpen={sidebarOpen}>
          <TooltipNavItem
            to="/tools"
            label="Ferramentas"
            icon={Wrench}
            sidebarOpen={sidebarOpen}
            badge="8"
          />
          <TooltipNavItem
            to="/networking"
            label="Networking"
            icon={Network}
            sidebarOpen={sidebarOpen}
          />
          <TooltipNavItem
            to="/comunidade"
            label="Comunidade"
            icon={MessageSquare}
            sidebarOpen={sidebarOpen}
            badge="3"
          />
        </SidebarNavigationGroup>

        {/* Separador visual */}
        {sidebarOpen && (
          <div className="mx-3 border-t border-border/50" />
        )}

        {/* Grupo: Eventos & Benefícios */}
        <SidebarNavigationGroup title="Eventos" sidebarOpen={sidebarOpen}>
          <TooltipNavItem
            to="/events"
            label="Eventos"
            icon={Calendar}
            sidebarOpen={sidebarOpen}
            badge="2"
          />
          <TooltipNavItem
            to="/benefits"
            label="Benefícios"
            icon={Trophy}
            sidebarOpen={sidebarOpen}
          />
          <TooltipNavItem
            to="/suggestions"
            label="Sugestões"
            icon={Lightbulb}
            sidebarOpen={sidebarOpen}
          />
        </SidebarNavigationGroup>

        {/* Separador visual */}
        {sidebarOpen && (
          <div className="mx-3 border-t border-border/50" />
        )}

        {/* Grupo: Configurações */}
        <SidebarNavigationGroup title="Configurações" sidebarOpen={sidebarOpen}>
          <TooltipNavItem
            to="/profile"
            label="Perfil"
            icon={Settings}
            sidebarOpen={sidebarOpen}
          />
        </SidebarNavigationGroup>

        {/* Grupo Admin - Apenas para administradores */}
        {isAdmin && (
          <>
            {sidebarOpen && (
              <div className="mx-3 border-t border-orange-500/30" />
            )}
            <SidebarNavigationGroup title="Administração" sidebarOpen={sidebarOpen}>
              <TooltipNavItem
                to="/admin"
                label="Admin"
                icon={Users}
                sidebarOpen={sidebarOpen}
                adminOnly={true}
              />
            </SidebarNavigationGroup>
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error('❌ [SIDEBAR-NAV] Erro ao obter contexto de autenticação:', error);
    
    return (
      <div className="space-y-2 px-3 py-4">
        <div className="p-4 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg">
          Erro no contexto de autenticação
        </div>
        <TooltipNavItem
          to="/dashboard"
          label="Dashboard"
          icon={Home}
          sidebarOpen={sidebarOpen}
        />
      </div>
    );
  }
};
