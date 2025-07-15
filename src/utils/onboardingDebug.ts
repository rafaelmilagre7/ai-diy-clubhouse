// Utilitário simplificado para debugging do onboarding
export const debugOnboarding = {
  // Log apenas para erros críticos
  logError: (operation: string, error: any, context?: any) => {
    // Apenas para erros reais, não para cada operação
    if (error?.status >= 400) {
      console.error(`❌ [ONBOARDING] ${operation}:`, {
        status: error?.status,
        message: error?.message,
        context: context ? JSON.stringify(context).slice(0, 100) : null
      });
    }
  },

  // Log de sucesso apenas quando necessário
  logSuccess: (operation: string) => {
    // Log minimalista
    console.log(`✅ [ONBOARDING] ${operation}`);
  },

  // Validação básica sem spam
  validateDataStructure: (data: any, expectedFields: string[]) => {
    const critical: string[] = [];
    
    // Apenas validações críticas
    if (!data.user_id) critical.push('user_id ausente');
    if (typeof data.current_step !== 'number') critical.push('current_step inválido');
    
    if (critical.length > 0) {
      console.warn('⚠️ [DATA] Problemas críticos:', critical);
    }
    
    return critical;
  }
};