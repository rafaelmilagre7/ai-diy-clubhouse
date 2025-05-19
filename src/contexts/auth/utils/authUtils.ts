
import { supabase } from '@/lib/supabase';
import { determineRoleFromEmail, isSuperAdmin } from './profileUtils/roleValidation';
import { fetchUserProfile } from './profileUtils/userProfileFunctions';

// Função para limpar o estado de autenticação
export const cleanupAuthState = () => {
  // Remover tokens de autenticação padrão
  localStorage.removeItem('supabase.auth.token');
  
  // Remover todas as chaves de auth do Supabase do localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remover do sessionStorage se estiver em uso
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Re-exportar funções necessárias
export {
  fetchUserProfile,
  determineRoleFromEmail,
  isSuperAdmin
};
