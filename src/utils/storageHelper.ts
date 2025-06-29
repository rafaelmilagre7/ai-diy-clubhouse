
// Utilitário para limpar o armazenamento local
export const clearLocalStorage = () => {
  try {
    console.log("[DEBUG] Limpando localStorage");
    localStorage.clear();
    console.log("[DEBUG] localStorage limpo com sucesso");
    return true;
  } catch (error) {
    console.error("[ERRO] Falha ao limpar localStorage:", error);
    return false;
  }
};

// Utilitário para limpar apenas tokens de autenticação
export const clearAuthTokens = () => {
  try {
    console.log("[DEBUG] Limpando tokens de autenticação");
    localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
    localStorage.removeItem('supabase.auth.token');
    console.log("[DEBUG] Tokens de autenticação limpos com sucesso");
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
