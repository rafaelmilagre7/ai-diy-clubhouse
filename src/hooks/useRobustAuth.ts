
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';
import { supabase } from '@/lib/supabase';

export const useRobustAuth = () => {
  const { user, profile, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  // Verificar consistência dos dados de auth
  const validateAuthState = useCallback(() => {
    if (!isLoading) {
      // Se há usuário mas não há perfil após 5 segundos
      if (user && !profile) {
        logger.warn("[ROBUST-AUTH] Usuário sem perfil detectado", {
          userId: user.id,
          email: user.email
        });
        return false;
      }
      
      // Verificar se o token ainda é válido
      if (user) {
        const session = supabase.auth.getSession();
        if (!session) {
          logger.warn("[ROBUST-AUTH] Sessão inválida detectada");
          return false;
        }
      }
    }
    
    return true;
  }, [user, profile, isLoading]);

  // Função de recuperação automática
  const recoverAuth = useCallback(async () => {
    if (isRecovering || retryCount >= 3) return;
    
    setIsRecovering(true);
    logger.info("[ROBUST-AUTH] Iniciando recuperação automática", { attempt: retryCount + 1 });

    try {
      // Tentar refresh da sessão
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        logger.info("[ROBUST-AUTH] Sessão recuperada com sucesso");
        setAuthError(null);
        setRetryCount(0);
      }
      
    } catch (error) {
      logger.error("[ROBUST-AUTH] Falha na recuperação", error);
      setAuthError(error instanceof Error ? error.message : 'Erro na recuperação');
      setRetryCount(prev => prev + 1);
      
      // Se falhou 3 vezes, limpar tudo
      if (retryCount >= 2) {
        logger.warn("[ROBUST-AUTH] Máximo de tentativas atingido, limpando auth");
        await cleanupAuth();
      }
    } finally {
      setIsRecovering(false);
    }
  }, [retryCount, isRecovering]);

  // Limpeza completa do estado de auth
  const cleanupAuth = useCallback(async () => {
    logger.info("[ROBUST-AUTH] Limpeza completa do estado de auth");
    
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      logger.warn("[ROBUST-AUTH] Erro no signOut", error);
    }
    
    // Limpar localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Recarregar a página
    setTimeout(() => {
      window.location.href = '/auth';
    }, 1000);
  }, []);

  // Monitor de estado de auth
  useEffect(() => {
    if (!isLoading && !validateAuthState()) {
      const timer = setTimeout(() => {
        recoverAuth();
      }, 2000); // Aguardar 2 segundos antes de tentar recuperar
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, validateAuthState, recoverAuth]);

  // Função manual de retry
  const manualRetry = useCallback(() => {
    setAuthError(null);
    setRetryCount(0);
    recoverAuth();
  }, [recoverAuth]);

  return {
    authError,
    isRecovering,
    retryCount,
    canRetry: retryCount < 3,
    manualRetry,
    cleanupAuth,
    isAuthValid: validateAuthState()
  };
};
