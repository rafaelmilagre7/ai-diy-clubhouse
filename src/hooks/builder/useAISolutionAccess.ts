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
      
      console.log('[AI-SOLUTION-ACCESS] 📊 Verificando limite de gerações para:', user.id.substring(0, 8) + '***');
      
      const { data, error } = await supabase.rpc('check_ai_solution_limit', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('[AI-SOLUTION-ACCESS] ❌ Erro ao verificar limite:', error);
        throw error;
      }
      
      console.log('[AI-SOLUTION-ACCESS] ✅ Limite verificado:', {
        can_generate: data?.can_generate,
        generations_used: data?.generations_used,
        monthly_limit: data?.monthly_limit,
        remaining: data?.remaining
      });
      
      return data;
    },
    enabled: !!user && hasAccess,
    staleTime: 30000, // Cache por 30 segundos
    retry: 2, // Tentar 2 vezes em caso de erro
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
