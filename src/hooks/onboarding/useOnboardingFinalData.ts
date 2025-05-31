
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { OnboardingFinalData } from '@/types/onboardingFinal';

export const useOnboardingFinalData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-final-data', user?.id],
    queryFn: async (): Promise<OnboardingFinalData | null> => {
      if (!user?.id) return null;

      console.log('🔍 Buscando dados do onboarding final para usuário:', user.id);

      // Buscar dados na tabela onboarding_final
      const { data: finalData, error: finalError } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .single();

      if (finalData && !finalError) {
        console.log('✅ Dados do onboarding final encontrados:', finalData);
        return {
          personal_info: finalData.personal_info || {},
          location_info: finalData.location_info || {},
          discovery_info: finalData.discovery_info || {},
          business_info: finalData.business_info || {},
          business_context: finalData.business_context || {},
          goals_info: finalData.goals_info || {},
          ai_experience: finalData.ai_experience || {},
          personalization: finalData.personalization || {}
        };
      }

      console.log('⚠️ Nenhum dado de onboarding final encontrado');
      return null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });
};
