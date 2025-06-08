
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { OnboardingStepData } from '@/types/onboardingTypes';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Hook para persistir dados do onboarding no Supabase
 * FASE 4: Salvamento otimizado com verificações de status
 */
export const useOnboardingData = () => {
  const { user, profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const saveOnboardingData = async (data: OnboardingStepData): Promise<boolean> => {
    if (!user || !profile) {
      console.log('❌ Usuário não autenticado para salvar onboarding');
      toast.error('Erro de autenticação. Faça login novamente.');
      return false;
    }

    // Verificar se já foi concluído (evitar sobrescrever)
    if (profile.onboarding_completed_at) {
      console.log('⚠️ Onboarding já foi concluído anteriormente');
      toast.info('Onboarding já foi concluído anteriormente.');
      return true;
    }

    setIsSaving(true);
    
    try {
      const completedAt = new Date().toISOString();
      
      // Salvar dados do onboarding
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_data: data,
          onboarding_completed_at: completedAt,
          // Limpar skip se existir (usuário mudou de ideia)
          onboarding_skipped_at: null
        })
        .eq('id', profile.id);

      if (error) {
        console.error('❌ Erro ao salvar dados do onboarding:', error);
        toast.error('Erro ao salvar seus dados. Tente novamente.');
        return false;
      }

      console.log('✅ Dados do onboarding salvos com sucesso');
      
      // Log para analytics
      console.log('📊 Onboarding concluído:', {
        userId: user.id,
        email: user.email,
        completedAt,
        dataKeys: Object.keys(data),
        totalSteps: Object.keys(data).length
      });

      toast.success('Configuração salva com sucesso! 🎉');
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
    if (!user || !profile) {
      console.log('❌ Usuário não autenticado para pular onboarding');
      return false;
    }

    // Verificar se já foi processado
    if (profile.onboarding_completed_at || profile.onboarding_skipped_at) {
      console.log('⚠️ Onboarding já foi processado anteriormente');
      return true;
    }

    setIsSaving(true);
    
    try {
      const skippedAt = new Date().toISOString();
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_skipped_at: skippedAt
        })
        .eq('id', profile.id);

      if (error) {
        console.error('❌ Erro ao marcar onboarding como pulado:', error);
        toast.error('Erro ao processar. Tente novamente.');
        return false;
      }

      console.log('✅ Onboarding marcado como pulado');
      
      // Log para analytics
      console.log('📊 Onboarding pulado:', {
        userId: user.id,
        email: user.email,
        skippedAt
      });

      return true;

    } catch (error) {
      console.error('❌ Erro ao pular onboarding:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetOnboardingStatus = async (): Promise<boolean> => {
    if (!user || !profile) return false;

    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_data: null,
          onboarding_completed_at: null,
          onboarding_skipped_at: null
        })
        .eq('id', profile.id);

      if (error) {
        console.error('❌ Erro ao resetar onboarding:', error);
        return false;
      }

      console.log('✅ Status do onboarding resetado');
      toast.success('Status do onboarding resetado com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao resetar onboarding:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveOnboardingData,
    skipOnboardingData,
    resetOnboardingStatus,
    isSaving,
    
    // Informações úteis
    canSave: user && profile && !profile.onboarding_completed_at,
    canSkip: user && profile && !profile.onboarding_completed_at && !profile.onboarding_skipped_at,
    hasCompleted: !!profile?.onboarding_completed_at,
    hasSkipped: !!profile?.onboarding_skipped_at
  };
};
