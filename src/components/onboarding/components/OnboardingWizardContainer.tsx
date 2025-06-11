
import React, { createContext, useContext, ReactNode, useState } from 'react';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    data,
    updateData,
    forceSave,
    isLoading,
    hasUnsavedChanges,
    lastSaved
  } = useOnboardingStorage();

  const { 
    validationErrors, 
    getFieldError, 
    validateStep 
  } = useOnboardingValidation();

  // Determinar se o passo atual é válido
  const isCurrentStepValid = validateStep(currentStep, data, 'club');

  const handleNext = async (): Promise<void> => {
    if (currentStep < totalSteps) {
      await forceSave();
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = async (): Promise<void> => {
    if (currentStep > 1) {
      await forceSave();
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleDataChange = (newData: Partial<OnboardingData>): void => {
    updateData(newData);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setIsSubmitting(true);
      
      // Marcar onboarding como completo
      const completedData = {
        ...data,
        completedAt: new Date().toISOString()
      };
      
      updateData(completedData);
      await forceSave();
      
      console.log('[OnboardingWizard] Onboarding finalizado com sucesso');
      
      // Redirecionar para o dashboard após conclusão bem-sucedida
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
    } finally {
      setIsSubmitting(false);
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
