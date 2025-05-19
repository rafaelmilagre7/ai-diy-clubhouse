
/**
 * Utilitário para limpeza de estado de autenticação
 */
export const clearAuthTokens = () => {
  console.log("Limpando todos os tokens de autenticação");
  
  // Remover tokens de autenticação padrão
  localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
  localStorage.removeItem('supabase.auth.token');
  
  // Remover todas as chaves de autenticação Supabase do localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removendo token: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Remover do sessionStorage se estiver em uso
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};
