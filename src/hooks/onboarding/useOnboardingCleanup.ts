
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useOnboardingCleanup = () => {
  const { user } = useAuth();

  const cleanupOldOnboardingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🧹 Iniciando limpeza de dados antigos de onboarding...');

      // Verificar se existem dados nas tabelas antigas com verificação de erro
      try {
        const { data: oldProgress, error: progressError } = await supabase
          .from('onboarding_progress')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progressError && progressError.code !== 'PGRST116') {
          console.warn('⚠️ Erro ao verificar onboarding_progress:', progressError);
        } else if (oldProgress) {
          console.log('🗑️ Removendo dados antigos da tabela onboarding_progress...');
          await supabase
            .from('onboarding_progress')
            .delete()
            .eq('user_id', user.id);
        }
      } catch (error) {
        console.warn('⚠️ Erro na limpeza de onboarding_progress:', error);
      }

      console.log('✅ Limpeza concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
    }
  }, [user?.id]);

  const validateOnboardingIntegrity = useCallback(async () => {
    if (!user?.id) return false;

    try {
      console.log('🔍 Validando integridade do onboarding...');

      const { data: quickOnboarding, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('is_completed, current_step')
        .eq('user_id', user.id)
        .maybeSingle();

      if (quickError && quickError.code !== 'PGRST116') {
        console.warn('⚠️ Erro ao validar quick_onboarding:', quickError);
        return false;
      }

      if (!quickOnboarding) {
        console.log('⚠️ Nenhum registro de onboarding encontrado');
        return false;
      }

      const isValid = quickOnboarding.is_completed || quickOnboarding.current_step > 0;
      console.log('📊 Integridade do onboarding:', isValid ? 'OK' : 'FALHA');
      
      return isValid;
    } catch (error) {
      console.error('❌ Erro na validação:', error);
      return false;
    }
  }, [user?.id]);

  const resetOnboardingProgress = useCallback(async () => {
    if (!user?.id) return false;

    try {
      console.log('🔄 Reiniciando progresso do onboarding...');

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert({
          user_id: user.id,
          current_step: 1,
          is_completed: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Erro ao reiniciar:', error);
        throw error;
      }

      console.log('✅ Progresso reiniciado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao reiniciar:', error);
      return false;
    }
  }, [user?.id]);

  return {
    cleanupOldOnboardingData,
    validateOnboardingIntegrity,
    resetOnboardingProgress
  };
};
