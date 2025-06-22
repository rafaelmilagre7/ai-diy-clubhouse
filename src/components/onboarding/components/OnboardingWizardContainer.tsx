
import React, { useState, useCallback } from 'react';
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
  }) => React.ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Hooks modulares
  const { data, updateData, forceSave, hasUnsavedChanges: storageHasChanges } = useOnboardingStorage();
  const { validationErrors, validateStep, getFieldError } = useOnboardingValidation();
  const { currentStep, isSubmitting, setIsSubmitting, handleNext: flowHandleNext, handlePrevious } = useOnboardingFlow();
  const { isLoading, memberType } = useOnboardingInitialization(data, updateData);
  const { handleSubmit: submitOnboarding } = useOnboardingSubmission();

  // Atualizar estado quando storage muda
  React.useEffect(() => {
    setHasUnsavedChanges(storageHasChanges);
  }, [storageHasChanges]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    updateData(newData);
    setHasUnsavedChanges(true);
  }, [updateData]);

  const isCurrentStepValid = validateStep(currentStep, data, memberType);

  const handleNext = useCallback(async () => {
    await flowHandleNext(isCurrentStepValid, forceSave, setLastSaved, setHasUnsavedChanges);
  }, [flowHandleNext, isCurrentStepValid, forceSave]);

  const handleSubmit = useCallback(async () => {
    await submitOnboarding(data, memberType, forceSave, setIsSubmitting);
  }, [submitOnboarding, data, memberType, forceSave, setIsSubmitting]);

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
    totalSteps: 6
  });
};
