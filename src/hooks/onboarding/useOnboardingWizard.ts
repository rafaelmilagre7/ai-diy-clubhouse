
import { useState, useCallback, useEffect } from 'react';
import { OnboardingState, OnboardingStepData, OnboardingStepType } from '@/types/onboardingTypes';

/**
 * Hook principal para gerenciar o estado do wizard de onboarding
 * FASE 3: Controle de navegação e validação dos steps
 */
export const useOnboardingWizard = () => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    totalSteps: 5,
    isCompleted: false,
    data: {},
    isLoading: false,
    errors: {}
  });

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('onboarding_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setState(prev => ({ ...prev, data: parsedData }));
      } catch (error) {
        console.log('🔧 Dados do onboarding corrompidos, iniciando limpo');
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que mudarem
  const saveDataLocally = useCallback((data: OnboardingStepData) => {
    localStorage.setItem('onboarding_data', JSON.stringify(data));
  }, []);

  // Navegar para próximo step
  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
      errors: {}
    }));
  }, []);

  // Navegar para step anterior
  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
      errors: {}
    }));
  }, []);

  // Ir para step específico
  const goToStep = useCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(stepIndex, prev.totalSteps - 1)),
      errors: {}
    }));
  }, []);

  // Atualizar dados de um step específico
  const updateStepData = useCallback((stepType: OnboardingStepType, stepData: any) => {
    setState(prev => {
      const newData = {
        ...prev.data,
        [stepType]: stepData
      };
      saveDataLocally(newData);
      return {
        ...prev,
        data: newData
      };
    });
  }, [saveDataLocally]);

  // Validar step atual
  const validateCurrentStep = useCallback(() => {
    // Por enquanto, validação básica - pode ser expandida
    setState(prev => ({ ...prev, errors: {} }));
    return true;
  }, []);

  // Marcar como concluído
  const completeOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, isCompleted: true }));
    localStorage.removeItem('onboarding_data'); // Limpar dados temporários
  }, []);

  // Resetar wizard
  const resetWizard = useCallback(() => {
    setState({
      currentStep: 0,
      totalSteps: 5,
      isCompleted: false,
      data: {},
      isLoading: false,
      errors: {}
    });
    localStorage.removeItem('onboarding_data');
  }, []);

  // Pular onboarding
  const skipOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, isCompleted: true }));
    localStorage.removeItem('onboarding_data');
  }, []);

  return {
    ...state,
    nextStep,
    previousStep,
    goToStep,
    updateStepData,
    validateCurrentStep,
    completeOnboarding,
    resetWizard,
    skipOnboarding,
    canGoNext: state.currentStep < state.totalSteps - 1,
    canGoPrevious: state.currentStep > 0,
    progressPercentage: ((state.currentStep + 1) / state.totalSteps) * 100
  };
};
