
import React, { useState, useCallback, useMemo } from 'react';
import { useOnboardingStorage } from '../hooks/useOnboardingStorage';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useOnboardingInitialization } from '../hooks/useOnboardingInitialization';
import { useOnboardingSubmission } from '../hooks/useOnboardingSubmission';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingWizardContainerProps {
  children: (props: {
    currentStep: number;
    isSubmitting: boolean;
    data: OnboardingData;
    isLoading: boolean;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
    validationErrors: Array<{ field: string; message: string }>;
    getFieldError: (field: string) => string | undefined;
    handleNext: () => Promise<void>;
    handlePrevious: () => void;
    handleDataChange: (newData: Partial<OnboardingData>) => void;
    handleSubmit: () => Promise<void>;
    isCurrentStepValid: boolean;
    totalSteps: number;
    memberType: 'club' | 'formacao';
  }) => React.ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Hooks modulares
  const { data, updateData, forceSave, hasUnsavedChanges: storageHasChanges } = useOnboardingStorage();
  const { isLoading, memberType } = useOnboardingInitialization(data, updateData);
  
  // Passar isDataLoaded para o hook de validação
  const isDataLoaded = !isLoading && Object.keys(data).length > 1;
  const { validationErrors, validateStep, getFieldError } = useOnboardingValidation(isDataLoaded);
  
  const { currentStep, isSubmitting, setIsSubmitting, handleNext: flowHandleNext, handlePrevious } = useOnboardingFlow();
  const { handleSubmit: submitOnboarding } = useOnboardingSubmission();

  // Atualizar estado quando storage muda
  React.useEffect(() => {
    setHasUnsavedChanges(storageHasChanges);
  }, [storageHasChanges]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    updateData(newData);
    setHasUnsavedChanges(true);
  }, [updateData]);

  // Garantir que memberType seja tipado corretamente
  const typedMemberType: 'club' | 'formacao' = (memberType === 'formacao') ? 'formacao' : 'club';

  // Memoizar validação do step atual para evitar recálculos desnecessários
  const isCurrentStepValid = useMemo(() => {
    if (!isDataLoaded) {
      console.log('[VALIDATION] Dados ainda não carregados, considerando step válido');
      return true;
    }
    
    const isValid = validateStep(currentStep, data, typedMemberType);
    console.log(`[VALIDATION] Step ${currentStep} é válido: ${isValid}`);
    return isValid;
  }, [isDataLoaded, currentStep, data, typedMemberType, validateStep]);

  const handleNext = useCallback(async () => {
    await flowHandleNext(isCurrentStepValid, forceSave, setLastSaved, setHasUnsavedChanges);
  }, [flowHandleNext, isCurrentStepValid, forceSave]);

  const handleSubmit = useCallback(async () => {
    await submitOnboarding(data, typedMemberType, forceSave, setIsSubmitting);
  }, [submitOnboarding, data, typedMemberType, forceSave, setIsSubmitting]);

  return children({
    currentStep,
    isSubmitting,
    data,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    getFieldError,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    totalSteps: 6,
    memberType: typedMemberType
  });
};
