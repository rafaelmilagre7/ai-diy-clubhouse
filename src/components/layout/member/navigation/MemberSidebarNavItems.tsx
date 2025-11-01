
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useSidebarStats } from '@/hooks/useSidebarStats';
import { useNavPermissions } from '@/hooks/auth/useNavPermissions';
import { isUserMaster } from '@/utils/roleHelpers';
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
  Trophy,
  Bot,
  Layout
} from 'lucide-react';
import { SidebarNavigationGroup } from './SidebarNavigationGroup';
import { TooltipNavItem } from './TooltipNavItem';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const { user, profile, isAdmin } = useAuth();
  const { data: stats, isLoading } = useSidebarStats();
  const isMaster = isUserMaster(profile);
  const {
    canViewSolutions,
    canViewTools,
    canViewLearning,
    canViewBenefits,
    canViewNetworking,
    canViewCommunity,
    canViewMentorships,
    canViewSuggestions,
    canViewAITrail,
    canViewCertificates,
    canViewBuilder,
    loading: permissionsLoading
  } = useNavPermissions();

  // Log de debug para confirmar versão do código
  console.log('🔍 [SIDEBAR] Versão corrigida carregada - Gestão de Equipe em Configurações');

  try {

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
            to="/trilha-implementacao"
            label="Trilha com IA"
            icon={Bot}
            sidebarOpen={sidebarOpen}
            isNew={true}
          />
          <TooltipNavItem
            to="/solutions"
            label="Soluções"
            icon={BookOpen}
            sidebarOpen={sidebarOpen}
            badge={isLoading ? "..." : stats?.solutions?.toString()}
          />
          <TooltipNavItem
            to="/learning"
            label="Formação"
            icon={GraduationCap}
            sidebarOpen={sidebarOpen}
            badge={isLoading ? "..." : stats?.courses?.toString()}
          />
          {canViewMentorships && (
            <TooltipNavItem
              to="/mentorias"
              label="Mentorias"
              icon={Calendar}
              sidebarOpen={sidebarOpen}
              badge={isLoading ? "..." : stats?.monthlyMentorships?.toString()}
            />
          )}
          {canViewCommunity && (
            <TooltipNavItem
              to="/comunidade"
              label="Comunidade"
              icon={MessageSquare}
              sidebarOpen={sidebarOpen}
              badge={isLoading ? "..." : stats?.communityTopics?.toString()}
            />
          )}
        </SidebarNavigationGroup>

        {/* Separador visual */}
        {sidebarOpen && (
          <div className="mx-3 border-t border-border/50" />
        )}

        {/* Grupo: Ferramentas */}
        <SidebarNavigationGroup title="Ferramentas" sidebarOpen={sidebarOpen}>
          {canViewBuilder && (
          <TooltipNavItem
            to="/ferramentas/builder"
            label="Builder"
            icon={Layout}
            sidebarOpen={sidebarOpen}
            isNew={true}
          />
          )}
          {canViewTools && (
            <TooltipNavItem
              to="/tools"
              label="Ferramentas"
              icon={Wrench}
              sidebarOpen={sidebarOpen}
              badge={isLoading ? "..." : stats?.tools?.toString()}
            />
          )}
          {canViewBenefits && (
            <TooltipNavItem
              to="/benefits"
              label="Benefícios"
              icon={Trophy}
              sidebarOpen={sidebarOpen}
              badge={isLoading ? "..." : stats?.benefits?.toString()}
            />
          )}
          {canViewNetworking && (
            <>
              <TooltipNavItem
                to="/networking/connections"
                label="Conexões"
                icon={Users}
                sidebarOpen={sidebarOpen}
              />
              <TooltipNavItem
                to="/networking"
                label="IA Networking"
                icon={Network}
                sidebarOpen={sidebarOpen}
                isNew={true}
              />
            </>
          )}
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

        {/* Grupo: Configurações */}
        <SidebarNavigationGroup title="Configurações" sidebarOpen={sidebarOpen}>
          <TooltipNavItem
            to="/profile"
            label="Perfil"
            icon={Settings}
            sidebarOpen={sidebarOpen}
          />
          {isAdmin && (
            <TooltipNavItem
              to="/team-management"
              label="Gestão de Equipe"
              icon={Users}
              sidebarOpen={sidebarOpen}
            />
          )}
          {canViewSuggestions && (
            <TooltipNavItem
              to="/suggestions"
              label="Sugestões"
              icon={Lightbulb}
              sidebarOpen={sidebarOpen}
            />
          )}
        </SidebarNavigationGroup>

        {/* Grupo Admin - Apenas para administradores */}
        {isAdmin && (
          <>
            {sidebarOpen && (
              <div className="mx-3 border-t border-status-warning/30" />
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
        <div className="p-4 text-status-error text-sm bg-status-error/10 rounded-lg">
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
