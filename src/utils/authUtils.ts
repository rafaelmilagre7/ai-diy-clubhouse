
/**
 * Limpa todo o estado de autenticação do navegador
 */
export const cleanupAuthState = () => {
  try {
    // Remover chaves específicas do Supabase
    const keysToRemove = [
      'supabase.auth.token',
      'sb-access-token',
      'sb-refresh-token'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Remover todas as chaves que começam com 'sb-' ou 'supabase.'
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
    
    console.log('Estado de autenticação limpo');
  } catch (error) {
    console.error('Erro ao limpar estado de autenticação:', error);
  }
};

/**
 * Redireciona para o domínio correto baseado no ambiente
 */
export const redirectToDomain = (path: string) => {
  const baseUrl = window.location.origin.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://app.viverdeia.ai';
    
  window.location.href = `${baseUrl}${path}`;
};
