
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Limpeza COMPLETA do estado de autenticação com cache agressivo
 */
export const cleanupAuthState = async () => {
  logger.info('Iniciando limpeza COMPLETA do estado de auth');
  
  try {
    // 1. Tentar signOut global primeiro
    try {
      await supabase.auth.signOut({ scope: 'global' });
      logger.info('SignOut global realizado');
    } catch (error) {
      logger.warn('Erro no signOut, continuando limpeza:', { error });
    }
    
    // 2. Limpar TODOS os storages possíveis
    try {
      // LocalStorage
      const keysToRemove: string[] = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || 
            key.includes('sb-') || 
            key.includes('supabase') ||
            key.includes('auth') ||
            key.includes('session') ||
            key.includes('user')) {
          keysToRemove.push(key);
        }
      });
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        logger.debug('Removida chave localStorage:', { key });
      });
      
      // SessionStorage
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('supabase.auth.') || 
              key.includes('sb-') || 
              key.includes('supabase') ||
              key.includes('auth') ||
              key.includes('session') ||
              key.includes('user')) {
            sessionStorage.removeItem(key);
            logger.debug('Removida chave sessionStorage:', { key });
          }
        });
      }
      
      logger.info('Storage limpo com sucesso');
    } catch (storageError) {
      logger.warn('Erro na limpeza de storage:', storageError);
    }
    
    // 3. Limpar cache do browser (se suportado)
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            logger.debug('Limpando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
        logger.info('Cache do browser limpo');
      }
    } catch (cacheError) {
      logger.warn('Erro na limpeza de cache:', cacheError);
    }
    
    // 4. Desregistrar service workers problemáticos
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => {
            logger.debug('Desregistrando service worker');
            return registration.unregister();
          })
        );
        logger.info('Service workers desregistrados');
      }
    } catch (swError) {
      logger.warn('Erro na limpeza de service worker:', swError);
    }
    
    logger.info('Limpeza COMPLETA concluída com sucesso');
    
  } catch (error) {
    logger.error('Erro durante limpeza completa:', error);
  }
};

/**
 * Redirecionamento FORÇADO para auth com limpeza de cache
 */
export const forceAuthRedirect = async () => {
  logger.warn('Forçando redirecionamento para auth com limpeza completa');
  
  // Limpeza completa primeiro
  await cleanupAuthState();
  
  // Aguardar um momento para garantir limpeza
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Redirecionamento FORÇADO usando replace
  try {
    window.location.replace('/auth');
  } catch (error) {
    // Fallback se replace falhar
    logger.warn('Fallback para href:', error);
    window.location.href = '/auth';
  }
};

/**
 * Função para detectar e corrigir assets 404
 */
export const checkAndFixAssets = () => {
  logger.info('Verificando integridade dos assets');
  
  // Verificar se CSS principal carregou
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  let hasValidCSS = false;
  
  stylesheets.forEach(link => {
    const href = (link as HTMLLinkElement).href;
    if (href && !href.includes('404')) {
      hasValidCSS = true;
    }
  });
  
  // Se CSS não carregou, forçar reload
  if (!hasValidCSS || stylesheets.length === 0) {
    logger.warn('Assets CSS com problema, forçando reload');
    setTimeout(() => {
      window.location.reload();
    }, 500);
    return false;
  }
  
  return true;
};

/**
 * Função de recuperação COMPLETA de erro de auth
 */
export const recoverFromAuthError = async () => {
  logger.warn('Iniciando recuperação COMPLETA de erro de auth');
  
  // Limpeza total
  await cleanupAuthState();
  
  // Verificar assets
  const assetsOk = checkAndFixAssets();
  
  if (!assetsOk) {
    logger.warn('Assets com problema, aguardando reload automático');
    return;
  }
  
  // Aguardar mais tempo para garantir limpeza
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Redirecionamento forçado
  await forceAuthRedirect();
};
