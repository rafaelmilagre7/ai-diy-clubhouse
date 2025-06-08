
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { OnboardingStepData } from '@/types/onboardingTypes';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Hook para persistir dados do onboarding no Supabase
 * FASE 3: Salvamento seguro dos dados coletados
 */
export const useOnboardingData = () => {
  const { user, profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const saveOnboardingData = async (data: OnboardingStepData): Promise<boolean> => {
    if (!user || !profile) {
      console.log('❌ Usuário não autenticado para salvar onboarding');
      return false;
    }

    setIsSaving(true);
    
    try {
      // Por enquanto, vamos salvar em um campo JSON no perfil do usuário
      // Futuramente podemos criar uma tabela específica
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_data: data,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        console.error('❌ Erro ao salvar dados do onboarding:', error);
        toast.error('Erro ao salvar seus dados. Tente novamente.');
        return false;
      }

      console.log('✅ Dados do onboarding salvos com sucesso');
      toast.success('Configuração salva com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao salvar onboarding:', error);
      toast.error('Erro inesperado. Tente novamente.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const skipOnboardingData = async (): Promise<boolean> => {
    if (!user || !profile) return false;

    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_skipped_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        console.error('❌ Erro ao marcar onboarding como pulado:', error);
        return false;
      }

      console.log('✅ Onboarding marcado como pulado');
      return true;

    } catch (error) {
      console.error('❌ Erro ao pular onboarding:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveOnboardingData,
    skipOnboardingData,
    isSaving
  };
};
