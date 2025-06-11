
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStorage } from '../hooks/useOnboardingStorage';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
import { useCloudSync } from '../hooks/useCloudSync';
import { useAdminPreview } from '@/hooks/useAdminPreview';
import { OnboardingData } from '../types/onboardingTypes';
import { supabase } from '@/lib/supabase';

interface OnboardingWizardContainerProps {
  children: (props: {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    isSubmitting: boolean;
    data: OnboardingData;
    updateData: (newData: Partial<OnboardingData>) => void;
    forceSave: () => Promise<void>;
    isLoading: boolean;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
    validationErrors: Array<{ field: string; message: string }>;
    getFieldError: (field: string) => string | undefined;
    syncStatus: {
      isSyncing: boolean;
      lastSyncTime: string | null;
      syncError: string | null;
    };
    handleNext: () => Promise<void>;
    handlePrevious: () => void;
    handleDataChange: (newData: Partial<OnboardingData>) => void;
    handleSubmit: () => Promise<void>;
    isCurrentStepValid: boolean;
    totalSteps: number;
    aiMessages: Map<number, string>;
    generateAIMessage: (step: number) => Promise<void>;
    isGeneratingAI: boolean;
  }) => React.ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
  const { user } = useAuth();
  const { isAdminPreviewMode } = useAdminPreview();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para mensagens de IA
  const [aiMessages, setAiMessages] = useState<Map<number, string>>(new Map());
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const { 
    data, 
    updateData, 
    forceSave,
    isLoading, 
    lastSaved,
    hasUnsavedChanges 
  } = useOnboardingStorage();
  
  const { 
    validateCurrentStep,
    validationErrors,
    getFieldError
  } = useOnboardingValidation();
  
  const { 
    saveToCloud,
    syncStatus
  } = useCloudSync();

  const totalSteps = 6;

  // Função para gerar mensagem de IA
  const generateAIMessage = useCallback(async (step: number) => {
    // Se já temos a mensagem em cache, não gerar novamente
    if (aiMessages.has(step)) {
      console.log(`[WizardContainer] Mensagem da etapa ${step} já existe no cache`);
      return;
    }

    // Para etapa 2, verificar se temos dados necessários
    if (step === 2 && !data.name) {
      console.log('[WizardContainer] Dados insuficientes para gerar mensagem da etapa 2');
      const fallbackMessage = 'Bem-vindo à Viver de IA! Estamos empolgados em ter você aqui na nossa comunidade. Agora vamos descobrir mais sobre seu perfil empresarial para personalizar sua experiência na plataforma. Vamos começar! 🚀';
      setAiMessages(prev => new Map(prev).set(step, fallbackMessage));
      return;
    }

    setIsGeneratingAI(true);
    
    try {
      console.log(`[WizardContainer] Gerando mensagem para etapa ${step}`, {
        hasName: !!data.name,
        hasCity: !!data.city,
        name: data.name,
        city: data.city
      });

      const { data: response, error } = await supabase.functions.invoke('generate-onboarding-message', {
        body: {
          onboardingData: data,
          memberType: data.memberType || 'club',
          currentStep: step
        }
      });

      console.log(`[WizardContainer] Resposta da API para etapa ${step}:`, { response, error });

      if (error) throw error;

      if (response?.success && response?.message) {
        console.log(`[WizardContainer] Mensagem gerada com sucesso para etapa ${step}:`, response.message);
        setAiMessages(prev => new Map(prev).set(step, response.message));
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.warn(`[WizardContainer] Erro ao gerar mensagem para etapa ${step}, usando fallback:`, error);
      
      // Fallback personalizado baseado na etapa
      let fallbackMessage = '';
      if (step === 2) {
        fallbackMessage = data.name 
          ? `Olá ${data.name}! Que bom ter você aqui na Viver de IA! ${data.city ? `Vi que você está em ${data.city}` : ''} e fico empolgado em ver mais um apaixonado por IA se juntando à nossa comunidade. ${data.curiosity ? `Adorei saber que ${data.curiosity.toLowerCase()}.` : ''} Agora vamos descobrir como podemos acelerar sua jornada empresarial com IA - vamos para seu perfil de negócios! 🚀`
          : 'Bem-vindo à Viver de IA! Estamos empolgados em ter você aqui na nossa comunidade. Agora vamos descobrir mais sobre seu perfil empresarial para personalizar sua experiência na plataforma. Vamos começar! 🚀';
      } else {
        fallbackMessage = `Parabéns ${data.name || 'Membro'}! Continue sua jornada na Viver de IA. 🚀`;
      }
      
      console.log(`[WizardContainer] Usando fallback para etapa ${step}:`, fallbackMessage);
      setAiMessages(prev => new Map(prev).set(step, fallbackMessage));
    } finally {
      setIsGeneratingAI(false);
    }
  }, [data.name, data.city, data.curiosity, data.memberType, aiMessages]);

  // Log detalhado dos dados quando mudarem
  console.log('[WizardContainer] Estado atual dos dados:', {
    currentStep,
    hasData: !!data,
    dataKeys: Object.keys(data || {}),
    name: data?.name,
    email: data?.email,
    phone: data?.phone,
    state: data?.state,
    city: data?.city,
    curiosity: data?.curiosity,
    isLoading,
    hasUnsavedChanges,
    aiMessagesCount: aiMessages.size
  });

  // Função para scroll suave para o topo
  const scrollToTop = useCallback(() => {
    try {
      // Scroll suave para o topo da página
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
      
      // Fallback para navegadores mais antigos
      if (window.scrollY > 0) {
        setTimeout(() => {
          if (window.scrollY > 50) {
            window.scrollTo(0, 0);
          }
        }, 300);
      }
      
      console.log('[OnboardingWizard] Scroll para o topo executado');
    } catch (error) {
      console.warn('[OnboardingWizard] Erro no scroll:', error);
      // Fallback simples
      window.scrollTo(0, 0);
    }
  }, []);

  // Memoizar apenas valores estáticos
  const memberType = useMemo(() => data.memberType || 'club', [data.memberType]);
  
  // Validação estabilizada
  const isCurrentStepValid = useMemo(() => {
    try {
      const validationResult = validateCurrentStep(currentStep, data, memberType);
      console.log('[WizardContainer] Resultado da validação:', {
        currentStep,
        isValid: validationResult.isValid,
        hasName: !!data?.name,
        hasEmail: !!data?.email,
        hasPhone: !!data?.phone,
        hasCity: !!data?.city,
        hasState: !!data?.state
      });
      return validationResult.isValid;
    } catch (error) {
      console.warn('Validation error:', error);
      return false;
    }
  }, [currentStep, data.name, data.email, data.phone, data.state, data.city, data.birthDate, data.curiosity, data.businessSector, data.position, data.hasImplementedAI, data.aiKnowledgeLevel, data.dailyTools, data.whoWillImplement, data.mainObjective, data.areaToImpact, data.expectedResult90Days, data.aiImplementationBudget, data.weeklyLearningTime, data.contentPreference, data.wantsNetworking, data.bestDays, data.bestPeriods, data.acceptsCaseStudy, memberType]);

  const handleNext = useCallback(async () => {
    if (currentStep < totalSteps && isCurrentStepValid) {
      try {
        console.log('[WizardContainer] Avançando da etapa', currentStep, 'para', currentStep + 1);
        
        // Salvar dados antes de avançar
        await forceSave();
        
        // Avançar etapa
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        // Gerar mensagem para a próxima etapa se necessário
        if (nextStep === 2) {
          setTimeout(() => {
            generateAIMessage(nextStep);
          }, 500); // Delay para garantir que os dados estão atualizados
        }
        
        // Scroll suave para o topo após um pequeno delay para permitir a renderização
        setTimeout(() => {
          scrollToTop();
        }, 100);
        
        console.log('[WizardContainer] Etapa avançada com sucesso para:', nextStep);
      } catch (error) {
        console.error('Erro ao avançar etapa:', error);
      }
    } else {
      console.warn('[WizardContainer] Não pode avançar:', {
        currentStep,
        totalSteps,
        isCurrentStepValid,
        missingData: {
          name: !data?.name,
          email: !data?.email,
          phone: !data?.phone,
          city: !data?.city,
          state: !data?.state
        }
      });
    }
  }, [currentStep, totalSteps, isCurrentStepValid, forceSave, scrollToTop, data, generateAIMessage]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      console.log('[WizardContainer] Voltando da etapa', currentStep, 'para', currentStep - 1);
      
      setCurrentStep(prev => prev - 1);
      
      // Scroll suave para o topo
      setTimeout(() => {
        scrollToTop();
      }, 100);
      
      console.log('[WizardContainer] Etapa anterior com sucesso');
    }
  }, [currentStep, scrollToTop]);

  const handleDataChange = useCallback((newData: Partial<OnboardingData>) => {
    console.log('[WizardContainer] Atualizando dados:', newData);
    updateData(newData);
  }, [updateData]);

  const handleSubmit = useCallback(async () => {
    if (isCurrentStepValid && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const finalData = {
          ...data,
          completedAt: new Date().toISOString()
        };
        
        updateData(finalData);
        await forceSave();
        await saveToCloud(finalData);
        
        // Scroll para o topo antes de redirecionar
        scrollToTop();
        
        setTimeout(() => {
          if (isAdminPreviewMode) {
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard';
          }
        }, 2000);
      } catch (error) {
        console.error('Erro ao finalizar onboarding:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [isCurrentStepValid, isSubmitting, data, isAdminPreviewMode, updateData, forceSave, saveToCloud, scrollToTop]);

  // Memoizar o objeto de props com dependências estáveis
  const childrenProps = useMemo(() => ({
    currentStep,
    setCurrentStep,
    isSubmitting,
    data,
    updateData,
    forceSave,
    isLoading,
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
    totalSteps,
    aiMessages,
    generateAIMessage,
    isGeneratingAI
  }), [
    currentStep,
    isSubmitting,
    data,
    isLoading,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    syncStatus,
    handleNext,
    handlePrevious,
    handleDataChange,
    handleSubmit,
    isCurrentStepValid,
    totalSteps,
    updateData,
    forceSave,
    getFieldError,
    aiMessages,
    generateAIMessage,
    isGeneratingAI
  ]);

  return children(childrenProps);
};
