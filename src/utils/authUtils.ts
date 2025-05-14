
/**
 * Limpa todos os tokens de autenticação do localStorage e sessionStorage
 * para evitar conflitos e problemas de autenticação
 */
export const cleanupAuthState = () => {
  console.log("Limpando estado de autenticação");
  
  try {
    // Remover token principal
    localStorage.removeItem('supabase.auth.token');
    
    // Remover token específico do projeto
    localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
    
    // Limpar todos os tokens que começam com supabase.auth ou sb-
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Limpar também do sessionStorage, caso esteja sendo usado
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log("Estado de autenticação limpo com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao limpar estado de autenticação:", error);
    return false;
  }
};

/**
 * Força um logout limpo com redirecionamento
 */
export const forceLogout = async () => {
  try {
    cleanupAuthState();
    // Redirecionar para página de login
    window.location.href = '/login';
    return true;
  } catch (error) {
    console.error("Erro ao forçar logout:", error);
    return false;
  }
};
