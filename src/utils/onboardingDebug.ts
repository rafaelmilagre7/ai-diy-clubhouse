// Utilitário para debugging do onboarding
export const debugOnboarding = {
  // Log estruturado para identificar erros 400
  logError: (operation: string, error: any, context?: any) => {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      operation,
      error: {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      },
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.group(`🔍 [ONBOARDING-DEBUG] ${operation}`);
    console.error('Error Info:', errorInfo);
    
    // Verificar se é erro de rate limiting
    if (error?.status === 429 || error?.message?.includes('rate') || error?.message?.includes('limit')) {
      console.warn('⚠️ Possível erro de rate limiting detectado');
    }
    
    // Verificar se é erro de validação
    if (error?.status === 400) {
      console.warn('⚠️ Erro 400 - Verificar dados enviados:', context);
    }
    
    console.groupEnd();
    
    return errorInfo;
  },

  // Log de sucesso para comparação
  logSuccess: (operation: string, data?: any) => {
    console.log(`✅ [ONBOARDING-DEBUG] ${operation} - Sucesso`, {
      timestamp: new Date().toISOString(),
      data: data ? JSON.stringify(data).slice(0, 200) + '...' : 'N/A'
    });
  },

  // Verificar estrutura dos dados antes do envio
  validateDataStructure: (data: any, expectedFields: string[]) => {
    const issues: string[] = [];
    
    expectedFields.forEach(field => {
      if (!(field in data)) {
        issues.push(`Campo obrigatório ausente: ${field}`);
      }
    });
    
    // Verificar tipos específicos
    if (data.user_id && typeof data.user_id !== 'string') {
      issues.push('user_id deve ser string');
    }
    
    if (data.current_step && typeof data.current_step !== 'number') {
      issues.push('current_step deve ser number');
    }
    
    if (data.completed_steps && !Array.isArray(data.completed_steps)) {
      issues.push('completed_steps deve ser array');
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ [DATA-VALIDATION] Problemas detectados:', issues);
      console.log('Dados para análise:', data);
    }
    
    return issues;
  }
};