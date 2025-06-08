
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStatus } from './hooks/useOnboardingStatus';
import { useOnboardingStorage } from './hooks/useOnboardingStorage';
import { useOnboardingValidation } from './hooks/useOnboardingValidation';
import { OnboardingStep1 } from './steps/OnboardingStep1';
import { OnboardingStep2 } from './steps/OnboardingStep2';
import { OnboardingStep3 } from './steps/OnboardingStep3';
import { OnboardingStep4 } from './steps/OnboardingStep4';
import { OnboardingStep5 } from './steps/OnboardingStep5';
import { OnboardingStep6 } from './steps/OnboardingStep6';
import { OnboardingFinal } from './steps/OnboardingFinal';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingNavigation } from './OnboardingNavigation';
import { OnboardingFeedback } from './components/OnboardingFeedback';
import { OnboardingData } from './types/onboardingTypes';
import { toast } from 'sonner';

export const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isRequired, isLoading, error, submitData, clearError } = useOnboardingStatus();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const { data, updateData, clearData } = useOnboardingStorage();
  const { validateCurrentStep, validationErrors, clearValidationErrors } = useOnboardingValidation();

  // Detectar tipo de membro baseado no perfil
  const memberType: 'club' | 'formacao' = profile?.role === 'formacao' ? 'formacao' : 'club';
  const totalSteps = 7;

  const stepTitles = memberType === 'club' 
    ? ['Apresentação', 'Perfil Pessoal', 'Mercado e Negócio', 'Experiência com IA', 'Objetivos', 'Personalização', 'Finalização']
    : ['Apresentação', 'Perfil Educacional', 'Área de Atuação', 'Experiência com IA', 'Objetivos de Formação', 'Personalização', 'Finalização'];

  const handleNext = useCallback(() => {
    clearError();
    clearValidationErrors();

    const validation = validateCurrentStep(currentStep, data, memberType);
    
    if (!validation.isValid) {
      toast.error('Por favor, corrija os erros antes de continuar');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      if (currentStep < 6) {
        toast.success('Ótimo! Vamos para a próxima etapa 🎉');
      }
    }
  }, [currentStep, totalSteps, data, memberType, validateCurrentStep, clearValidationErrors, clearError]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      clearError();
      clearValidationErrors();
    }
  }, [currentStep, clearValidationErrors, clearError]);

  const handleStepData = useCallback((stepData: Partial<OnboardingData>) => {
    updateData(stepData);
    clearError();
    clearValidationErrors();
  }, [updateData, clearValidationErrors, clearError]);

  const handleComplete = useCallback(async () => {
    setIsCompleting(true);
    
    try {
      // Validação final
      let allValid = true;
      for (let step = 1; step <= 6; step++) {
        const validation = validateCurrentStep(step, data, memberType);
        if (!validation.isValid) {
          allValid = false;
          break;
        }
      }

      if (!allValid) {
        throw new Error('Dados incompletos. Por favor, revise todas as etapas.');
      }

      const completedData = {
        ...data,
        completedAt: new Date().toISOString(),
        memberType
      };

      await submitData(completedData);
      clearData();
      
      toast.success('Onboarding concluído com sucesso! 🎉');
      
      // Usar React Router para navegação
      const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error('[OnboardingWizard] Erro ao finalizar:', error);
      toast.error('Erro ao finalizar onboarding');
    } finally {
      setIsCompleting(false);
    }
  }, [data, memberType, validateCurrentStep, submitData, clearData, navigate]);

  // Loading enquanto verifica status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando seu progresso...</p>
        </div>
      </div>
    );
  }

  // Se onboarding não for necessário, redirecionar
  if (isRequired === false) {
    const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
    navigate(redirectPath, { replace: true });
    return null;
  }

  // Renderizar steps
  const renderStep = () => {
    const stepProps = {
      data,
      onUpdateData: handleStepData,
      onNext: handleNext,
      onPrev: handlePrev,
      memberType,
      userProfile: profile,
      validationErrors,
      getFieldError: (field: string) => validationErrors.find(e => e.field === field)?.message
    };

    switch (currentStep) {
      case 1: return <OnboardingStep1 {...stepProps} />;
      case 2: return <OnboardingStep2 {...stepProps} />;
      case 3: return <OnboardingStep3 {...stepProps} />;
      case 4: return <OnboardingStep4 {...stepProps} />;
      case 5: return <OnboardingStep5 {...stepProps} />;
      case 6: return <OnboardingStep6 {...stepProps} />;
      case 7: return (
        <OnboardingFinal 
          data={data} 
          onComplete={handleComplete}
          isCompleting={isCompleting}
          memberType={memberType}
        />
      );
      default: return <OnboardingStep1 {...stepProps} />;
    }
  };

  const canProceed = () => {
    if (currentStep === totalSteps) return true;
    const validation = validateCurrentStep(currentStep, data, memberType);
    return validation.isValid;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header com progresso */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <OnboardingProgress 
            currentStep={currentStep} 
            totalSteps={totalSteps}
            stepTitles={stepTitles}
          />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <OnboardingFeedback
            type="error"
            message={error || 'Erro no onboarding'}
            show={!!error}
            onClose={clearError}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navegação */}
      {currentStep < totalSteps && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <OnboardingNavigation
              currentStep={currentStep}
              totalSteps={totalSteps - 1}
              onNext={handleNext}
              onPrev={handlePrev}
              canProceed={canProceed()}
              isLoading={isCompleting}
            />
          </div>
        </div>
      )}
    </div>
  );
};
