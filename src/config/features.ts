
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
 * Implementa controle de acesso baseado em roles
 */
export const isFeatureEnabledForUser = (
  featureName: string, 
  userRole?: string
): boolean => {
  const feature = APP_FEATURES[featureName];
  
  if (!feature?.enabled) {
    return false;
  }
  
  // Se a feature exige admin e o usuário não é admin, negar acesso
  if (feature.adminOnly && userRole !== 'admin') {
    return false;
  }

  // Controle específico por feature baseado no role
  switch (featureName) {
    case 'solutions':
      // Soluções apenas para admin e papéis específicos (não formação)
      return userRole === 'admin' || userRole === 'member' || userRole === 'membro_club';
      
    case 'learning':
      // Learning/Formação disponível para formacao, admin e membros
      return userRole === 'admin' || userRole === 'formacao' || userRole === 'member' || userRole === 'membro_club';
      
    case 'tools':
      // Ferramentas para admin e membros premium
      return userRole === 'admin' || userRole === 'member' || userRole === 'membro_club';
      
    case 'benefits':
      // Benefícios para membros pagos
      return userRole === 'admin' || userRole === 'member' || userRole === 'membro_club';
      
    case 'networking':
      // Networking para membros premium
      return userRole === 'admin' || userRole === 'member' || userRole === 'membro_club';
      
    case 'events':
      // Eventos para membros premium
      return userRole === 'admin' || userRole === 'member' || userRole === 'membro_club';
      
    default:
      // Por padrão, permitir acesso se feature está habilitada
      return true;
  }
};
