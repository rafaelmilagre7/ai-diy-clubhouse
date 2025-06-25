
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Limpeza completa do estado de autenticação
 */
export const cleanupAuthState = async () => {
  logger.info('Iniciando limpeza completa do estado de auth');
  
  try {
    // 1. Tentar signOut global
    try {
      await supabase.auth.signOut({ scope: 'global' });
      logger.info('SignOut global realizado');
    } catch (error) {
      logger.warn('Erro no signOut, continuando limpeza:', { error });
    }
    
    // 2. Limpar localStorage
    const keysToRemove: string[] = [];
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      logger.debug('Removida chave:', { key });
    });
    
    // 3. Limpar sessionStorage se existir
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    logger.info('Limpeza concluída com sucesso');
    
  } catch (error) {
    logger.error('Erro durante limpeza:', error);
  }
};

/**
 * Função de recuperação de erro de auth
 */
export const recoverFromAuthError = async () => {
  logger.warn('Iniciando recuperação de erro de auth');
  
  await cleanupAuthState();
  
  // Aguardar um momento para garantir limpeza
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Redirecionar para auth
  window.location.href = '/auth';
};

/**
 * Função para forçar reload em caso de erro crítico
 */
export const forceReload = () => {
  logger.warn('Forçando reload da página');
  window.location.reload();
};
