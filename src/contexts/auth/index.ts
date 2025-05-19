
export { AuthProvider, useAuth } from './AuthProvider';
export type { AuthContextType } from './types';
export { TEST_ADMIN, TEST_MEMBER } from './AuthProvider';

// Utilitário de limpeza de tokens de autenticação
export const clearAuthTokens = () => {
  console.log("Limpando todos os tokens de autenticação");
  
  // Limpar tokens específicos
  localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
  localStorage.removeItem('supabase.auth.token');
  
  // Remover todas as chaves relacionadas ao Supabase de forma mais abrangente
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removendo token: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Limpar também do sessionStorage se aplicável
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};
