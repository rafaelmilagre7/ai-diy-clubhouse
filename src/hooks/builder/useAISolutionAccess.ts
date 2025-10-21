import { useAuth } from '@/contexts/auth/AuthContext';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export const useAISolutionAccess = () => {
  const { user } = useAuth();
  const { hasFeatureAccess } = useFeatureAccess();
  
  const hasAccess = hasFeatureAccess('builder');
  
  const { data: usageData, isLoading, refetch } = useQuery({
    queryKey: ['ai-solution-usage', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase.rpc('check_ai_solution_limit', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && hasAccess,
    staleTime: 30000, // Cache por 30 segundos
  });
  
  return {
    hasAccess,
    canGenerate: usageData?.can_generate || false,
    generationsUsed: usageData?.generations_used || 0,
    monthlyLimit: usageData?.monthly_limit || 3,
    remaining: usageData?.remaining || 0,
    resetDate: usageData?.reset_date,
    isLoading,
    refetch
  };
};
