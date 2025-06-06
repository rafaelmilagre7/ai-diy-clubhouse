
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
  // Networking removido na Fase 4 - Frontend cleanup completo
  // Adicionar outras features aqui no futuro
}

/**
 * Configuração de features da aplicação
 * Networking foi completamente removido do frontend
 */
export const APP_FEATURES: AppFeatures = {
  // Networking removido completamente - Fase 4 executada
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
