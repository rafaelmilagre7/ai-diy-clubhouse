
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
 * Evita verificações duplicadas e problemas de re-render
 */
export const useOnboardingStatus = (): OnboardingStatus & OnboardingActions => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { handleError } = useErrorHandler();
  
  const [isRequired, setIsRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Função para verificar status do onboarding - memoizada e estável
  const checkStatus = useCallback(async () => {
    // Evitar múltiplas verificações simultâneas
    if (hasChecked || !user?.id || !profile || authLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[OnboardingStatus] Verificando status para usuário:', user.id);
      
      const { data, error: dbError } = await supabase
        .from('user_onboarding')
        .select('completed_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError) {
        console.error('[OnboardingStatus] Erro na consulta:', dbError);
        throw dbError;
      }
      
      const needsOnboarding = !data || !data.completed_at;
      console.log('[OnboardingStatus] Onboarding necessário:', needsOnboarding);
      
      setIsRequired(needsOnboarding);
      setHasChecked(true);
    } catch (err) {
      console.error('[OnboardingStatus] Erro ao verificar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      handleError(err, 'useOnboardingStatus.checkStatus', { showToast: false });
      // Em caso de erro, assumir que não é necessário para não travar
      setIsRequired(false);
      setHasChecked(true);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile, authLoading, hasChecked, handleError]);

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

      const { error: saveError } = await supabase
        .from('user_onboarding')
        .upsert(onboardingRecord, { onConflict: 'user_id' });

      if (saveError) {
        console.error('[OnboardingStatus] Erro ao salvar:', saveError);
        throw saveError;
      }

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('[OnboardingStatus] Erro ao atualizar perfil:', profileError);
        // Não falhar aqui, pois o onboarding principal foi salvo
      }

      console.log('[OnboardingStatus] Onboarding salvo com sucesso');
      
      // Atualizar estado local
      setIsRequired(false);
      setHasChecked(true);
      
    } catch (err) {
      console.error('[OnboardingStatus] Erro ao salvar onboarding:', err);
      handleError(err, 'useOnboardingStatus.submitData');
      throw err;
    }
  }, [user?.id, handleError]);

  // Verificar status automaticamente quando as condições estiverem prontas
  useEffect(() => {
    if (!authLoading && user?.id && profile && !hasChecked && !isLoading) {
      checkStatus();
    }
  }, [authLoading, user?.id, profile, hasChecked, isLoading, checkStatus]);

  // Reset quando o usuário muda
  useEffect(() => {
    if (!user?.id) {
      setIsRequired(null);
      setIsLoading(false);
      setError(null);
      setHasChecked(false);
    }
  }, [user?.id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const canProceed = !authLoading && !isLoading && hasChecked;

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
