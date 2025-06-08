
import { useState, useCallback, useEffect } from 'react';
import { OnboardingData, OnboardingStep, OnboardingState } from '@/types/onboarding';
import { calculateOverallScore } from '@/utils/onboardingValidation';

const ONBOARDING_STORAGE_KEY = 'viver_onboarding_data';
const AUTOSAVE_INTERVAL = 2000; // 2 segundos

export const useOnboardingState = () => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    data: {},
    isLoading: false,
    completed: false,
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setState(prev => ({
            ...prev,
            data: parsed.data || {},
            currentStep: parsed.currentStep || 1,
            completed: parsed.completed || false,
          }));
          setLastSaved(new Date(parsed.lastSaved || Date.now()));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do onboarding:', error);
        // Limpar dados corrompidos
        localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
    };

    loadSavedData();
  }, []);

  // Auto-save com debounce
  const saveToStorage = useCallback((currentState: OnboardingState) => {
    try {
      const dataToSave = {
        ...currentState,
        lastSaved: new Date().toISOString(),
        score: calculateOverallScore(currentState.data)
      };
      
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(new Date());
      
      console.log('Onboarding data auto-saved', { 
        step: currentState.currentStep, 
        score: dataToSave.score 
      });
    } catch (error) {
      console.error('Erro ao salvar dados do onboarding:', error);
    }
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      saveToStorage(state);
    }, AUTOSAVE_INTERVAL);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state, saveToStorage]);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setState(prev => {
      const updatedData = { ...prev.data, ...newData };
      return {
        ...prev,
        data: updatedData,
      };
    });
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
    setState(prev => {
      const completedState = {
        ...prev,
        completed: true,
      };
      
      // Salvar imediatamente quando completa
      saveToStorage(completedState);
      
      // Marcar como completado globalmente
      localStorage.setItem('viver_onboarding_completed', 'true');
      
      return completedState;
    });
  }, [saveToStorage]);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem('viver_onboarding_completed');
    setLastSaved(null);
    setState({
      currentStep: 1,
      data: {},
      isLoading: false,
      completed: false,
    });
  }, []);

  // Função para forçar salvamento
  const forceSave = useCallback(() => {
    saveToStorage(state);
  }, [state, saveToStorage]);

  return {
    ...state,
    updateData,
    nextStep,
    previousStep,
    goToStep,
    setLoading,
    completeOnboarding,
    resetOnboarding,
    forceSave,
    lastSaved,
    overallScore: calculateOverallScore(state.data),
  };
};
