
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStorage } from '../hooks/useOnboardingStorage';
import { useOnboardingValidation } from '../hooks/useOnboardingValidation';
import { useCloudSync } from '../hooks/useCloudSync';
import { useAdminPreview } from '@/hooks/useAdminPreview';
import { OnboardingData } from '../types/onboardingTypes';

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
  }) => React.ReactNode;
}

export const OnboardingWizardContainer: React.FC<OnboardingWizardContainerProps> = ({ children }) => {
  const { user } = useAuth();
  const { isAdminPreviewMode } = useAdminPreview();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    hasUnsavedChanges
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
        console.log('[WizardContainer] Dados antes de salvar:', {
          name: data?.name,
          city: data?.city,
          state: data?.state,
          phone: data?.phone,
          email: data?.email
        });
        
        // Salvar dados antes de avançar
        await forceSave();
        
        // Avançar etapa
        setCurrentStep(prev => prev + 1);
        
        // Log após mudança de etapa
        console.log('[WizardContainer] Etapa avançada para:', currentStep + 1);
        
        // Scroll suave para o topo após um pequeno delay para permitir a renderização
        setTimeout(() => {
          scrollToTop();
        }, 100);
        
        console.log('[WizardContainer] Etapa avançada com sucesso');
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
  }, [currentStep, totalSteps, isCurrentStepValid, forceSave, scrollToTop, data]);

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
    totalSteps
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
    getFieldError
  ]);

  return children(childrenProps);
};
