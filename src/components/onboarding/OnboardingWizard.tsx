
import React, { useState, useCallback, useMemo } from 'react';
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
import { OnboardingFinal } from './steps/OnboardingFinal';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingNavigation } from './OnboardingNavigation';
import { OnboardingFeedback } from './components/OnboardingFeedback';
import { OnboardingData } from './types/onboardingTypes';
import { toast } from 'sonner';

export const OnboardingWizard = () => {
  console.log('[OnboardingWizard] Renderizando');
  
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { submitData, clearError, error } = useOnboardingStatus();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const { data, updateData, clearData } = useOnboardingStorage();
  const { validateCurrentStep, validationErrors, clearValidationErrors } = useOnboardingValidation();

  const memberType: 'club' | 'formacao' = useMemo(() => {
    const type = profile?.role === 'formacao' ? 'formacao' : 'club';
    console.log('[OnboardingWizard] Member type:', type);
    return type;
  }, [profile?.role]);
  
  const totalSteps = 6;

  const stepTitles = useMemo(() => [
    'Informações Pessoais',
    'Perfil Empresarial', 
    'Maturidade em IA',
    'Objetivos e Expectativas',
    'Personalização da Experiência',
    'Finalização'
  ], []);

  const handleNext = useCallback(() => {
    console.log('[OnboardingWizard] handleNext - step:', currentStep);
    
    clearError();
    clearValidationErrors();

    if (currentStep < 5) {
      const validation = validateCurrentStep(currentStep, data, memberType);
      
      if (!validation.isValid) {
        console.log('[OnboardingWizard] Validação falhou:', validation.errors);
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      if (currentStep < 5) {
        toast.success('Ótimo! Vamos para a próxima etapa 🎉');
      }
    }
  }, [currentStep, totalSteps, data, memberType, validateCurrentStep, clearValidationErrors, clearError]);

  const handlePrev = useCallback(() => {
    console.log('[OnboardingWizard] handlePrev - step:', currentStep);
    
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      clearError();
      clearValidationErrors();
    }
  }, [currentStep, clearValidationErrors, clearError]);

  const handleStepData = useCallback((stepData: Partial<OnboardingData>) => {
    console.log('[OnboardingWizard] Atualizando dados:', stepData);
    updateData(stepData);
    clearError();
    clearValidationErrors();
  }, [updateData, clearValidationErrors, clearError]);

  const handleComplete = useCallback(async () => {
    console.log('[OnboardingWizard] Iniciando finalização');
    setIsCompleting(true);
    
    try {
      // Validação final de todas as etapas
      for (let step = 1; step <= 5; step++) {
        const validation = validateCurrentStep(step, data, memberType);
        if (!validation.isValid) {
          console.log('[OnboardingWizard] Validação final falhou no step:', step);
          toast.error(`Dados incompletos na etapa ${step}. Por favor, revise.`);
          setCurrentStep(step);
          return;
        }
      }

      const completedData = {
        ...data,
        completedAt: new Date().toISOString(),
        memberType
      };

      console.log('[OnboardingWizard] Enviando dados finais:', completedData);
      await submitData(completedData);
      clearData();
      
      toast.success('Onboarding concluído com sucesso! 🎉');
      
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error('[OnboardingWizard] Erro ao finalizar:', error);
      toast.error('Erro ao finalizar onboarding');
    } finally {
      setIsCompleting(false);
    }
  }, [data, memberType, validateCurrentStep, submitData, clearData, navigate]);

  const canProceed = useMemo(() => {
    if (currentStep === totalSteps) return true;
    if (currentStep >= 5) return true;
    const validation = validateCurrentStep(currentStep, data, memberType);
    return validation.isValid;
  }, [currentStep, totalSteps, validateCurrentStep, data, memberType]);

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

    console.log('[OnboardingWizard] Renderizando step:', currentStep);

    switch (currentStep) {
      case 1: return <OnboardingStep1 {...stepProps} />;
      case 2: return <OnboardingStep2 {...stepProps} />;
      case 3: return <OnboardingStep3 {...stepProps} />;
      case 4: return <OnboardingStep4 {...stepProps} />;
      case 5: return <OnboardingStep5 {...stepProps} />;
      case 6: return (
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
          {error && (
            <OnboardingFeedback
              type="error"
              message={error}
              show={true}
              onClose={clearError}
            />
          )}

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
              canProceed={canProceed}
              isLoading={isCompleting}
            />
          </div>
        </div>
      )}
    </div>
  );
};
