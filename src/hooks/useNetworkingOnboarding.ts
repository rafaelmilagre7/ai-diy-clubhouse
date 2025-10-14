import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook simplificado para verificar status do networking profile v2
 * Não busca mais dados para pré-preencher - usa inicialização automática
 */
export const useNetworkingOnboarding = () => {
  const { user } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profileV2 } = await supabase
          .from('networking_profiles_v2')
          .select('id, profile_completed_at')
          .eq('user_id', user.id)
          .maybeSingle();

        const hasCompleted = !!profileV2?.profile_completed_at;
        setHasCompletedOnboarding(hasCompleted);
      } catch (error) {
        console.error('❌ [ONBOARDING] Erro ao verificar:', error);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [user]);

  return {
    hasCompletedOnboarding,
    isLoading,
    markAsCompleted: () => setHasCompletedOnboarding(true)
  };
};
