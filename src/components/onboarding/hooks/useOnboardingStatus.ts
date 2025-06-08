
import { useState, useEffect, useCallback, useMemo } from 'react';
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

export const useOnboardingStatus = (): OnboardingStatus & OnboardingActions => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { handleError } = useErrorHandler();
  
  const [isRequired, setIsRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Memoizar se o onboarding é necessário baseado no perfil
  const onboardingNeeded = useMemo(() => {
    if (!profile) return null;
    return !profile.onboarding_completed;
  }, [profile?.onboarding_completed]);

  const checkStatus = useCallback(async () => {
    if (!user?.id || authLoading || hasChecked) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[OnboardingStatus] Verificando status para usuário:', user.id);
      
      // Usar apenas o campo do perfil como fonte única de verdade
      const needsOnboarding = onboardingNeeded;
      
      console.log('[OnboardingStatus] Onboarding necessário:', needsOnboarding);
      
      setIsRequired(needsOnboarding);
      setHasChecked(true);
    } catch (err) {
      console.error('[OnboardingStatus] Erro ao verificar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      handleError(err, 'useOnboardingStatus.checkStatus', { showToast: false });
      setIsRequired(false);
      setHasChecked(true);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, onboardingNeeded, authLoading, handleError, hasChecked]);

  const submitData = useCallback(async (data: OnboardingData) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('[OnboardingStatus] Salvando dados do onboarding');
      
      const onboardingRecord = {
        user_id: user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        instagram: data.instagram,
        linkedin: data.linkedin,
        state: data.state,
        city: data.city,
        birth_date: data.birthDate,
        curiosity: data.curiosity,
        company_name: data.companyName,
        company_website: data.companyWebsite,
        business_sector: data.businessSector,
        company_size: data.companySize,
        annual_revenue: data.annualRevenue,
        position: data.position,
        has_implemented_ai: data.hasImplementedAI,
        ai_tools_used: data.aiToolsUsed || [],
        ai_knowledge_level: data.aiKnowledgeLevel,
        daily_tools: data.dailyTools || [],
        who_will_implement: data.whoWillImplement,
        main_objective: data.mainObjective,
        area_to_impact: data.areaToImpact,
        expected_result_90_days: data.expectedResult90Days,
        ai_implementation_budget: data.aiImplementationBudget,
        weekly_learning_time: data.weeklyLearningTime,
        content_preference: data.contentPreference,
        wants_networking: data.wantsNetworking,
        best_days: data.bestDays || [],
        best_periods: data.bestPeriods || [],
        accepts_case_study: data.acceptsCaseStudy,
        member_type: data.memberType,
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
        throw profileError;
      }

      console.log('[OnboardingStatus] Onboarding salvo com sucesso');
      setIsRequired(false);
      
    } catch (err) {
      console.error('[OnboardingStatus] Erro ao salvar onboarding:', err);
      handleError(err, 'useOnboardingStatus.submitData');
      throw err;
    }
  }, [user?.id, handleError]);

  // Verificar status automaticamente quando as condições estiverem prontas
  useEffect(() => {
    if (!authLoading && user?.id && profile !== undefined && onboardingNeeded !== null && !hasChecked) {
      checkStatus();
    }
  }, [authLoading, user?.id, profile, onboardingNeeded, hasChecked, checkStatus]);

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

  const canProceed = !authLoading && !isLoading && isRequired !== null && hasChecked;

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
