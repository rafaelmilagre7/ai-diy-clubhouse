
import { useAuth } from '@/contexts/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

export type FeaturePermission = 
  | 'networking.access'
  | 'courses.manage'
  | 'lms.manage'
  | 'tools.admin'
  | 'solutions.view'
  | 'solutions.create'
  | 'analytics.view'
  | 'community.moderate'
  | 'events.manage'
  | 'users.manage'
  | 'roles.manage';

export interface FeatureAccessConfig {
  permission: FeaturePermission;
  fallbackRoles?: string[];
  description: string;
  upgradeMessage?: string;
}

const FEATURE_CONFIGS: Record<string, FeatureAccessConfig> = {
  networking: {
    permission: 'networking.access',
    fallbackRoles: ['admin', 'membro_club'],
    description: 'Acesso ao sistema de networking inteligente',
    upgradeMessage: 'O Networking Inteligente é exclusivo para membros Club. Faça upgrade para membro Club para conectar-se com outros empreendedores e expandir sua rede de negócios.'
  },
  solutions: {
    permission: 'solutions.view',
    fallbackRoles: ['admin', 'member', 'membro_club'],
    description: 'Visualização e acesso às soluções'
  },
  courseManagement: {
    permission: 'courses.manage',
    fallbackRoles: ['admin', 'formacao'],
    description: 'Gerenciamento de cursos e aulas'
  },
  lmsManagement: {
    permission: 'lms.manage',
    fallbackRoles: ['admin'],
    description: 'Gestão completa do sistema de aprendizagem (LMS)'
  },
  toolsAdmin: {
    permission: 'tools.admin',
    fallbackRoles: ['admin'],
    description: 'Administração de ferramentas'
  },
  analytics: {
    permission: 'analytics.view',
    fallbackRoles: ['admin'],
    description: 'Visualização de analytics'
  }
};

export function useFeatureAccess(featureName: string) {
  const { profile } = useAuth();
  const { hasPermission } = usePermissions();
  
  const config = FEATURE_CONFIGS[featureName];
  
  if (!config) {
    console.warn(`Configuração de acesso não encontrada para: ${featureName}`);
    return {
      hasAccess: false,
      accessMessage: 'Recurso não configurado',
      config: null
    };
  }
  
  // Verificar primeiro se tem a permissão específica
  const hasPermissionAccess = hasPermission(config.permission);
  
  // Fallback para verificação por papel (manter compatibilidade)
  const hasRoleAccess = config.fallbackRoles?.includes(profile?.role || '') || false;
  
  const hasAccess = hasPermissionAccess || hasRoleAccess;
  
  const accessMessage = !hasAccess && config.upgradeMessage 
    ? config.upgradeMessage 
    : !hasAccess 
      ? `Acesso negado: ${config.description}`
      : '';

  return {
    hasAccess,
    accessMessage,
    config
  };
}
