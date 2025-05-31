
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { CompleteOnboardingResponse, OnboardingFinalData } from '@/types/onboardingFinal';

export const useCompleteOnboarding = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOnboarding = async (data: OnboardingFinalData): Promise<CompleteOnboardingResponse> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    try {
      setIsSubmitting(true);
      console.log('🎯 Completando onboarding...', data);

      // Verificar se já está completo
      const { data: existingData } = await supabase
        .from('onboarding_final')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .maybeSingle();

      if (existingData?.is_completed) {
        console.log('✅ Onboarding já estava completo');
        return { 
          success: true, 
          wasAlreadyCompleted: true,
          data: existingData 
        };
      }

      // Salvar dados finais
      const { data: savedData, error: saveError } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
          personal_info: data.personal_info,
          location_info: data.location_info,
          discovery_info: data.discovery_info,
          business_info: data.business_info,
          business_context: data.business_context,
          goals_info: data.goals_info,
          ai_experience: data.ai_experience,
          personalization: data.personalization,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        console.error('❌ Erro ao salvar onboarding final:', saveError);
        return { success: false, error: saveError.message };
      }

      console.log('✅ Onboarding finalizado com sucesso:', savedData);
      
      return { 
        success: true, 
        data: savedData,
        wasAlreadyCompleted: false
      };

    } catch (error: any) {
      console.error('❌ Erro inesperado ao finalizar onboarding:', error);
      return { 
        success: false, 
        error: error.message || 'Erro inesperado ao finalizar onboarding' 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    completeOnboarding,
    isSubmitting
  };
};
