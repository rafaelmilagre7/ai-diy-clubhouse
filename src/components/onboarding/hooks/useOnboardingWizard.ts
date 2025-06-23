
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

  // Ref para controlar componente montado
  const isMountedRef = useRef(true);
  
  // Ref para timeout de auto-save
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

  // Debounced data change handler
  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    try {
      // Só atualizar se componente ainda estiver montado
      if (!isMountedRef.current) return;
      
      onDataChange(newData);
      setHasUnsavedChanges(true);
      
      // Limpar timeout anterior
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Auto-save com debounce
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
        // Só validar se dados estão carregados (evita validação prematura)
        if (Object.keys(initialData).length > 1) {
          const isValid = validateStep(currentStep, initialData, memberType);
          if (isValid) {
            setCurrentStep(prev => prev + 1);
          } else {
            console.warn('[ONBOARDING-WIZARD] Validação falhou para etapa:', currentStep);
          }
        } else {
          console.warn('[ONBOARDING-WIZARD] Dados ainda não carregados');
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

  // Validação memoizada para evitar re-renders desnecessários
  const isCurrentStepValid = useCallback(() => {
    return Object.keys(initialData).length > 1 
      ? validateStep(currentStep, initialData, memberType)
      : false;
  }, [currentStep, initialData, memberType, validateStep]);

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
