
export { AuthProvider, useAuth } from './AuthProvider';
export type { AuthContextType } from './types';
export { TEST_ADMIN, TEST_MEMBER } from './AuthProvider';

// Utilitário de limpeza de tokens de autenticação
export const clearAuthTokens = () => {
  localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
  localStorage.removeItem('supabase.auth.token');
  
  // Remover todas as chaves relacionadas ao Supabase
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};
