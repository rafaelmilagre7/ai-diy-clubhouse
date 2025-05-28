
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

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

  const checkAccess = useCallback(async () => {
    if (!user?.id || authLoading) {
      setIsLoading(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(`🔍 Verificando acesso para feature: ${feature}, usuário: ${user.id}`);

      // Usar a nova função SQL para verificar acesso
      const { data, error: rpcError } = await supabase.rpc('user_can_access_feature', {
        p_user_id: user.id,
        p_feature: feature
      });

      if (rpcError) {
        console.error('❌ Erro na função RPC:', rpcError);
        throw rpcError;
      }

      console.log(`✅ Resultado da verificação de acesso:`, data);
      setAccessData(data);

    } catch (err: any) {
      console.error('❌ Erro ao verificar acesso:', err);
      setError(err.message || 'Erro ao verificar permissões');
      
      // Fallback: usuário não autenticado = sem acesso
      setAccessData({
        has_access: false,
        has_role_access: false,
        onboarding_complete: false,
        user_role: null,
        feature,
        block_reason: 'insufficient_role'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, feature, authLoading]);

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
