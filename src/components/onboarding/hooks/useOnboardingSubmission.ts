
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { OnboardingData } from '../types/onboardingTypes';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export const useOnboardingSubmission = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (
    data: OnboardingData,
    memberType: 'club' | 'formacao',
    forceSave: () => Promise<void>,
    setIsSubmitting: (value: boolean) => void
  ) => {
    try {
      setIsSubmitting(true);

      // Salvar dados finais
      const finalData = {
        ...data,
        completedAt: new Date().toISOString(),
        memberType
      };

      await forceSave();

      // Marcar onboarding como completado no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) {
        throw profileError;
      }

      logger.info('Onboarding concluído com sucesso', {
        userId: user?.id,
        memberType
      });

      toast.success('Onboarding concluído com sucesso! Bem-vindo à plataforma.');
      
      // Redirecionar para o dashboard apropriado
      const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
      navigate(redirectPath);

    } catch (error: any) {
      console.error('Erro ao finalizar onboarding:', error);
      logger.error('Erro ao finalizar onboarding', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, navigate]);

  return {
    handleSubmit
  };
};
