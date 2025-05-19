
import { User, Session } from '@supabase/supabase-js';

// Função para limpar o estado de autenticação
export const cleanupAuthState = () => {
  // Limpar localStorage se necessário
  localStorage.removeItem('authCache');
  localStorage.removeItem('permissionsCache');
};

// Função para verificar a validade do token
export const isTokenValid = (session: Session | null): boolean => {
  if (!session) return false;
  
  // Verificar se o token expirou
  const expiresAt = session.expires_at;
  if (!expiresAt) return false;
  
  // Converter para milissegundos e comparar com o tempo atual
  const expiresAtMs = expiresAt * 1000;
  const now = Date.now();
  
  return expiresAtMs > now;
};

// Reexportar as funções de teste
export { TEST_ADMIN, TEST_MEMBER } from '@/contexts/auth/AuthProvider';
