
import { supabase } from '@/lib/supabase';

/**
 * Limpa tokens de autenticação e estado armazenado
 */
export const cleanupAuthState = () => {
  // Remover tokens padrão de autenticação
  localStorage.removeItem('supabase.auth.token');
  
  // Remover todas as chaves Supabase auth de localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remover de sessionStorage se estiver em uso
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Tentar efetuar logout global
 */
export const globalSignOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    console.error('Erro ao tentar logout global:', error);
  }
};
