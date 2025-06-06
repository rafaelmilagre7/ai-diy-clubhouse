
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
 * Networking foi completamente removido do frontend - Fase 4 executada
 */
export const APP_FEATURES: Record<string, FeatureConfig> = {
  // Sistema preparado para futuras features
  // Adicionar novas features aqui conforme necessário
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
  
  return true;
};
