
import { useState, useCallback } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useOnboardingCompletion } from './useOnboardingCompletion';
import { useOnboardingValidation } from './useOnboardingValidation';

interface UseOnboardingWizardProps {
  initialData: OnboardingData;
  onDataChange: (data: Partial<OnboardingData>) => void;
  memberType: 'club' | 'formacao';
}

export const useOnboardingWizard = ({ 
  initialData, 
  onDataChange, 
  memberType 
}: UseOnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { completeOnboarding, isCompleting, completionError } = useOnboardingCompletion();
  const { validateStep, validationErrors, getFieldError } = useOnboardingValidation();

  const totalSteps = 6;

  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    try {
      onDataChange(newData);
      setHasUnsavedChanges(true);
      
      // Simulação de auto-save com proteção contra erros
      setTimeout(() => {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }, 1000);
    } catch (error) {
      console.error('[ONBOARDING-WIZARD] Erro ao atualizar dados:', error);
    }
  }, [onDataChange]);

  const handleNext = useCallback(async () => {
    try {
      if (currentStep < totalSteps) {
        // Validar apenas se os dados estão carregados
        if (Object.keys(initialData).length > 1) {
          const isValid = validateStep(currentStep, initialData, memberType);
          if (isValid) {
            setCurrentStep(prev => prev + 1);
          } else {
            console.warn('[ONBOARDING-WIZARD] Validação falhou para etapa:', currentStep);
          }
        } else {
          console.warn('[ONBOARDING-WIZARD] Dados ainda não carregados, aguardando...');
        }
      }
    } catch (error) {
      console.error('[ONBOARDING-WIZARD] Erro ao avançar etapa:', error);
    }
  }, [currentStep, totalSteps, validateStep, initialData, memberType]);

  const handlePrevious = useCallback(() => {
    try {
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
      }
    } catch (error) {
      console.error('[ONBOARDING-WIZARD] Erro ao voltar etapa:', error);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    try {
      console.log('[ONBOARDING-WIZARD] Iniciando finalização do onboarding');
      await completeOnboarding(initialData, memberType);
    } catch (error) {
      console.error('[ONBOARDING-WIZARD] Erro na finalização:', error);
      throw error;
    }
  }, [completeOnboarding, initialData, memberType]);

  // Validação com proteção contra dados não carregados
  const isCurrentStepValid = Object.keys(initialData).length > 1 
    ? validateStep(currentStep, initialData, memberType)
    : false;

  return {
    currentStep,
    totalSteps,
    isSubmitting: isCompleting,
    validationErrors,
    getFieldError,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    lastSaved,
    hasUnsavedChanges,
    completionError
  };
};
