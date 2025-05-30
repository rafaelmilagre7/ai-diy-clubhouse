
import React from 'react';
import { useSimpleOnboarding } from '@/hooks/onboarding/useSimpleOnboarding';
import { useNavigate } from 'react-router-dom';
import { StepQuemEVoceNew } from './steps/StepQuemEVoceNew';
import { StepLocalizacaoRedes } from './steps/StepLocalizacaoRedes';
import { StepComoNosConheceu } from './steps/StepComoNosConheceu';
import { StepSeuNegocioNew } from './steps/StepSeuNegocioNew';
import { StepExperienciaIANew } from './steps/StepExperienciaIANew';
import { EnhancedTrailMagicExperience } from '../EnhancedTrailMagicExperience';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const SimpleOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    currentStep,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    totalSteps,
    isSaving,
    isCompleting,
    isLoading
  } = useSimpleOnboarding();

  const handleFinish = async () => {
    console.log('🎯 Finalizando onboarding...');
    const success = await completeOnboarding();
    if (success) {
      console.log('✅ Onboarding concluído, redirecionando...');
      navigate('/onboarding-new/completed');
    }
  };

  const handleMagicFinish = () => {
    console.log('✨ Experiência mágica finalizada, redirecionando...');
    navigate('/onboarding-new/completed');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-viverblue animate-spin mx-auto mb-4" />
          <p className="text-white">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepQuemEVoceNew
            data={data}
            onUpdate={updateField}
            onNext={nextStep}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 2:
        return (
          <StepLocalizacaoRedes
            data={data}
            onUpdate={updateField}
            onNext={nextStep}
            onPrevious={previousStep}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 3:
        return (
          <StepComoNosConheceu
            data={data}
            onUpdate={updateField}
            onNext={nextStep}
            onPrevious={previousStep}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 4:
        return (
          <StepSeuNegocioNew
            data={data}
            onUpdate={updateField}
            onNext={nextStep}
            onPrevious={previousStep}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 7:
        return (
          <StepExperienciaIANew
            data={data}
            onUpdate={updateField}
            onNext={handleFinish}
            onPrevious={previousStep}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      
      case 9:
        return (
          <motion.div 
            className="animate-fade-in"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <EnhancedTrailMagicExperience onFinish={handleMagicFinish} />
          </motion.div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">Etapa não encontrada: {currentStep}</p>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Overlay de carregamento durante conclusão */}
      {(isCompleting || isSaving) && (
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
            <Loader2 className="h-8 w-8 text-viverblue animate-spin mx-auto" />
            <p className="text-white text-center font-medium">
              {isCompleting ? 'Finalizando onboarding...' : 'Salvando dados...'}
            </p>
            <p className="text-gray-400 text-center text-sm">
              {isCompleting ? 'Preparando sua experiência personalizada' : 'Aguarde um momento'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Conteúdo principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {renderCurrentStep()}
      </motion.div>
    </div>
  );
};
