
import { useState, useCallback } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboardingDataLoader } from './useQuickOnboardingDataLoader';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';

const initialData: QuickOnboardingData = {
  // Etapa 1: Informações Pessoais
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  instagram_url: '',
  linkedin_url: '',
  how_found_us: '',
  referred_by: '',

  // Etapa 2: Negócio
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  main_challenge: '',

  // Etapa 3: Experiência com IA
  ai_knowledge_level: '',
  uses_ai: '',
  main_goal: '',

  // Campos adicionais para compatibilidade
  desired_ai_areas: [],
  has_implemented: '',
  previous_tools: []
};

export const useQuickOnboardingOptimized = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { 
    data, 
    setData, 
    isLoading, 
    hasExistingData, 
    loadError 
  } = useQuickOnboardingDataLoader();

  // Adicionar auto-save
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setData]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        // Etapa 1: Validar apenas informações pessoais básicas
        return !!(data.name && data.email && data.how_found_us);
      case 2:
        // Etapa 2: Validar apenas informações do negócio
        return !!(data.company_name && data.role && data.company_size && data.main_challenge);
      case 3:
        // Etapa 3: Validar experiência com IA
        return !!(data.uses_ai && data.main_goal);
      default:
        return false;
    }
  }, [currentStep, data]);

  const nextStep = useCallback(() => {
    if (canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed]);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed: canProceed(),
    isLoading,
    hasExistingData,
    loadError,
    totalSteps: 4,
    // Adicionar estado de salvamento
    isSaving,
    lastSaveTime
  };
};
