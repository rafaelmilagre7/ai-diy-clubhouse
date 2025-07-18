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
  }) => {
    try {
      logger.info(`[SAFE-NAV] Navegando para: ${path}`);
      
      // Usar apenas navegação programática
      navigate(path, { replace: options?.replace ?? false });
      
    } catch (error) {
      logger.error('[SAFE-NAV] Erro na navegação programática:', error);
      // Não usar fallbacks que causem reloads desnecessários
    }
  }, [navigate]);

  const safeReload = useCallback(() => {
    logger.info('[SAFE-NAV] Reload não recomendado - usar navegação programática');
    // Não implementar reload automático
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