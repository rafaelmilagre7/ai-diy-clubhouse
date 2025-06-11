
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
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

  // Usar useCallback para evitar re-criação desnecessária das funções
  const handleNext = useCallback(async (): Promise<void> => {
    if (currentStep < totalSteps) {
      await forceSave();
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps, forceSave]);

  const handlePrevious = useCallback(async (): Promise<void> => {
    if (currentStep > 1) {
      await forceSave();
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, forceSave]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>): void => {
    updateData(newData);
  }, [updateData]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (isSubmitting) return; // Prevenir múltiplas submissões
    
    try {
      setIsSubmitting(true);
      
      // Salvar dados antes de navegar
      await forceSave();
      
      console.log('[OnboardingWizard] Onboarding finalizado com sucesso');
      
      // Redirecionar para o dashboard após conclusão bem-sucedida
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, forceSave, navigate]);

  // Calcular se o passo atual é válido de forma memoizada
  const isCurrentStepValid = React.useMemo(() => {
    return validateStep(currentStep, data, 'club');
  }, [validateStep, currentStep, data]);

  const contextValue: OnboardingWizardContextType = React.useMemo(() => ({
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
  }), [
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
  ]);

  return (
    <OnboardingWizardContext.Provider value={contextValue}>
      {children(contextValue)}
    </OnboardingWizardContext.Provider>
  );
};
