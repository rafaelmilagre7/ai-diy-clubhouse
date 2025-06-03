
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useAccessCache } from './useAccessCache';
import { useRetryWithBackoff } from './useRetryWithBackoff';
import { logger } from '@/utils/logger';

interface FeatureAccessResult {
  has_access: boolean;
  has_role_access: boolean;
  onboarding_complete: boolean;
  user_role: string | null;
  feature: string;
  block_reason: 'none' | 'insufficient_role' | 'incomplete_onboarding';
}

export const useSmartFeatureAccess = (feature: string) => {
  const { user, isLoading: authLoading } = useAuth();
  const [accessData, setAccessData] = useState<FeatureAccessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const cache = useAccessCache({ ttl: 5 * 60 * 1000 }); // 5 minutos
  const { executeWithRetry } = useRetryWithBackoff({
    maxAttempts: 3,
    initialDelay: 1000
  });

  const checkAccess = useCallback(async () => {
    if (!user?.id || authLoading) {
      setIsLoading(true);
      return;
    }

    const cacheKey = `access-${user.id}-${feature}`;
    
    // Verificar cache primeiro
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      setAccessData(cachedResult);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      logger.info(`Verificando acesso para feature: ${feature}`, {
        userId: user.id,
        feature
      }, 'useSmartFeatureAccess');

      const result = await executeWithRetry(async () => {
        const { data, error: rpcError } = await supabase.rpc('user_can_access_feature', {
          p_user_id: user.id,
          p_feature: feature
        });

        if (rpcError) {
          logger.error('Erro na função RPC', {
            error: rpcError.message,
            userId: user.id,
            feature
          }, 'useSmartFeatureAccess');
          throw rpcError;
        }

        return data;
      }, `verificação de acesso para ${feature}`);

      logger.info('Verificação de acesso concluída', {
        result,
        userId: user.id,
        feature
      }, 'useSmartFeatureAccess');

      setAccessData(result);
      cache.set(cacheKey, result);

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao verificar permissões';
      
      logger.error('Falha na verificação de acesso', {
        error: errorMessage,
        userId: user.id,
        feature
      }, 'useSmartFeatureAccess');
      
      setError(errorMessage);
      
      // Fallback: usuário não autenticado = sem acesso
      const fallbackData: FeatureAccessResult = {
        has_access: false,
        has_role_access: false,
        onboarding_complete: false,
        user_role: null,
        feature,
        block_reason: 'insufficient_role'
      };
      
      setAccessData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, feature, authLoading, cache, executeWithRetry]);

  // Verificar acesso quando usuário ou feature mudarem
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const blockMessages = {
    insufficient_role: 'Você não tem permissão para acessar esta funcionalidade.',
    incomplete_onboarding: 'Complete seu onboarding para acessar esta funcionalidade.',
    none: ''
  };

  return {
    hasAccess: accessData?.has_access ?? false,
    hasRoleAccess: accessData?.has_role_access ?? false,
    onboardingComplete: accessData?.onboarding_complete ?? false,
    userRole: accessData?.user_role,
    blockReason: accessData?.block_reason ?? 'insufficient_role',
    blockMessage: blockMessages[accessData?.block_reason ?? 'insufficient_role'],
    isLoading,
    error,
    refetch: checkAccess
  };
};
