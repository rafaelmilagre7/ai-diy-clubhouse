import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

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
        const { data, error } = await supabase
          .from('networking_profiles_v2')
          .select('id, profile_completed_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        setHasCompletedOnboarding(!!data?.profile_completed_at);
      } catch (error) {
        console.error('Erro ao verificar onboarding:', error);
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
