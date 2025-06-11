
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useOnboardingData } from '../hooks/useOnboardingData';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
import { useOnboardingSubmission } from '../hooks/useOnboardingSubmission';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
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
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  handleDataChange: (newData: Partial<OnboardingData>) => void;
  handleSubmit: () => Promise<void>;
  isCurrentStepValid: boolean;
  // Simplificado: apenas uma mensagem e um estado de loading
  currentAIMessage: string | null;
  isGeneratingAI: boolean;
  generateAIMessage: () => Promise<void>;
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

  // Estados simplificados para IA
  const [currentAIMessage, setCurrentAIMessage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { toast } = useToast();

  const {
    data,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    syncStatus,
    updateData,
  } = useOnboardingData();

  const {
    validationErrors,
    getFieldError,
    validateStep,
    isCurrentStepValid,
  } = useOnboardingValidation(data, currentStep);

  const { isSubmitting, handleSubmit } = useOnboardingSubmission(data);

  // Função simplificada para gerar mensagem de IA
  const generateAIMessage = useCallback(async () => {
    console.log('[WIZARD-CONTAINER] Iniciando geração de mensagem IA');
    console.log('[WIZARD-CONTAINER] Dados atuais:', { name: data.name, city: data.city });
    
    setIsGeneratingAI(true);
    setCurrentAIMessage(null);

    try {
      const { data: result, error } = await supabase.functions.invoke('generate-onboarding-message', {
        body: {
          step: 2,
          userData: {
            name: data.name || '',
            city: data.city || '',
            memberType: data.memberType || 'club'
          }
        }
      });

      if (error) {
        console.error('[WIZARD-CONTAINER] Erro na API:', error);
        throw error;
      }

      console.log('[WIZARD-CONTAINER] Resposta da API:', result);

      if (result?.message) {
        console.log('[WIZARD-CONTAINER] Mensagem recebida:', result.message);
        setCurrentAIMessage(result.message);
      } else {
        console.warn('[WIZARD-CONTAINER] Sem mensagem na resposta, usando fallback');
        const fallbackMessage = `Olá${data.name ? ` ${data.name}` : ''}! Vamos continuar configurando seu perfil empresarial para personalizar ainda mais sua experiência na Viver de IA. 🚀`;
        setCurrentAIMessage(fallbackMessage);
      }

    } catch (error) {
      console.error('[WIZARD-CONTAINER] Erro ao gerar mensagem:', error);
      const fallbackMessage = `Olá${data.name ? ` ${data.name}` : ''}! Vamos continuar configurando seu perfil empresarial para personalizar ainda mais sua experiência na Viver de IA. 🚀`;
      setCurrentAIMessage(fallbackMessage);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [data.name, data.city, data.memberType]);

  // Gerar mensagem automaticamente quando entrar na etapa 2
  useEffect(() => {
    if (currentStep === 2 && !currentAIMessage && !isGeneratingAI) {
      console.log('[WIZARD-CONTAINER] Etapa 2 detectada, gerando mensagem automaticamente');
      generateAIMessage();
    }
  }, [currentStep, currentAIMessage, isGeneratingAI, generateAIMessage]);

  const handleNext = async () => {
    console.log('[WIZARD-CONTAINER] Tentando avançar para próxima etapa');
    
    if (!validateStep(currentStep)) {
      console.log('[WIZARD-CONTAINER] Validação falhou, não avançando');
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    const nextStep = currentStep + 1;
    console.log('[WIZARD-CONTAINER] Avançando para etapa:', nextStep);
    setCurrentStep(nextStep);

    // Limpar mensagem quando sair da etapa 2
    if (currentStep === 2) {
      console.log('[WIZARD-CONTAINER] Saindo da etapa 2, limpando mensagem');
      setCurrentAIMessage(null);
    }
  };

  const handlePrevious = () => {
    console.log('[WIZARD-CONTAINER] Voltando para etapa anterior');
    const prevStep = Math.max(1, currentStep - 1);
    setCurrentStep(prevStep);

    // Limpar mensagem quando sair da etapa 2
    if (currentStep === 2) {
      console.log('[WIZARD-CONTAINER] Saindo da etapa 2, limpando mensagem');
      setCurrentAIMessage(null);
    }
  };

  const handleDataChange = (newData: Partial<OnboardingData>) => {
    console.log('[WIZARD-CONTAINER] Dados alterados:', newData);
    updateData(newData);
  };

  const contextValue: OnboardingWizardContextType = {
    currentStep,
    totalSteps,
    data,
    isLoading,
    isSubmitting,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    getFieldError,
    syncStatus,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    currentAIMessage,
    isGeneratingAI,
    generateAIMessage,
  };

  return children(contextValue);
};
