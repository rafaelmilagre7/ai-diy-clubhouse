
import React from 'react';
import { useQuickOnboardingOptimized } from '@/hooks/onboarding/useQuickOnboardingOptimized';
import { useNavigate } from 'react-router-dom';
import { LazyStepLoader } from './steps/LazyStepLoader';
import { EnhancedTrailMagicExperience } from '../EnhancedTrailMagicExperience';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const UnifiedOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed,
    isLoading,
    hasExistingData,
    loadError,
    totalSteps,
    isSaving,
    lastSaveTime,
    completeOnboarding
  } = useQuickOnboardingOptimized();

  const handleFinish = async () => {
    const success = await completeOnboarding();
    if (success) {
      console.log('Onboarding finalizado com dados:', data);
      navigate('/onboarding-new/completed');
    }
  };

  // Mostrar loading enquanto carrega dados existentes
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <Loader2 className="h-12 w-12 text-viverblue animate-spin mx-auto" />
            <div className="absolute inset-0 h-12 w-12 border-2 border-viverblue/20 rounded-full mx-auto animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Preparando sua experiência</h2>
            <p className="text-gray-300">Carregando seus dados...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mostrar erro se houver problema no carregamento
  if (loadError) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div 
          className="text-center py-12 space-y-4 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Oops! Algo deu errado</h3>
          <p className="text-red-400">{loadError}</p>
          <p className="text-gray-300 text-sm">Você pode continuar com dados em branco.</p>
        </motion.div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
      case 2:
      case 3:
        return (
          <LazyStepLoader
            step={currentStep}
            data={data}
            onUpdate={updateField}
            onNext={nextStep}
            onPrevious={previousStep}
            canProceed={canProceed}
            currentStep={currentStep}
            totalSteps={totalSteps}
            isSaving={isSaving}
            lastSaveTime={lastSaveTime}
          />
        );
      
      case 4:
        return (
          <motion.div 
            className="animate-fade-in"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <EnhancedTrailMagicExperience onFinish={handleFinish} />
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Indicador de dados carregados */}
      {hasExistingData && currentStep === 1 && (
        <motion.div 
          className="absolute top-0 right-0 z-10"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2 backdrop-blur-sm">
            <p className="text-green-400 text-sm flex items-center gap-2">
              ✅ Dados anteriores carregados
            </p>
          </div>
        </motion.div>
      )}

      {renderCurrentStep()}
    </div>
  );
};
