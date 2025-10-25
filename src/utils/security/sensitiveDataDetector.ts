/**
 * 🔒 Detector de Dados Sensíveis em localStorage
 * 
 * Utilitário para identificar e alertar sobre armazenamento inseguro
 * de dados sensíveis no localStorage (vulnerável a XSS).
 */

const isDevelopment = import.meta.env.DEV;

// Padrões que indicam dados sensíveis
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /auth/i,
  /session/i,
  /credential/i,
  /private[_-]?key/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /jwt/i,
  /bearer/i,
];

// Keys conhecidas do Supabase (esperadas)
const EXPECTED_SUPABASE_KEYS = [
  'sb-',
  'supabase.auth.token',
  'sb-auth-token',
  'sb-refresh-token',
];

interface SensitiveDataReport {
  key: string;
  reason: string;
  value?: string; // Apenas em desenvolvimento
  recommendedAction: string;
}

/**
 * Verifica se uma chave contém dados sensíveis
 */
export const isSensitiveKey = (key: string): boolean => {
  // Ignorar keys esperadas do Supabase
  if (EXPECTED_SUPABASE_KEYS.some(expected => key.startsWith(expected))) {
    return false;
  }

  // Verificar padrões sensíveis
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
};

/**
 * Escaneia localStorage em busca de dados sensíveis
 */
export const scanLocalStorageForSensitiveData = (): SensitiveDataReport[] => {
  const reports: SensitiveDataReport[] = [];

  try {
    // Iterar sobre todas as chaves do localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (isSensitiveKey(key)) {
        const value = localStorage.getItem(key);
        
        reports.push({
          key,
          reason: 'Chave contém padrão sensível detectado',
          value: isDevelopment ? value?.substring(0, 50) : undefined,
          recommendedAction: 'Considere usar sessionStorage ou cookies httpOnly'
        });
      }
    }
  } catch (error) {
    console.error('[SENSITIVE-DATA-DETECTOR] Erro ao escanear localStorage:', error);
  }

  return reports;
};

/**
 * Alerta em desenvolvimento sobre dados sensíveis
 */
export const warnAboutSensitiveData = (): void => {
  if (!isDevelopment) return;

  const reports = scanLocalStorageForSensitiveData();
  
  if (reports.length === 0) {
    console.info('✅ [SEGURANÇA] Nenhum dado sensível inesperado detectado no localStorage');
    return;
  }

  console.warn('⚠️ [SEGURANÇA] Dados potencialmente sensíveis detectados no localStorage:');
  console.table(reports);
  
  console.warn(`
🔒 RECOMENDAÇÕES DE SEGURANÇA:

1. localStorage é vulnerável a XSS - mesmo com proteções, evite dados sensíveis
2. Use sessionStorage para dados temporários
3. Use cookies httpOnly para tokens de autenticação (quando possível)
4. Nunca armazene senhas ou chaves privadas no localStorage

Dados detectados: ${reports.length}
  `);
};

/**
 * Valida se é seguro armazenar um valor no localStorage
 */
export const validateLocalStorageSafety = (key: string, value: any): {
  safe: boolean;
  warning?: string;
} => {
  // Verificar se a chave é sensível
  if (isSensitiveKey(key)) {
    return {
      safe: false,
      warning: `A chave "${key}" parece conter dados sensíveis. Considere alternativas mais seguras.`
    };
  }

  // Verificar se o valor parece ser um token/senha
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    
    if (
      lowerValue.includes('bearer ') ||
      lowerValue.length > 100 || // Tokens geralmente são longos
      /^[A-Za-z0-9+/=]{40,}$/.test(value) // Base64 longo (possível token)
    ) {
      return {
        safe: false,
        warning: `O valor para "${key}" parece ser um token. Use armazenamento mais seguro.`
      };
    }
  }

  return { safe: true };
};

/**
 * Wrapper seguro para localStorage.setItem com validação
 */
export const safeSetLocalStorage = (key: string, value: any): boolean => {
  const validation = validateLocalStorageSafety(key, value);
  
  if (!validation.safe && isDevelopment) {
    console.warn('[SEGURANÇA]', validation.warning);
  }

  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.error(`[SEGURANÇA] Erro ao salvar "${key}" no localStorage:`, error);
    return false;
  }
};

/**
 * Inicializa detector em desenvolvimento
 */
export const initSensitiveDataDetector = (): void => {
  if (!isDevelopment) return;

  // Scan inicial após 2 segundos (esperar app carregar)
  setTimeout(() => {
    warnAboutSensitiveData();
  }, 2000);

  // Scan periódico a cada 30 segundos em desenvolvimento
  setInterval(() => {
    const reports = scanLocalStorageForSensitiveData();
    if (reports.length > 0) {
      console.warn(`⚠️ [SEGURANÇA] ${reports.length} dados sensíveis ainda no localStorage`);
    }
  }, 30000);
};
