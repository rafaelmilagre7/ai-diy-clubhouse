
/**
 * Utilitários de autenticação com foco em segurança
 */

/**
 * Limpa todo o estado de autenticação do navegador de forma segura
 */
export const cleanupAuthState = () => {
  try {
    // Lista de chaves conhecidas do Supabase para remoção
    const supabaseKeys = [
      'supabase.auth.token',
      'sb-access-token', 
      'sb-refresh-token'
    ];
    
    // Remover chaves específicas primeiro
    supabaseKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (e) {
        // Ignora erros de acesso ao storage
      }
    });
    
    // Remover todas as chaves que começam com padrões do Supabase
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.startsWith('supabase.')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.startsWith('supabase.')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Em caso de erro, força limpeza completa
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (clearError) {
        console.error('[SECURITY] Failed to clear storage:', clearError);
      }
    }
    
    console.info('[SECURITY] Auth state cleaned successfully');
  } catch (error) {
    console.error('[SECURITY] Error cleaning auth state:', error);
    // Em caso de falha, tentar limpeza básica
    try {
      localStorage.clear();
    } catch (e) {
      // Último recurso - recarregar página
      window.location.reload();
    }
  }
};

/**
 * Redireciona de forma segura para o domínio correto
 */
export const redirectToDomain = (path: string) => {
  try {
    // Validar o path para prevenir redirecionamentos maliciosos
    if (!path || typeof path !== 'string') {
      path = '/dashboard';
    }
    
    // Garantir que o path comece com /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Permitir apenas paths internos (sem protocolo)
    if (path.includes('://') || path.includes('..')) {
      console.warn('[SECURITY] Suspicious redirect attempt blocked:', path);
      path = '/dashboard';
    }
    
    const baseUrl = window.location.origin.includes('localhost')
      ? 'http://localhost:3000'
      : 'https://app.viverdeia.ai';
      
    const targetUrl = `${baseUrl}${path}`;
    
    // Log do redirecionamento para auditoria (sem dados sensíveis)
    console.info('[SECURITY] Secure redirect', {
      from: window.location.pathname,
      to: path,
      timestamp: new Date().toISOString()
    });
    
    window.location.href = targetUrl;
  } catch (error) {
    console.error('[SECURITY] Redirect error:', error);
    // Fallback seguro
    window.location.href = '/dashboard';
  }
};

/**
 * Valida se um email pertence a um domínio confiável
 */
export const isTrustedEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const trustedDomains = [
    'viverdeia.ai',
    'teste.com' // apenas para desenvolvimento
  ];
  
  const trustedEmails = [
    'admin@viverdeia.ai',
    'rafael@viverdeia.ai',
    'admin@teste.com'
  ];
  
  // Verificar emails específicos
  if (trustedEmails.includes(email.toLowerCase())) {
    return true;
  }
  
  // Verificar domínios confiáveis
  const domain = email.split('@')[1]?.toLowerCase();
  return trustedDomains.includes(domain || '');
};

/**
 * Gera um token seguro para sessão
 */
export const generateSecureToken = (): string => {
  try {
    // Usar crypto API se disponível
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback para Math.random (menos seguro mas funcional)
    return Math.random().toString(36).substr(2, 15) + 
           Math.random().toString(36).substr(2, 15);
  } catch (error) {
    console.error('[SECURITY] Token generation error:', error);
    return Date.now().toString(36) + Math.random().toString(36);
  }
};

/**
 * Valida força da sessão
 */
export const validateSessionStrength = (session: any): boolean => {
  if (!session) return false;
  
  try {
    // Verificar se a sessão tem os campos necessários
    if (!session.access_token || !session.user) return false;
    
    // Verificar se o token não está expirado
    if (session.expires_at && session.expires_at < Date.now() / 1000) {
      console.warn('[SECURITY] Session expired');
      return false;
    }
    
    // Verificar se o usuário tem ID válido
    if (!session.user.id || typeof session.user.id !== 'string') {
      console.warn('[SECURITY] Invalid user ID in session');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[SECURITY] Session validation error:', error);
    return false;
  }
};
