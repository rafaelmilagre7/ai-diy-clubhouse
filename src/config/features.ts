
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
 * Implementation Trail DESATIVADO - Fase 2 executada
 */
export const APP_FEATURES: Record<string, FeatureConfig> = {
  implementation_trail: {
    enabled: true, // ✅ REATIVADO - Trilha de Implementação Personalizada com IA
    adminOnly: false,
    description: "Trilha de Implementação Personalizada com IA - Recomendações baseadas no onboarding completo",
    lastModified: "2025-01-24T10:00:00Z"
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
