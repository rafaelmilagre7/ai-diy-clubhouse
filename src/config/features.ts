
/**
 * Configuração central de features da aplicação
 * Permite controle granular e rollback fácil de funcionalidades
 */

export interface FeatureConfig {
  enabled: boolean;
  adminOnly?: boolean;
  description: string;
  lastModified: string;
}

/**
 * Configuração de features da aplicação
 * Controle de acesso por seções da plataforma
 */
export const APP_FEATURES: Record<string, FeatureConfig> = {
  implementation_trail: {
    enabled: true,
    adminOnly: false,
    description: "Trilha de Implementação Personalizada com IA - Recomendações baseadas no onboarding completo",
    lastModified: "2025-01-24T10:00:00Z"
  },
  solutions: {
    enabled: true,
    adminOnly: false, // Controlado por roles específicos
    description: "Acesso às soluções de negócio da plataforma",
    lastModified: "2025-01-24T15:00:00Z"
  },
  learning: {
    enabled: true,
    adminOnly: false,
    description: "Acesso aos cursos e formações da plataforma", 
    lastModified: "2025-01-24T15:00:00Z"
  },
  tools: {
    enabled: true,
    adminOnly: false,
    description: "Acesso às ferramentas e integrações",
    lastModified: "2025-01-24T15:00:00Z"
  },
  benefits: {
    enabled: true,
    adminOnly: false,
    description: "Acesso aos benefícios exclusivos para membros",
    lastModified: "2025-01-24T15:00:00Z"
  },
  networking: {
    enabled: true,
    adminOnly: false,
    description: "Acesso ao sistema de networking inteligente",
    lastModified: "2025-01-24T15:00:00Z"
  },
  events: {
    enabled: true,
    adminOnly: false,
    description: "Acesso ao calendário de eventos",
    lastModified: "2025-01-24T15:00:00Z"
  }
};

/**
 * Verifica se uma feature está habilitada
 */
export const isFeatureEnabled = (featureName: string): boolean => {
  const feature = APP_FEATURES[featureName];
  return feature?.enabled || false;
};

/**
 * Verifica se uma feature está habilitada para um usuário específico
 * Implementa controle de acesso baseado em roles e permissões do banco
 */
export const isFeatureEnabledForUser = (
  featureName: string, 
  userRole?: string,
  userPermissions?: Record<string, any>
): boolean => {
  const feature = APP_FEATURES[featureName];
  
  if (!feature?.enabled) {
    return false;
  }
  
  // Se a feature exige admin e o usuário não é admin, negar acesso
  if (feature.adminOnly && userRole !== 'admin') {
    return false;
  }

  // Admin sempre tem acesso total
  if (userRole === 'admin') {
    return true;
  }

  // Se não temos permissões específicas, usar regras básicas por role
  if (!userPermissions || Object.keys(userPermissions).length === 0) {
    // Fallback para roles básicas conhecidas
    switch (featureName) {
      case 'learning':
        return userRole === 'formacao' || userRole === 'member' || userRole === 'membro_club';
      default:
        return false;
    }
  }

  // Usar permissões específicas do banco (configuradas no admin)
  switch (featureName) {
    case 'solutions':
      return !!userPermissions.solutions;
      
    case 'learning':
      return !!userPermissions.formacao || !!userPermissions.learning;
      
    case 'tools':
      return !!userPermissions.tools || !!userPermissions.benefits;
      
    case 'benefits':
      return !!userPermissions.benefits || !!userPermissions.tools;
      
    case 'networking':
      return !!userPermissions.networking;
      
    case 'events':
      return !!userPermissions.events;
      
    case 'community':
      return !!userPermissions.community;
      
    case 'certificates':
      return !!userPermissions.certificates;
      
    default:
      // Por padrão, verificar se existe uma permissão com o mesmo nome da feature
      return !!userPermissions[featureName];
  }
};
