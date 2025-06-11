
import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStorage } from '../hooks/useOnboardingStorage';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingWizardContextType {
  currentStep: number;
  isSubmitting: boolean;
  data: OnboardingData;
  isLoading: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  handleDataChange: (newData: Partial<OnboardingData>) => void;
  handleSubmit: () => Promise<void>;
  isCurrentStepValid: boolean;
  totalSteps: number;
}

const OnboardingWizardContext = createContext<OnboardingWizardContextType | null>(null);

export const useOnboardingWizard = () => {
  const context = useContext(OnboardingWizardContext);
  if (!context) {
    throw new Error('useOnboardingWizard must be used within OnboardingWizardContainer');
  }
  return context;
};

interface OnboardingWizardContainerProps {
  children: (context: OnboardingWizardContextType) => ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
  const navigate = useNavigate();
  const totalSteps = 6;
  
  const {
    currentStep,
    data,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    isSubmitting,
    handleNext: storageHandleNext,
    handlePrevious: storageHandlePrevious,
    handleDataChange,
    handleSubmit: storageHandleSubmit
  } = useOnboardingStorage(totalSteps);

  const { validationErrors, getFieldError, isCurrentStepValid } = useOnboardingValidation(data, currentStep);

  const handleNext = async (): Promise<void> => {
    await storageHandleNext();
  };

  const handlePrevious = async (): Promise<void> => {
    await storageHandlePrevious();
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      await storageHandleSubmit();
      // Redirecionar para o dashboard após conclusão bem-sucedida
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
    }
  };

  const contextValue: OnboardingWizardContextType = {
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
    totalSteps
  };

  return (
    <OnboardingWizardContext.Provider value={contextValue}>
      {children(contextValue)}
    </OnboardingWizardContext.Provider>
  );
};
