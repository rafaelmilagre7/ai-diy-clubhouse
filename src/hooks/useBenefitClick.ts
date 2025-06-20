
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useBenefitClick = () => {
  const { user } = useAuth();

  const trackBenefitClick = useMutation({
    mutationFn: async ({ toolId, benefitLink }: { toolId: string; benefitLink: string }) => {
      if (!user) {
        throw new Error('User must be logged in to track benefit clicks');
      }

      const { data, error } = await supabase
        .from('benefit_clicks')
        .insert({
          tool_id: toolId,
          user_id: user.id,
          benefit_link: benefitLink
        } as any);

      if (error) {
        throw error;
      }

      return data;
    }
  });

  return {
    trackBenefitClick: trackBenefitClick.mutateAsync
  };
};
