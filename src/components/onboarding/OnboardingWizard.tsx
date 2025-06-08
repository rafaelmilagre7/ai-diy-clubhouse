
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth';
import { OnboardingStep1 } from './steps/OnboardingStep1';
import { OnboardingStep2 } from './steps/OnboardingStep2';
import { OnboardingStep3 } from './steps/OnboardingStep3';
import { OnboardingStep4 } from './steps/OnboardingStep4';
import { OnboardingStep5 } from './steps/OnboardingStep5';
import { OnboardingFinal } from './steps/OnboardingFinal';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingNavigation } from './OnboardingNavigation';
import { useOnboardingStorage } from './hooks/useOnboardingStorage';
import { OnboardingData } from './types/onboardingTypes';

export const OnboardingWizard = () => {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const { data, updateData, clearData } = useOnboardingStorage();

  // Detectar tipo de membro baseado no perfil
  const memberType = profile?.role === 'formacao' ? 'formacao' : 'club';
  const totalSteps = 6; // 5 etapas + tela final

  // Títulos das etapas baseados no tipo de membro
  const stepTitles = memberType === 'club' 
    ? [
        'Apresentação', 
        'Perfil Pessoal', 
        'Mercado e Negócio', 
        'Experiência com IA', 
        'Objetivos', 
        'Personalização'
      ]
    : [
        'Apresentação',
        'Perfil Educacional', 
        'Área de Atuação', 
        'Experiência com IA', 
        'Objetivos de Formação', 
        'Personalização'
      ];

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
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Por enquanto, apenas limpar dados temporários
    // Na Fase 3, aqui será onde enviaremos para o backend
    clearData();
    setIsCompleting(false);
    
    // Redirecionar para dashboard
    window.location.href = '/dashboard';
  };

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
