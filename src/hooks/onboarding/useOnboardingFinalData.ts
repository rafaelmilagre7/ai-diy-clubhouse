
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { OnboardingFinalData } from '@/types/onboardingFinal';

export const useOnboardingFinalData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-final-data', user?.id],
    queryFn: async (): Promise<OnboardingFinalData | null> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .single();

      if (error) {
        console.error('Error fetching onboarding final data:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });
};
