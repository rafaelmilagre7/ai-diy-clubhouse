
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface OnboardingCompletionData {
  isCompleted: boolean;
  completedAt?: string;
  userData?: any;
}

export const useOnboardingCompletion = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingCompletionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: onboardingData, error } = await supabase
          .from('quick_onboarding')
          .select('is_completed, updated_at, name, email')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        const completionData: OnboardingCompletionData = {
          isCompleted: onboardingData?.is_completed || false,
          completedAt: onboardingData?.updated_at,
          userData: onboardingData
        };

        setData(completionData);
      } catch (err: any) {
        console.error('Erro ao verificar status do onboarding:', err);
        setError(err.message);
        setData({ isCompleted: false });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [user?.id]);

  return { data, isLoading, error };
};
