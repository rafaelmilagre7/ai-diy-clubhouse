
import { useState, useCallback } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useOnboardingSubmit } from './useOnboardingSubmit';
import { useOnboardingValidation } from './useOnboardingValidation';

interface UseOnboardingWizardProps {
  initialData: OnboardingData;
  onDataChange: (data: Partial<OnboardingData>) => void;
  memberType: 'club' | 'formacao'; // ADICIONADO: parâmetro memberType
}

export const useOnboardingWizard = ({ initialData, onDataChange, memberType }: UseOnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { submitOnboarding, isSubmitting } = useOnboardingSubmit();
  const { validateStep, validationErrors, getFieldError } = useOnboardingValidation();

  const totalSteps = 6;

  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    onDataChange(newData);
    setHasUnsavedChanges(true);
    
    // Auto-save simulation
    setTimeout(() => {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }, 1000);
  }, [onDataChange]);

  const handleNext = useCallback(async () => {
    if (currentStep < totalSteps) {
      const isValid = validateStep(currentStep, initialData, memberType); // CORRIGIDO: adicionado memberType
      if (isValid) {
        setCurrentStep(prev => prev + 1);
      }
    }
  }, [currentStep, totalSteps, validateStep, initialData, memberType]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    try {
      await submitOnboarding(initialData);
    } catch (error) {
      console.error('[ONBOARDING-WIZARD] Erro no submit:', error);
      throw error;
    }
  }, [submitOnboarding, initialData]);

  const isCurrentStepValid = validateStep(currentStep, initialData, memberType); // CORRIGIDO: adicionado memberType

  return {
    currentStep,
    totalSteps,
    isSubmitting,
    validationErrors,
    getFieldError,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    lastSaved,
    hasUnsavedChanges
  };
};
