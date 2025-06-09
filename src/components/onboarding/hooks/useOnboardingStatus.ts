
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface OnboardingStatus {
  isRequired: boolean | null;
  isLoading: boolean;
  error: string | null;
}

interface OnboardingActions {
  checkStatus: () => Promise<void>;
  submitData: (data: OnboardingData) => Promise<void>;
  clearError: () => void;
}

export const useOnboardingStatus = (): OnboardingStatus & OnboardingActions => {
  console.log('[useOnboardingStatus] Hook iniciado');
  
  const { user, profile, isLoading: authLoading } = useAuth();
  const { handleError } = useErrorHandler();
  
  const [isRequired, setIsRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    // Se não há usuário ou ainda está carregando auth, aguardar
    if (!user?.id || authLoading) {
      console.log('[useOnboardingStatus] Aguardando autenticação... user:', !!user, 'authLoading:', authLoading);
      return;
    }

    // Se não há profile ainda, aguardar um pouco mais
    if (!profile) {
      console.log('[useOnboardingStatus] Aguardando profile...');
      setIsLoading(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[useOnboardingStatus] Verificando status do onboarding para:', user.id, 'profile:', profile);
      
      // Verificar se profile indica onboarding completo
      if (profile.onboarding_completed) {
        console.log('[useOnboardingStatus] Onboarding já completo no perfil');
        setIsRequired(false);
        setIsLoading(false);
        return;
      }

      // Verificar se existe registro de onboarding completo
      const { data: onboardingRecord, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select('completed_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (onboardingError) {
        console.error('[useOnboardingStatus] Erro ao verificar onboarding:', onboardingError);
        throw onboardingError;
      }

      const needsOnboarding = !onboardingRecord?.completed_at;
      console.log('[useOnboardingStatus] Onboarding necessário:', needsOnboarding, 'record:', onboardingRecord);
      
      setIsRequired(needsOnboarding);
    } catch (err) {
      console.error('[useOnboardingStatus] Erro:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      handleError(err, 'useOnboardingStatus.checkStatus', { showToast: false });
      setIsRequired(false); // Em caso de erro, não bloquear o usuário
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile, authLoading, handleError]);

  const submitData = useCallback(async (data: OnboardingData) => {
    console.log('[useOnboardingStatus] Iniciando submissão dos dados');
    
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
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

      console.log('[useOnboardingStatus] Salvando onboarding:', onboardingRecord);

      // Salvar na tabela user_onboarding
      const { error: saveError } = await supabase
        .from('user_onboarding')
        .upsert(onboardingRecord, { onConflict: 'user_id' });

      if (saveError) {
        console.error('[useOnboardingStatus] Erro ao salvar onboarding:', saveError);
        throw saveError;
      }

      // Atualizar perfil para marcar onboarding como completo
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
    setError(null);
  }, []);

  // Auto-verificar status quando há profile disponível
  useEffect(() => {
    if (!authLoading && user?.id && profile && isRequired === null) {
      console.log('[useOnboardingStatus] Auto-verificando status com profile');
      checkStatus();
    }
  }, [authLoading, user?.id, profile, isRequired, checkStatus]);

  // Reset quando usuário muda
  useEffect(() => {
    if (!user?.id) {
      console.log('[useOnboardingStatus] Reset - usuário deslogado');
      setIsRequired(null);
      setIsLoading(false);
      setError(null);
    }
  }, [user?.id]);

  // Se ainda está carregando auth ou não tem profile, manter loading
  const finalIsLoading = authLoading || isLoading || (!profile && !!user?.id);

  console.log('[useOnboardingStatus] Estado final:', {
    isRequired,
    isLoading: finalIsLoading,
    error,
    user: !!user,
    profile: !!profile,
    authLoading
  });

  return {
    isRequired,
    isLoading: finalIsLoading,
    error,
    checkStatus,
    submitData,
    clearError
  };
};
