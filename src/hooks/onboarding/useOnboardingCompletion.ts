
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface OnboardingStatus {
  isCompleted: boolean;
  source: string;
  currentStep?: number;
}

export const useOnboardingCompletion = () => {
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OnboardingStatus | null>(null);

  const checkOnboardingStatus = async () => {
    if (!user?.id) {
      setData({ isCompleted: false, source: 'no_user' });
      setIsLoading(false);
      return { isCompleted: false, source: 'no_user' };
    }

    try {
      setIsLoading(true);
      
      // Verificar quick_onboarding
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('is_completed, current_step')
        .eq('user_id', user.id)
        .maybeSingle();

      if (quickData && !quickError) {
        const result = {
          isCompleted: quickData.is_completed || false,
          source: 'quick_onboarding',
          currentStep: quickData.current_step
        };
        setData(result);
        setIsLoading(false);
        return result;
      }

      // Fallback para onboarding_progress
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progressData && !progressError) {
        const result = {
          isCompleted: progressData.is_completed || false,
          source: 'onboarding_progress'
        };
        setData(result);
        setIsLoading(false);
        return result;
      }

      const result = { isCompleted: false, source: 'none' };
      setData(result);
      setIsLoading(false);
      return result;
    } catch (error) {
      logger.error('Erro ao verificar status do onboarding', { error });
      const result = { isCompleted: false, source: 'error' };
      setData(result);
      setIsLoading(false);
      return result;
    }
  };

  const forceCompleteOnboarding = async () => {
    if (!user?.id || isCompleting) {
      logger.warn('Tentativa de completar onboarding sem usuário ou já em progresso');
      return false;
    }

    try {
      setIsCompleting(true);
      logger.info('Forçando conclusão do onboarding', { userId: user.id });

      // 1. Marcar quick_onboarding como completo
      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .update({
          is_completed: true,
          current_step: 4,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (quickError) {
        logger.error('Erro ao atualizar quick_onboarding', { error: quickError.message });
        throw quickError;
      }

      // 2. Gerar trilha de implementação
      logger.info('Gerando trilha de implementação');
      
      const { data: trailResult, error: trailError } = await supabase.functions.invoke('generate-smart-trail', {
        body: { user_id: user.id }
      });

      if (trailError) {
        logger.warn('Erro ao gerar trilha (não crítico)', { error: trailError.message });
        // Não bloquear o onboarding se a trilha falhar
      } else {
        logger.info('Trilha gerada com sucesso', { trail: trailResult });
      }

      // Atualizar estado local
      setData({ isCompleted: true, source: 'quick_onboarding', currentStep: 4 });

      logger.info('Onboarding marcado como concluído com sucesso');
      toast.success('Onboarding concluído! Sua trilha personalizada está sendo preparada.');
      
      return true;
    } catch (error: any) {
      logger.error('Erro ao forçar conclusão do onboarding', { error: error.message });
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      return false;
    } finally {
      setIsCompleting(false);
    }
  };

  // Verificar status automaticamente ao montar o componente
  useEffect(() => {
    checkOnboardingStatus();
  }, [user?.id]);

  return {
    forceCompleteOnboarding,
    checkOnboardingStatus,
    isCompleting,
    isLoading,
    data
  };
};
