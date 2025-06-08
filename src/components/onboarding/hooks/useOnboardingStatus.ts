
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface OnboardingStatus {
  isRequired: boolean | null;
  isLoading: boolean;
  error: string | null;
  canProceed: boolean;
}

interface OnboardingActions {
  checkStatus: () => Promise<void>;
  submitData: (data: OnboardingData) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook centralizado para gerenciar todo o estado do onboarding
 * Usa apenas profiles.onboarding_completed como fonte única de verdade
 */
export const useOnboardingStatus = (): OnboardingStatus & OnboardingActions => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { handleError } = useErrorHandler();
  
  const [isRequired, setIsRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função simplificada para verificar status do onboarding
  const checkStatus = useCallback(async () => {
    if (!user?.id || authLoading) {
      console.log('[OnboardingStatus] Aguardando autenticação');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[OnboardingStatus] Verificando status para usuário:', user.id);
      console.log('[OnboardingStatus] Profile onboarding_completed:', profile?.onboarding_completed);
      
      // Usar apenas o campo do perfil como fonte única de verdade
      const needsOnboarding = !profile?.onboarding_completed;
      
      console.log('[OnboardingStatus] Onboarding necessário:', needsOnboarding);
      
      setIsRequired(needsOnboarding);
    } catch (err) {
      console.error('[OnboardingStatus] Erro ao verificar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      handleError(err, 'useOnboardingStatus.checkStatus', { showToast: false });
      // Em caso de erro, assumir que não é necessário para não travar
      setIsRequired(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile?.onboarding_completed, authLoading, handleError]);

  // Função para submeter dados do onboarding
  const submitData = useCallback(async (data: OnboardingData) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('[OnboardingStatus] Salvando dados do onboarding');
      
      const onboardingRecord = {
        user_id: user.id,
        name: data.name,
        nickname: data.nickname,
        member_type: data.memberType,
        business_stage: data.businessStage,
        business_area: data.businessArea,
        team_size: data.teamSize,
        education_level: data.educationLevel,
        study_area: data.studyArea,
        institution: data.institution,
        target_market: data.targetMarket,
        main_challenges: data.mainChallenges || [],
        current_tools: data.currentTools || [],
        ai_experience: data.aiExperience,
        ai_tools_used: data.aiToolsUsed || [],
        ai_challenges: data.aiChallenges || [],
        primary_goals: data.primaryGoals || [],
        timeframe: data.timeframe,
        success_metrics: data.successMetrics || [],
        communication_style: data.communicationStyle,
        learning_preference: data.learningPreference,
        content_types: data.contentTypes || [],
        started_at: data.startedAt,
        completed_at: data.completedAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Salvar na tabela user_onboarding
      const { error: saveError } = await supabase
        .from('user_onboarding')
        .upsert(onboardingRecord, { onConflict: 'user_id' });

      if (saveError) {
        console.error('[OnboardingStatus] Erro ao salvar:', saveError);
        throw saveError;
      }

      // Atualizar perfil - FONTE ÚNICA DE VERDADE
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('[OnboardingStatus] Erro ao atualizar perfil:', profileError);
        throw profileError; // Falhar se não conseguir atualizar o perfil
      }

      console.log('[OnboardingStatus] Onboarding salvo com sucesso');
      
      // Atualizar estado local
      setIsRequired(false);
      
    } catch (err) {
      console.error('[OnboardingStatus] Erro ao salvar onboarding:', err);
      handleError(err, 'useOnboardingStatus.submitData');
      throw err;
    }
  }, [user?.id, handleError]);

  // Verificar status automaticamente quando o perfil estiver disponível
  useEffect(() => {
    if (!authLoading && user?.id && profile !== undefined) {
      console.log('[OnboardingStatus] Condições atendidas, verificando status');
      checkStatus();
    }
  }, [authLoading, user?.id, profile, checkStatus]);

  // Reset quando o usuário muda
  useEffect(() => {
    if (!user?.id) {
      console.log('[OnboardingStatus] Usuário deslogado, resetando estado');
      setIsRequired(null);
      setIsLoading(false);
      setError(null);
    }
  }, [user?.id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const canProceed = !authLoading && !isLoading && isRequired !== null;

  console.log('[OnboardingStatus] Estado atual:', {
    isRequired,
    isLoading: isLoading || authLoading,
    canProceed,
    userExists: !!user?.id,
    profileExists: !!profile,
    authLoading
  });

  return {
    isRequired,
    isLoading: isLoading || authLoading,
    error,
    canProceed,
    checkStatus,
    submitData,
    clearError
  };
};
