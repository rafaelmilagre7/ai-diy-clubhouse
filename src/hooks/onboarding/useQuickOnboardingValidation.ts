
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useQuickOnboardingValidation = () => {
  const { user } = useAuth();

  const validateOnboardingCompletion = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.log('Usuário não autenticado');
      return false;
    }

    try {
      console.log('Verificando onboarding para usuário:', user.id);

      // Verificar se o quick_onboarding está completo
      const { data: quickData, error } = await supabase
        .from('quick_onboarding')
        .select('is_completed, name, company_name, ai_knowledge_level, company_size, main_goal')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar quick_onboarding:', error);
        return false;
      }

      if (!quickData) {
        console.log('Quick onboarding não encontrado');
        return false;
      }

      console.log('Dados do quick_onboarding:', quickData);

      // Verificar se está marcado como completo
      if (!quickData.is_completed) {
        console.log('Quick onboarding não está marcado como completo');
        return false;
      }

      // Verificar se os campos essenciais estão preenchidos
      const hasRequiredData = !!(
        quickData.name && 
        quickData.company_name && 
        quickData.ai_knowledge_level &&
        quickData.company_size &&
        quickData.main_goal
      );

      console.log('Campos obrigatórios preenchidos:', hasRequiredData);
      console.log('Campos verificados:', {
        name: !!quickData.name,
        company_name: !!quickData.company_name,
        ai_knowledge_level: !!quickData.ai_knowledge_level,
        company_size: !!quickData.company_size,
        main_goal: !!quickData.main_goal
      });

      return hasRequiredData;
    } catch (error) {
      console.error('Erro ao validar onboarding:', error);
      return false;
    }
  }, [user?.id]);

  const getOnboardingData = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        console.error('Erro ao buscar dados do onboarding:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do onboarding:', error);
      return null;
    }
  }, [user?.id]);

  return {
    validateOnboardingCompletion,
    getOnboardingData
  };
};
