
import { useState, useCallback, useEffect } from 'react';
import { OnboardingData, OnboardingStep, OnboardingState } from '@/types/onboarding';
import { ONBOARDING_STORAGE_KEY } from '@/constants/onboarding';

export const useOnboardingState = () => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    data: {},
    isLoading: false,
    completed: false,
  });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setState(prev => ({
          ...prev,
          data: parsed.data || {},
          currentStep: parsed.currentStep || 1,
          completed: parsed.completed || false,
        }));
      } catch (error) {
        console.error('Erro ao carregar dados do onboarding:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que o estado mudar
  useEffect(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...newData },
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5) as OnboardingStep,
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1) as OnboardingStep,
    }));
  }, []);

  const goToStep = useCallback((step: OnboardingStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      completed: true,
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setState({
      currentStep: 1,
      data: {},
      isLoading: false,
      completed: false,
    });
  }, []);

  return {
    ...state,
    updateData,
    nextStep,
    previousStep,
    goToStep,
    setLoading,
    completeOnboarding,
    resetOnboarding,
  };
};
