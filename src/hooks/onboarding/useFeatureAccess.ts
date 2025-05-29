
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface FeatureAccessResult {
  has_access: boolean;
  has_role_access: boolean;
  onboarding_complete: boolean;
  user_role: string | null;
  feature: string;
  block_reason: 'none' | 'insufficient_role' | 'incomplete_onboarding' | 'user_not_found';
}

interface UseFeatureAccessOptions {
  feature: string;
  autoCheck?: boolean;
  onAccessDenied?: (reason: string) => void;
}

export const useFeatureAccess = ({ 
  feature, 
  autoCheck = true,
  onAccessDenied
}: UseFeatureAccessOptions) => {
  const { user, isLoading: authLoading } = useAuth();
  const [accessResult, setAccessResult] = useState<FeatureAccessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    if (!user?.id) {
      setAccessResult({
        has_access: false,
        has_role_access: false,
        onboarding_complete: false,
        user_role: null,
        feature,
        block_reason: 'user_not_found'
      });
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔍 Verificando acesso para feature: ${feature}`);

      const { data, error: rpcError } = await supabase.rpc('user_can_access_feature', {
        p_user_id: user.id,
        p_feature: feature
      });

      if (rpcError) {
        throw rpcError;
      }

      const result = data as FeatureAccessResult;
      setAccessResult(result);

      console.log(`📊 Resultado do acesso:`, result);

      // Chamar callback se acesso negado
      if (!result.has_access && onAccessDenied) {
        const reason = result.block_reason === 'incomplete_onboarding' 
          ? 'Onboarding incompleto' 
          : 'Permissão insuficiente';
        onAccessDenied(reason);
      }

      return result.has_access;

    } catch (err) {
      console.error(`❌ Erro ao verificar acesso para ${feature}:`, err);
      setError('Erro ao verificar permissões');
      setAccessResult({
        has_access: false,
        has_role_access: false,
        onboarding_complete: false,
        user_role: null,
        feature,
        block_reason: 'user_not_found'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, feature, onAccessDenied]);

  // Auto-verificar acesso quando solicitado
  useEffect(() => {
    if (autoCheck && !authLoading) {
      checkAccess();
    }
  }, [autoCheck, authLoading, checkAccess]);

  return {
    // Resultado da verificação
    accessResult,
    hasAccess: accessResult?.has_access || false,
    hasRoleAccess: accessResult?.has_role_access || false,
    onboardingComplete: accessResult?.onboarding_complete || false,
    blockReason: accessResult?.block_reason || 'user_not_found',
    userRole: accessResult?.user_role || null,
    
    // Estado da verificação
    isLoading,
    error,
    
    // Ações
    checkAccess,
    
    // Utilitários
    getBlockMessage: () => {
      if (!accessResult) return 'Verificando permissões...';
      
      switch (accessResult.block_reason) {
        case 'incomplete_onboarding':
          return 'Complete seu onboarding para acessar esta funcionalidade';
        case 'insufficient_role':
          return 'Você não tem permissão para acessar esta funcionalidade';
        case 'user_not_found':
          return 'Usuário não encontrado';
        default:
          return 'Acesso liberado';
      }
    },
    
    shouldRedirectToOnboarding: () => {
      return accessResult?.block_reason === 'incomplete_onboarding';
    }
  };
};
