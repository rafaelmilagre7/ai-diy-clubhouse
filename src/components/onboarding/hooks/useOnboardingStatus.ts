
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
  console.log('[useOnboardingStatus] Hook iniciado');
  
  // TODOS OS HOOKS DEVEM SER EXECUTADOS SEMPRE
  const { user, profile, isLoading: authLoading } = useAuth();
  const { handleError } = useErrorHandler();
  
  const [isRequired, setIsRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Memoizar se o onboarding é necessário baseado no perfil - sempre executado
  const onboardingNeeded = useMemo(() => {
    if (!profile) return null;
    const needed = !profile.onboarding_completed;
    console.log('[useOnboardingStatus] Onboarding necessário:', needed, 'profile:', profile);
    return needed;
  }, [profile?.onboarding_completed]);

  const checkStatus = useCallback(async () => {
    console.log('[useOnboardingStatus] checkStatus - user:', !!user, 'authLoading:', authLoading, 'hasChecked:', hasChecked);
    
    if (!user?.id || authLoading || hasChecked) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[useOnboardingStatus] Verificando status para usuário:', user.id);
      
      // Usar apenas o campo do perfil como fonte única de verdade
      const needsOnboarding = onboardingNeeded;
      
      console.log('[useOnboardingStatus] Resultado da verificação - precisa de onboarding:', needsOnboarding);
      
      setIsRequired(needsOnboarding);
      setHasChecked(true);
    } catch (err) {
      console.error('[useOnboardingStatus] Erro ao verificar:', err);
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
    console.log('[useOnboardingStatus] submitData iniciado');
    
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('[useOnboardingStatus] Salvando dados do onboarding');
      
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
        console.error('[useOnboardingStatus] Erro ao salvar:', saveError);
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
        console.error('[useOnboardingStatus] Erro ao atualizar perfil:', profileError);
        throw profileError;
      }

      console.log('[useOnboardingStatus] Onboarding salvo com sucesso');
      setIsRequired(false);
      
    } catch (err) {
      console.error('[useOnboardingStatus] Erro ao salvar onboarding:', err);
      handleError(err, 'useOnboardingStatus.submitData');
      throw err;
    }
  }, [user?.id, handleError]);

  const clearError = useCallback(() => {
    console.log('[useOnboardingStatus] clearError');
    setError(null);
  }, []);

  // Verificar status automaticamente quando as condições estiverem prontas
  useEffect(() => {
    console.log('[useOnboardingStatus] useEffect - authLoading:', authLoading, 'user:', !!user, 'profile:', !!profile, 'onboardingNeeded:', onboardingNeeded, 'hasChecked:', hasChecked);
    
    if (!authLoading && user?.id && profile !== undefined && onboardingNeeded !== null && !hasChecked) {
      console.log('[useOnboardingStatus] Condições atendidas, executando checkStatus');
      checkStatus();
    }
  }, [authLoading, user?.id, profile, onboardingNeeded, hasChecked, checkStatus]);

  // Reset quando o usuário muda
  useEffect(() => {
    if (!user?.id) {
      console.log('[useOnboardingStatus] Reset - usuário deslogado');
      setIsRequired(null);
      setIsLoading(false);
      setError(null);
      setHasChecked(false);
    }
  }, [user?.id]);

  const canProceed = !authLoading && !isLoading && isRequired !== null && hasChecked;

  console.log('[useOnboardingStatus] Estado atual:', {
    isRequired,
    isLoading: isLoading || authLoading,
    error,
    canProceed,
    hasChecked,
    authLoading,
    user: !!user,
    profile: !!profile
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
