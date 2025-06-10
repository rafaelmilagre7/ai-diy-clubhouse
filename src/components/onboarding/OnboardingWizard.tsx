
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { OnboardingFeedback } from './components/OnboardingFeedback';
import { OnboardingSaveIndicator } from './components/OnboardingSaveIndicator';
import { OnboardingRecoveryDialog } from './components/OnboardingRecoveryDialog';
import { OnboardingData } from './types/onboardingTypes';
import { toast } from 'sonner';

export const OnboardingWizard = () => {
  console.log('[OnboardingWizard] Renderizando');
  
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { submitData, clearError, error } = useOnboardingStatus();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  
  const { 
    data, 
    updateData, 
    forceSave, 
    clearData, 
    recoverData,
    hasUnsavedChanges,
    lastSaved,
    syncStatus 
  } = useOnboardingStorage();
  
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

  // Verificar se há dados para recuperar na inicialização
  useEffect(() => {
    const hasDataToRecover = localStorage.getItem('viver-ia-onboarding-data');
    if (hasDataToRecover && !data.completedAt) {
      try {
        const parsedData = JSON.parse(hasDataToRecover);
        if (Object.keys(parsedData).length > 0 && !parsedData.completedAt) {
          setShowRecoveryDialog(true);
        }
      } catch (error) {
        console.error('[OnboardingWizard] Erro ao verificar dados de recuperação:', error);
      }
    }
  }, []);

  // Auto-save forçado antes de mudanças críticas
  const handleCriticalSave = async () => {
    if (hasUnsavedChanges) {
      try {
        await forceSave();
        console.log('[OnboardingWizard] Salvamento crítico realizado');
      } catch (error) {
        console.error('[OnboardingWizard] Erro no salvamento crítico:', error);
        toast.error('Erro ao salvar dados. Por favor, tente novamente.');
        return false;
      }
    }
    return true;
  };

  const handleNext = useCallback(async () => {
    console.log('[OnboardingWizard] handleNext - step:', currentStep, 'dados atuais:', data);
    
    clearError();
    clearValidationErrors();

    if (currentStep < 5) {
      // Validar usando os dados atuais do storage
      const validation = validateCurrentStep(currentStep, data, memberType);
      
      if (!validation.isValid) {
        console.log('[OnboardingWizard] Validação falhou:', validation.errors);
        const errorFields = validation.errors.map(e => e.field).join(', ');
        toast.error(`Por favor, preencha os campos obrigatórios: ${errorFields}`);
        return;
      }
    }

    // Salvar antes de prosseguir
    const saveSuccess = await handleCriticalSave();
    if (!saveSuccess) return;

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      if (currentStep < 5) {
        toast.success('Ótimo! Vamos para a próxima etapa 🎉');
      }
    }
  }, [currentStep, totalSteps, data, memberType, validateCurrentStep, clearValidationErrors, clearError, handleCriticalSave]);

  const handlePrev = useCallback(async () => {
    console.log('[OnboardingWizard] handlePrev - step:', currentStep);
    
    // Salvar antes de voltar
    await handleCriticalSave();
    
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      clearError();
      clearValidationErrors();
    }
  }, [currentStep, clearValidationErrors, clearError, handleCriticalSave]);

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
      // Salvamento final forçado
      const saveSuccess = await handleCriticalSave();
      if (!saveSuccess) {
        setIsCompleting(false);
        return;
      }

      // Validação final de todas as etapas
      for (let step = 1; step <= 5; step++) {
        const validation = validateCurrentStep(step, data, memberType);
        if (!validation.isValid) {
          console.log('[OnboardingWizard] Validação final falhou no step:', step);
          toast.error(`Dados incompletos na etapa ${step}. Por favor, revise.`);
          setCurrentStep(step);
          setIsCompleting(false);
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
  }, [data, memberType, validateCurrentStep, submitData, clearData, navigate, handleCriticalSave]);

  const handleRecoverData = () => {
    const recovered = recoverData();
    if (recovered) {
      toast.success('Dados recuperados com sucesso!');
      setShowRecoveryDialog(false);
    } else {
      toast.error('Não foi possível recuperar os dados');
      setShowRecoveryDialog(false);
    }
  };

  const handleStartOver = () => {
    clearData();
    toast.info('Iniciando onboarding do zero');
    setShowRecoveryDialog(false);
  };

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
    <div className="min-h-screen bg-[#0F111A]">
      {/* Header com progresso */}
      <div className="sticky top-0 z-40 bg-[#0F111A]/90 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-2">
          <OnboardingProgress 
            currentStep={currentStep} 
            totalSteps={totalSteps}
            stepTitles={stepTitles}
          />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex items-start justify-center p-6 py-4">
        <div className="w-full max-w-5xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <OnboardingFeedback
                type="error"
                message={error}
                show={true}
                onClose={clearError}
              />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[600px]"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Indicador de salvamento */}
      <OnboardingSaveIndicator
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
        syncStatus={syncStatus}
      />

      {/* Dialog de recuperação */}
      <OnboardingRecoveryDialog
        open={showRecoveryDialog}
        onOpenChange={setShowRecoveryDialog}
        onRecover={handleRecoverData}
        onStartOver={handleStartOver}
      />
    </div>
  );
};
