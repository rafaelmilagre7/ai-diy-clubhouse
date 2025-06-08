
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth';
import { OnboardingStep1 } from './steps/OnboardingStep1';
import { OnboardingStep2 } from './steps/OnboardingStep2';
import { OnboardingStep3 } from './steps/OnboardingStep3';
import { OnboardingStep4 } from './steps/OnboardingStep4';
import { OnboardingStep5 } from './steps/OnboardingStep5';
import { OnboardingStep6 } from './steps/OnboardingStep6';
import { OnboardingFinal } from './steps/OnboardingFinal';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingNavigation } from './OnboardingNavigation';
import { useOnboardingStorage } from './hooks/useOnboardingStorage';
import { useOnboardingSubmit } from './hooks/useOnboardingSubmit';
import { OnboardingData } from './types/onboardingTypes';
import { toast } from 'sonner';

export const OnboardingWizard = () => {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const { data, updateData, clearData } = useOnboardingStorage();
  const { checkOnboardingStatus } = useOnboardingSubmit();

  // Detectar tipo de membro baseado no perfil com tipo explícito
  const memberType: 'club' | 'formacao' = profile?.role === 'formacao' ? 'formacao' : 'club';
  const totalSteps = 7; // 6 etapas + tela final

  // Títulos das etapas baseados no tipo de membro
  const stepTitles = memberType === 'club' 
    ? [
        'Apresentação', 
        'Perfil Pessoal', 
        'Mercado e Negócio', 
        'Experiência com IA', 
        'Objetivos', 
        'Personalização',
        'Finalização'
      ]
    : [
        'Apresentação',
        'Perfil Educacional', 
        'Área de Atuação', 
        'Experiência com IA', 
        'Objetivos de Formação', 
        'Personalização',
        'Finalização'
      ];

  // Verificar se onboarding já foi completado
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      
      try {
        const onboardingData = await checkOnboardingStatus();
        if (onboardingData) {
          // Onboarding já foi completado, redirecionar
          toast.info('Onboarding já foi completado! Redirecionando...');
          setTimeout(() => {
            window.location.href = memberType === 'formacao' ? '/formacao' : '/dashboard';
          }, 1000);
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar status do onboarding:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [user, memberType, checkOnboardingStatus]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepData = (stepData: Partial<OnboardingData>) => {
    updateData(stepData);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      // Simular um pequeno delay para UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Limpar dados temporários do localStorage
      clearData();
      
      // Redirecionar baseado no tipo de membro
      const redirectUrl = memberType === 'formacao' ? '/formacao' : '/dashboard';
      window.location.href = redirectUrl;
      
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Mostrar loading enquanto verifica status
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando seu progresso...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const stepProps = {
      data,
      onUpdateData: handleStepData,
      onNext: handleNext,
      onPrev: handlePrev,
      memberType,
      userProfile: profile
    };

    switch (currentStep) {
      case 1:
        return <OnboardingStep1 {...stepProps} />;
      case 2:
        return <OnboardingStep2 {...stepProps} />;
      case 3:
        return <OnboardingStep3 {...stepProps} />;
      case 4:
        return <OnboardingStep4 {...stepProps} />;
      case 5:
        return <OnboardingStep5 {...stepProps} />;
      case 6:
        return <OnboardingStep6 {...stepProps} />;
      case 7:
        return (
          <OnboardingFinal 
            data={data} 
            onComplete={handleComplete}
            isCompleting={isCompleting}
            memberType={memberType}
          />
        );
      default:
        return <OnboardingStep1 {...stepProps} />;
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

      {/* Navegação (apenas se não estiver na tela final) */}
      {currentStep < totalSteps && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <OnboardingNavigation
              currentStep={currentStep}
              totalSteps={totalSteps - 1} // Excluir tela final da contagem
              onNext={handleNext}
              onPrev={handlePrev}
              canProceed={true} // Por enquanto sempre true, depois validaremos
            />
          </div>
        </div>
      )}
    </div>
  );
};
