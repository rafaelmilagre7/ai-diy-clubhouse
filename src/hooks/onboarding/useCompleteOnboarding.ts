
import { useState } from 'react';
import { toast } from 'sonner';
import { OnboardingFinalData } from '@/types/onboardingFinal';
import { useAuth } from '@/contexts/auth';
import { useSecureOnboardingCompletion } from './useSecureOnboardingCompletion';

export const useCompleteOnboarding = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { completeOnboardingSecure } = useSecureOnboardingCompletion();

  const completeOnboarding = async (data: OnboardingFinalData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 Iniciando finalização do onboarding com proteções avançadas');
      
      // Usar o sistema de finalização segura
      const result = await completeOnboardingSecure(data);
      
      if (!result.success) {
        // Erros específicos já são tratados no hook seguro
        return result;
      }

      // Sucesso
      if (result.wasAlreadyCompleted) {
        toast.info('Onboarding já estava completo', {
          description: 'Redirecionando para o dashboard...'
        });
      } else {
        toast.success('Onboarding finalizado com sucesso!', {
          description: 'Bem-vindo à plataforma! 🎉'
        });
      }

      return result;

    } catch (error: any) {
      console.error('❌ Erro inesperado na finalização do onboarding:', error);
      
      toast.error('Erro inesperado', {
        description: 'Por favor, tente novamente.'
      });
      
      return { success: false, error: error.message || 'Erro inesperado' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    completeOnboarding,
    isSubmitting
  };
};
