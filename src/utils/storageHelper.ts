// Utilitário para limpar o armazenamento local (completo)
export const clearLocalStorage = () => {
  try {
    console.log("[DEBUG] Limpando localStorage");
    localStorage.clear();
    if (typeof sessionStorage !== "undefined") sessionStorage.clear();
    console.log("[DEBUG] localStorage e sessionStorage limpos com sucesso");
    return true;
  } catch (error) {
    console.error("[ERRO] Falha ao limpar localStorage/sessionStorage:", error);
    return false;
  }
};

// Utilitário para limpar todos os tokens de autenticação Supabase no localStorage/sessionStorage
export const clearAuthTokens = () => {
  try {
    // Remove diversos padrões utilizados pelo Supabase
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    if (typeof sessionStorage !== "undefined") {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    console.log("[DEBUG] Tokens de autenticação Supabase limpos com sucesso");
    return true;
  } catch (error) {
    console.error("[ERRO] Falha ao limpar tokens de autenticação:", error);
    return false;
  }
};

// Utilitário para verificar a presença de tokens de autenticação
export const checkAuthTokens = () => {
  try {
    const supabaseToken = localStorage.getItem('sb-zotzvtepvpnkcoobdubt-auth-token');
    const authToken = localStorage.getItem('supabase.auth.token');
    
    console.log("[DEBUG] Verificação de tokens de autenticação");
    console.log("[DEBUG] sb-zotzvtepvpnkcoobdubt-auth-token existe:", !!supabaseToken);
    console.log("[DEBUG] supabase.auth.token existe:", !!authToken);
    
    return {
      hasSupabaseToken: !!supabaseToken,
      hasAuthToken: !!authToken,
      tokens: {
        supabaseToken: supabaseToken ? '(presente)' : null,
        authToken: authToken ? '(presente)' : null,
      }
    };
  } catch (error) {
    console.error("[ERRO] Falha ao verificar tokens de autenticação:", error);
    return {
      hasSupabaseToken: false,
      hasAuthToken: false,
      error: String(error)
    };
  }
};
