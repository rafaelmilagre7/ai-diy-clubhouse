
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
        console.log(`Removendo token do sessionStorage: ${key}`);
        sessionStorage.removeItem(key);
      }
    });
  }
  
  // Remover outras chaves de estado específicas da aplicação
  localStorage.removeItem('adminCache');
  localStorage.removeItem('permissionsCache');
  localStorage.removeItem('usersData');
  localStorage.removeItem('rolesData');
  localStorage.removeItem('lastUsersLoad');
};

/**
 * Força atualização completa da página
 */
export const forcePageRefresh = (path?: string) => {
  const url = path ? `${window.location.origin}${path}` : window.location.href;
  window.location.href = url;
};
