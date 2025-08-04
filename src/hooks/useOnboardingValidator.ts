import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface OnboardingValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  profileData?: any;
  onboardingData?: any;
}

/**
 * Hook para validar consistência do onboarding
 * Verifica se há problemas entre os dados de perfil e onboarding
 */
export const useOnboardingValidator = () => {
  const { user, profile } = useAuth();

  const validateOnboardingConsistency = useCallback(async (): Promise<OnboardingValidationResult> => {
    const result: OnboardingValidationResult = {
      isValid: true,
      issues: [],
      warnings: []
    };

    if (!user?.id) {
      result.isValid = false;
      result.issues.push('Usuário não autenticado');
      return result;
    }

    try {
      // Buscar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        result.isValid = false;
        result.issues.push(`Erro ao buscar perfil: ${profileError.message}`);
        return result;
      }

      result.profileData = profileData;

      // Buscar dados do onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (onboardingError && onboardingError.code !== 'PGRST116') {
        result.warnings.push(`Erro ao buscar dados de onboarding: ${onboardingError.message}`);
      }

      result.onboardingData = onboardingData;

      // Verificações de consistência
      
      // 1. Verificar se role_id está definido
      if (!profileData.role_id) {
        result.isValid = false;
        result.issues.push('Usuário sem role atribuído');
      }

      // 2. Verificar consistência do status de onboarding
      if (profileData.onboarding_completed && !onboardingData?.is_completed) {
        result.warnings.push('Profile marcado como completo mas onboarding_final não');
      }

      if (!profileData.onboarding_completed && onboardingData?.is_completed) {
        result.warnings.push('Onboarding_final completo mas profile não marcado');
      }

      // 3. Verificar dados básicos
      if (!profileData.name || profileData.name.trim() === '') {
        result.warnings.push('Nome do usuário não está preenchido');
      }

      if (!profileData.email || profileData.email.trim() === '') {
        result.warnings.push('Email do usuário não está preenchido');
      }

      // 4. Verificar se onboarding existe mas não está completo
      if (onboardingData && !onboardingData.is_completed) {
        const currentStep = onboardingData.current_step || 1;
        if (currentStep < 6) {
          result.warnings.push(`Onboarding incompleto - parado no step ${currentStep}`);
        }
      }

      // 5. Verificar dados de onboarding se existem
      if (onboardingData) {
        if (!onboardingData.personal_info || Object.keys(onboardingData.personal_info).length === 0) {
          result.warnings.push('Dados pessoais do onboarding estão vazios');
        }

        if (!onboardingData.business_info || Object.keys(onboardingData.business_info).length === 0) {
          result.warnings.push('Dados profissionais do onboarding estão vazios');
        }
      }

      logger.info('[ONBOARDING-VALIDATOR] Validação concluída', {
        isValid: result.isValid,
        issuesCount: result.issues.length,
        warningsCount: result.warnings.length,
        userId: user.id.substring(0, 8) + '***'
      });

    } catch (error) {
      result.isValid = false;
      result.issues.push(`Erro durante validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      logger.error('[ONBOARDING-VALIDATOR] Erro na validação:', error);
    }

    return result;
  }, [user?.id]);

  const fixOnboardingInconsistencies = useCallback(async () => {
    if (!user?.id) return false;

    try {
      logger.info('[ONBOARDING-VALIDATOR] Tentando corrigir inconsistências...');

      // Tentar executar a função de correção do banco
      const { data, error } = await supabase.rpc('validate_onboarding_state', {
        p_user_id: user.id
      });

      if (error) {
        logger.error('[ONBOARDING-VALIDATOR] Erro ao corrigir inconsistências:', error);
        return false;
      }

      logger.info('[ONBOARDING-VALIDATOR] Correções aplicadas:', data);
      return true;

    } catch (error) {
      logger.error('[ONBOARDING-VALIDATOR] Erro crítico na correção:', error);
      return false;
    }
  }, [user?.id]);

  return {
    validateOnboardingConsistency,
    fixOnboardingInconsistencies
  };
};