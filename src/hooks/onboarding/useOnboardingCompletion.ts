
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export const useOnboardingCompletion = () => {
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

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

  const checkOnboardingStatus = async () => {
    if (!user?.id) return { isCompleted: false, source: 'no_user' };

    try {
      // Verificar quick_onboarding
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('is_completed, current_step')
        .eq('user_id', user.id)
        .maybeSingle();

      if (quickData && !quickError) {
        return {
          isCompleted: quickData.is_completed || false,
          source: 'quick_onboarding',
          currentStep: quickData.current_step
        };
      }

      // Fallback para onboarding_progress
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('is_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progressData && !progressError) {
        return {
          isCompleted: progressData.is_completed || false,
          source: 'onboarding_progress'
        };
      }

      return { isCompleted: false, source: 'none' };
    } catch (error) {
      logger.error('Erro ao verificar status do onboarding', { error });
      return { isCompleted: false, source: 'error' };
    }
  };

  return {
    forceCompleteOnboarding,
    checkOnboardingStatus,
    isCompleting
  };
};
