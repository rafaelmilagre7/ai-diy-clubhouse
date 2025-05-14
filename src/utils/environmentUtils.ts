
/**
 * Utilitários para detecção e gerenciamento de ambiente
 */

/**
 * Verifica se a aplicação está rodando em modo de desenvolvimento
 * baseado na URL ou variáveis de ambiente
 */
export const isDevelopmentMode = (): boolean => {
  // Verificações de hostname
  const devHostnames = [
    'localhost',
    '127.0.0.1',
    '.lovable.dev',
    '.lovable.app'
  ];
  
  const isDevHost = devHostnames.some(host => 
    window.location.hostname === host || 
    window.location.hostname.includes(host)
  );
  
  // Verificação da URL de desenvolvimento do Vite
  const isViteDev = window.location.port === '5173' || 
                    window.location.port === '3000' ||
                    window.location.port === '3001';
                    
  // Verificação se estamos em ambiente de desenvolvimento do Vite
  const isViteDevMode = import.meta.env.DEV === true;
  
  return isDevHost || isViteDev || isViteDevMode;
};

/**
 * Verifica se as variáveis de ambiente do Supabase estão configuradas
 */
export const hasSupabaseEnv = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return Boolean(supabaseUrl && supabaseAnonKey);
};

/**
 * Gera um ID válido para simulação
 */
export const generateMockId = (prefix: string = 'mock'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Verifica se o ID é um ID simulado
 */
export const isMockId = (id: string): boolean => {
  return id?.startsWith('mock-');
};

/**
 * Verifica se é necessário operar em modo offline
 */
export const shouldUseOfflineMode = (): boolean => {
  return isDevelopmentMode() && !hasSupabaseEnv();
};

/**
 * Obtém a URL base da API em diferentes ambientes
 */
export const getApiBaseUrl = (): string => {
  // Verificar se temos uma URL específica nas variáveis de ambiente
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl;
  
  // Verificar se temos a URL do Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    // Transformar URL do Supabase em URL de API
    return supabaseUrl.replace('.supabase.co', '.functions.supabase.co');
  }
  
  // Fallback para localhost em desenvolvimento
  if (isDevelopmentMode()) {
    return 'http://localhost:54321';
  }
  
  // Fallback genérico
  return '';
};
