
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';

export interface QuickOnboardingOptimized {
  // Etapa 1: Quem é você?
  name: string;
  email: string;
  whatsapp: string;
  howFoundUs: string;

  // Etapa 2: Seu Negócio
  companyName: string;
  role: string;
  companySize: string;
  business_challenges: string[]; // Atualizado para usar array

  // Etapa 3: Experiência com IA
  aiKnowledge: number;
  has_implemented: string; // Atualizado de uses_ai
  primary_goal: string; // Atualizado de main_goal
}

const initialData: QuickOnboardingOptimized = {
  name: '',
  email: '',
  whatsapp: '',
  howFoundUs: '',
  companyName: '',
  role: '',
  companySize: '',
  business_challenges: [], // Array vazio como padrão
  aiKnowledge: 3,
  has_implemented: '',
  primary_goal: ''
};

export const useQuickOnboardingOptimized = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingOptimized>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationCache, setValidationCache] = useState<Record<number, boolean>>({});

  const updateField = useCallback((field: keyof QuickOnboardingOptimized, value: string | number | string[]) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      // Invalidar cache de validação para o step atual
      setValidationCache(cache => ({ ...cache, [currentStep]: false }));
      return newData;
    });
  }, [currentStep]);

  const validateStep = useCallback((step: number): boolean => {
    // Usar cache se disponível
    if (validationCache[step] !== undefined) {
      return validationCache[step];
    }

    let isValid = false;
    switch (step) {
      case 1:
        isValid = !!(data.name && data.email && data.whatsapp && data.howFoundUs);
        break;
      case 2:
        isValid = !!(data.companyName && data.role && data.companySize && data.business_challenges.length > 0);
        break;
      case 3:
        isValid = !!(data.has_implemented && data.primary_goal);
        break;
      default:
        isValid = false;
    }

    // Atualizar cache
    setValidationCache(cache => ({ ...cache, [step]: isValid }));
    return isValid;
  }, [data, validationCache]);

  const canProceed = useMemo(() => validateStep(currentStep), [validateStep, currentStep]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
        if (currentStep < 3) {
          toast.success('Ótimo! Vamos continuar 🎉');
        }
      }
    } else {
      toast.error('Por favor, preencha todos os campos obrigatórios');
    }
  }, [currentStep, validateStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const addChallenge = useCallback((challenge: string) => {
    setData(prev => ({
      ...prev,
      business_challenges: [...prev.business_challenges, challenge]
    }));
  }, []);

  const removeChallenge = useCallback((index: number) => {
    setData(prev => ({
      ...prev,
      business_challenges: prev.business_challenges.filter((_, i) => i !== index)
    }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    try {
      console.log('Dados do onboarding:', data);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Onboarding concluído com sucesso! 🎉');
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [data]);

  const getStepValidationErrors = useCallback((step: number): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!data.name) errors.push('Nome é obrigatório');
        if (!data.email) errors.push('Email é obrigatório');
        if (!data.whatsapp) errors.push('WhatsApp é obrigatório');
        if (!data.howFoundUs) errors.push('Como nos conheceu é obrigatório');
        break;
      case 2:
        if (!data.companyName) errors.push('Nome da empresa é obrigatório');
        if (!data.role) errors.push('Seu cargo é obrigatório');
        if (!data.companySize) errors.push('Tamanho da empresa é obrigatório');
        if (data.business_challenges.length === 0) errors.push('Selecione pelo menos um desafio');
        break;
      case 3:
        if (!data.has_implemented) errors.push('Responda se já implementou IA');
        if (!data.primary_goal) errors.push('Selecione seu principal objetivo');
        break;
    }
    
    return errors;
  }, [data]);

  const getProgressPercentage = useMemo(() => {
    let completedFields = 0;
    let totalFields = 0;

    // Contar campos preenchidos por step
    const stepFields = {
      1: [data.name, data.email, data.whatsapp, data.howFoundUs],
      2: [data.companyName, data.role, data.companySize, ...(data.business_challenges.length > 0 ? ['challenges'] : [])],
      3: [data.has_implemented, data.primary_goal]
    };

    Object.values(stepFields).forEach(fields => {
      totalFields += fields.length;
      completedFields += fields.filter(field => field && field.toString().trim()).length;
    });

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }, [data]);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed,
    isSubmitting,
    completeOnboarding,
    validateStep,
    getStepValidationErrors,
    addChallenge,
    removeChallenge,
    getProgressPercentage,
    totalSteps: 4
  };
};
