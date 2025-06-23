
import { useState, useCallback, useRef, useEffect } from 'react';
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

  const isMountedRef = useRef(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { completeOnboarding, isCompleting, completionError } = useOnboardingCompletion();
  const { validateStep, validationErrors, getFieldError } = useOnboardingValidation();

  const totalSteps = 6;

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Verificar se dados estão prontos
  const isDataReady = useCallback(() => {
    const hasBasicData = initialData.memberType && initialData.startedAt;
    const hasRequiredFields = initialData.email || initialData.name;
    return hasBasicData && hasRequiredFields;
  }, [initialData]);

  // Handler de mudança de dados com debounce
  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    try {
      if (!isMountedRef.current) return;
      
      onDataChange(newData);
      setHasUnsavedChanges(true);
      
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        }
      }, 1000);
    } catch (error) {
      console.error('[ONBOARDING-WIZARD] Erro ao atualizar dados:', error);
    }
  }, [onDataChange]);

  const handleNext = useCallback(async () => {
    try {
      if (currentStep < totalSteps) {
        if (isDataReady()) {
          const isValid = validateStep(currentStep, initialData, memberType);
          if (isValid) {
            setCurrentStep(prev => prev + 1);
          }
        } else {
          // Para convites, permitir avanço na primeira etapa
          if (initialData.fromInvite && currentStep === 1) {
            setCurrentStep(prev => prev + 1);
          }
        }
      }
    } catch (error) {
      console.error('[ONBOARDING-WIZARD] Erro ao avançar etapa:', error);
    }
  }, [currentStep, totalSteps, validateStep, initialData, memberType, isDataReady]);

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
      console.log('[ONBOARDING-WIZARD] Iniciando finalização');
      await completeOnboarding(initialData, memberType);
    } catch (error) {
      console.error('[ONBOARDING-WIZARD] Erro na finalização:', error);
      throw error;
    }
  }, [completeOnboarding, initialData, memberType]);

  // Validação da etapa atual
  const isCurrentStepValid = useCallback(() => {
    if (!isDataReady()) return false;
    return validateStep(currentStep, initialData, memberType);
  }, [currentStep, initialData, memberType, validateStep, isDataReady]);

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
    isCurrentStepValid: isCurrentStepValid(),
    lastSaved,
    hasUnsavedChanges,
    completionError
  };
};
