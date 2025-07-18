import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

/**
 * Hook para navegação segura que evita loops de redirecionamento
 * CORREÇÃO FASE 2: Substituir window.location.href por navegação programática
 */
export const useSafeNavigation = () => {
  const navigate = useNavigate();

  const safeNavigate = useCallback((path: string, options?: { 
    replace?: boolean; 
    forceReload?: boolean;
    fallbackToHref?: boolean;
  }) => {
    try {
      logger.info(`[SAFE-NAV] Navegando para: ${path}`);
      
      // Se forceReload é true, usar window.location.href
      if (options?.forceReload) {
        window.location.href = path;
        return;
      }

      // Tentar navegação programática primeiro
      navigate(path, { replace: options?.replace ?? false });
      
    } catch (error) {
      logger.error('[SAFE-NAV] Erro na navegação programática:', error);
      
      // Fallback para window.location.href apenas se permitido
      if (options?.fallbackToHref !== false) {
        logger.info('[SAFE-NAV] Usando fallback para window.location.href');
        window.location.href = path;
      }
    }
  }, [navigate]);

  const safeReload = useCallback(() => {
    try {
      logger.info('[SAFE-NAV] Recarregando página...');
      window.location.reload();
    } catch (error) {
      logger.error('[SAFE-NAV] Erro no reload:', error);
    }
  }, []);

  const safeGoBack = useCallback(() => {
    try {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        safeNavigate('/dashboard');
      }
    } catch (error) {
      logger.error('[SAFE-NAV] Erro ao voltar:', error);
      safeNavigate('/dashboard');
    }
  }, [safeNavigate]);

  return {
    safeNavigate,
    safeReload,
    safeGoBack
  };
};