
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

export interface AppFeatures {
  networking: FeatureConfig;
  // Adicionar outras features aqui no futuro
}

/**
 * Configuração de features da aplicação
 * Para reativar o networking: altere enabled para true
 */
export const APP_FEATURES: AppFeatures = {
  networking: {
    enabled: false, // NETWORKING DESABILITADO - Para reativar, altere para true
    adminOnly: true, // Quando habilitado, apenas admins terão acesso
    description: 'Sistema de networking inteligente com matchmaking de IA',
    lastModified: '2025-01-06'
  }
};

/**
 * Verifica se uma feature está habilitada
 */
export const isFeatureEnabled = (featureName: keyof AppFeatures): boolean => {
  const feature = APP_FEATURES[featureName];
  return feature?.enabled || false;
};

/**
 * Verifica se uma feature está habilitada para um usuário específico
 */
export const isFeatureEnabledForUser = (
  featureName: keyof AppFeatures, 
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
  
  return true;
};
