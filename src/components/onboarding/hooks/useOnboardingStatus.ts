
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logger } from '@/utils/logger';

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
  const { user, profile, isLoading: authLoading } = useAuth();
  const { handleError } = useErrorHandler();
  
  const [isRequired, setIsRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    // Se não há usuário ou ainda está carregando auth, aguardar
    if (!user?.id || authLoading) {
      logger.debug('Aguardando autenticação', { 
        hasUser: !!user, 
        authLoading,
        component: 'ONBOARDING_STATUS'
      });
      return;
    }

    // Se não há profile ainda, aguardar um pouco mais
    if (!profile) {
      logger.debug('Aguardando profile', {
        component: 'ONBOARDING_STATUS'
      });
      setIsLoading(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('Verificando status do onboarding', {
        hasProfile: !!profile,
        onboardingCompleted: profile.onboarding_completed,
        component: 'ONBOARDING_STATUS'
      });
      
      // Verificar se profile indica onboarding completo
      if (profile.onboarding_completed) {
        logger.info('Onboarding já completo no perfil', {
          component: 'ONBOARDING_STATUS'
        });
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
        logger.error('Erro ao verificar onboarding', {
          error: onboardingError.message,
          component: 'ONBOARDING_STATUS'
        });
        throw onboardingError;
      }

      const needsOnboarding = !onboardingRecord?.completed_at;
      logger.info('Status de onboarding determinado', { 
        needsOnboarding,
        hasRecord: !!onboardingRecord,
        component: 'ONBOARDING_STATUS'
      });
      
      setIsRequired(needsOnboarding);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      logger.error('Erro ao verificar status de onboarding', {
        error: errorMessage,
        component: 'ONBOARDING_STATUS'
      });
      setError(errorMessage);
      handleError(err, 'useOnboardingStatus.checkStatus', { showToast: false });
      setIsRequired(false); // Em caso de erro, não bloquear o usuário
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile, authLoading, handleError]);

  const submitData = useCallback(async (data: OnboardingData) => {
    logger.info('Iniciando submissão dos dados de onboarding', {
      component: 'ONBOARDING_STATUS'
    });
    
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Sanitizar dados antes de salvar (remover campos sensíveis se houver)
      const sanitizedData = {
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

      logger.info('Salvando dados de onboarding', {
        component: 'ONBOARDING_STATUS'
      });

      // Salvar na tabela user_onboarding
      const { error: saveError } = await supabase
        .from('user_onboarding')
        .upsert(sanitizedData, { onConflict: 'user_id' });

      if (saveError) {
        logger.error('Erro ao salvar onboarding', {
          error: saveError.message,
          component: 'ONBOARDING_STATUS'
        });
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
        logger.error('Erro ao atualizar perfil', {
          error: profileError.message,
          component: 'ONBOARDING_STATUS'
        });
        throw profileError;
      }

      logger.info('Onboarding salvo com sucesso', {
        component: 'ONBOARDING_STATUS'
      });
      setIsRequired(false);
      
    } catch (err) {
      logger.error('Erro ao salvar onboarding', {
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        component: 'ONBOARDING_STATUS'
      });
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
      logger.debug('Auto-verificando status com profile', {
        component: 'ONBOARDING_STATUS'
      });
      checkStatus();
    }
  }, [authLoading, user?.id, profile, isRequired, checkStatus]);

  // Reset quando usuário muda
  useEffect(() => {
    if (!user?.id) {
      logger.debug('Reset - usuário deslogado', {
        component: 'ONBOARDING_STATUS'
      });
      setIsRequired(null);
      setIsLoading(false);
      setError(null);
    }
  }, [user?.id]);

  // Se ainda está carregando auth ou não tem profile, manter loading
  const finalIsLoading = authLoading || isLoading || (!profile && !!user?.id);

  logger.debug('Estado final do onboarding', {
    isRequired,
    isLoading: finalIsLoading,
    hasError: !!error,
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    component: 'ONBOARDING_STATUS'
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
