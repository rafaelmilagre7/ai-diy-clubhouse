
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
import { useOnboardingStorage } from '../hooks/useOnboardingStorage';
import { useToast } from '@/hooks/use-toast';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingWizardContextType {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  isLoading: boolean;
  isSubmitting: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  handleDataChange: (newData: Partial<OnboardingData>) => void;
  handleSubmit: () => Promise<void>;
  isCurrentStepValid: boolean;
}

const OnboardingWizardContext = createContext<OnboardingWizardContextType | undefined>(undefined);

export const useOnboardingWizard = () => {
  const context = useContext(OnboardingWizardContext);
  if (!context) {
    throw new Error('useOnboardingWizard must be used within OnboardingWizardContainer');
  }
  return context;
};

interface OnboardingWizardContainerProps {
  children: (contextValue: OnboardingWizardContextType) => React.ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Hook de storage para persistência
  const {
    data: storageData,
    updateData,
    forceSave,
    isLoading: storageLoading,
    hasUnsavedChanges,
    lastSaved
  } = useOnboardingStorage();

  // Estados básicos
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const {
    validationErrors,
    getFieldError,
    validateCurrentStep,
  } = useOnboardingValidation();

  // Usar dados do storage ou dados vazios como fallback com tipos corretos
  const data: OnboardingData = useMemo(() => {
    return storageData || {
      memberType: 'club' as const,
      name: '',
      email: '',
      city: ''
    };
  }, [storageData]);

  // Mover validação para useMemo para evitar re-renders infinitos
  const isCurrentStepValid = useMemo(() => {
    console.log('[WIZARD-CONTAINER] Validando etapa (useMemo):', currentStep);
    const result = validateCurrentStep(currentStep, data, data.memberType || 'club');
    console.log('[WIZARD-CONTAINER] Resultado da validação (useMemo):', result);
    return result.isValid;
  }, [currentStep, data, validateCurrentStep]);

  const handleNext = useCallback(async () => {
    console.log('[WIZARD-CONTAINER] Tentando avançar para próxima etapa');
    
    if (!isCurrentStepValid) {
      console.log('[WIZARD-CONTAINER] Validação falhou, não avançando');
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Salvar dados antes de avançar
    try {
      await forceSave();
      console.log('[WIZARD-CONTAINER] Dados salvos antes de avançar');
    } catch (error) {
      console.error('[WIZARD-CONTAINER] Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: "Houve um erro ao salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    const nextStep = currentStep + 1;
    console.log('[WIZARD-CONTAINER] Avançando para etapa:', nextStep);
    setCurrentStep(nextStep);
  }, [isCurrentStepValid, currentStep, toast, forceSave]);

  const handlePrevious = useCallback(() => {
    console.log('[WIZARD-CONTAINER] Voltando para etapa anterior');
    const prevStep = Math.max(1, currentStep - 1);
    setCurrentStep(prevStep);
  }, [currentStep]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    console.log('[WIZARD-CONTAINER] Dados alterados:', newData);
    // Usar updateData do storage para persistir automaticamente
    updateData(newData);
  }, [updateData]);

  const handleSubmit = useCallback(async () => {
    console.log('[WIZARD-CONTAINER] Finalizando onboarding');
    setIsSubmitting(true);
    
    try {
      // Salvar dados finais
      await forceSave();
      
      // Simular envio final
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Onboarding concluído!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('[WIZARD-CONTAINER] Erro ao finalizar:', error);
      toast({
        title: "Erro",
        description: "Houve um erro ao salvar suas informações.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [toast, forceSave]);

  // Context value usando useMemo para evitar re-renders desnecessários
  const contextValue: OnboardingWizardContextType = useMemo(() => ({
    currentStep,
    totalSteps,
    data,
    isLoading: storageLoading,
    isSubmitting,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    getFieldError,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
  }), [
    currentStep,
    totalSteps,
    data,
    storageLoading,
    isSubmitting,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    getFieldError,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
  ]);

  return children(contextValue);
};
