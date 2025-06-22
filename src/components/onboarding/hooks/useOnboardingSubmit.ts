
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { OnboardingData } from '../types/onboardingTypes';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useOnboardingSubmit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const submitOnboarding = useCallback(async (data: OnboardingData) => {
    try {
      console.log('[ONBOARDING-SUBMIT] Iniciando submissão:', data);

      // Salvar dados finais no banco
      const finalData = {
        ...data,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Marcar onboarding como completado no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) {
        throw profileError;
      }

      console.log('[ONBOARDING-SUBMIT] Onboarding concluído com sucesso');
      
      // Redirecionar para o dashboard apropriado
      const redirectPath = data.memberType === 'formacao' ? '/formacao' : '/dashboard';
      navigate(redirectPath);

    } catch (error: any) {
      console.error('[ONBOARDING-SUBMIT] Erro ao finalizar onboarding:', error);
      throw error;
    }
  }, [user?.id, navigate]);

  return {
    submitOnboarding,
    isSubmitting: false // Por simplicidade, pode ser expandido futuramente
  };
};
