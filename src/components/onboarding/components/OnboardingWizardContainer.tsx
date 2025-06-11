
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
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
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  handleDataChange: (newData: Partial<OnboardingData>) => void;
  handleSubmit: () => Promise<void>;
  isCurrentStepValid: boolean;
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

  // Estados básicos
  const [data, setData] = useState<OnboardingData>({
    memberType: 'club',
    name: '',
    email: '',
    city: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estados para IA
  const [currentAIMessage, setCurrentAIMessage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { toast } = useToast();

  const {
    validationErrors,
    getFieldError,
    validateCurrentStep,
  } = useOnboardingValidation();

  // Função para validar etapa atual
  const validateStep = useCallback((step: number) => {
    console.log('[WIZARD-CONTAINER] Validando etapa:', step);
    const result = validateCurrentStep(step, data, data.memberType || 'club');
    console.log('[WIZARD-CONTAINER] Resultado da validação:', result);
    return result.isValid;
  }, [validateCurrentStep, data]);

  // Computed property para verificar se a etapa atual é válida
  const isCurrentStepValid = validateStep(currentStep);

  // Função para gerar mensagem de IA
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
    setData(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
    setLastSaved(new Date());
  };

  const handleSubmit = async () => {
    console.log('[WIZARD-CONTAINER] Finalizando onboarding');
    setIsSubmitting(true);
    
    try {
      // Simular envio
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
