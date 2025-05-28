
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useQuickOnboardingValidation = () => {
  const { user } = useAuth();

  const validateOnboardingCompletion = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Verificar se o quick_onboarding está completo
      const { data: quickData, error } = await supabase
        .from('quick_onboarding')
        .select('is_completed, name, company_name, ai_knowledge_level')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .single();

      if (error || !quickData) {
        console.log('Quick onboarding não encontrado ou não completo');
        return false;
      }

      // Verificar se os campos essenciais estão preenchidos
      const hasRequiredData = !!(
        quickData.name && 
        quickData.company_name && 
        quickData.ai_knowledge_level
      );

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

      if (error || !data) return null;

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
