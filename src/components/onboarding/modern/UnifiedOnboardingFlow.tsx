
import React from 'react';
import { useQuickOnboardingOptimized } from '@/hooks/onboarding/useQuickOnboardingOptimized';
import { useNavigate } from 'react-router-dom';
import { LazyStepLoader } from './steps/LazyStepLoader';
import { EnhancedTrailMagicExperience } from '../EnhancedTrailMagicExperience';
import { Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
    completeOnboarding,
    isCompleting
  } = useQuickOnboardingOptimized();

  const handleFinish = async () => {
    console.log('🎯 Finalizando onboarding e redirecionando...');
    const success = await completeOnboarding();
    if (success) {
      console.log('✅ Onboarding concluído, redirecionando para página de sucesso');
      navigate('/onboarding-new/completed');
    }
  };

  const handleMagicFinish = () => {
    console.log('✨ Experiência mágica finalizada, redirecionando...');
    navigate('/onboarding-new/completed');
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
            <p className="text-gray-300">
              {hasExistingData ? 'Carregando seus dados salvos...' : 'Inicializando onboarding...'}
            </p>
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
            <AlertTriangle className="text-red-400 h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">Oops! Algo deu errado</h3>
          <p className="text-red-400 text-sm">{loadError}</p>
          <p className="text-gray-300 text-xs">
            Você pode continuar, mas seus dados podem não ser salvos automaticamente.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="mt-4"
          >
            Tentar Novamente
          </Button>
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
            <EnhancedTrailMagicExperience onFinish={handleMagicFinish} />
          </motion.div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">Etapa não encontrada</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Ir para Dashboard
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Overlay de carregamento durante conclusão */}
      {isCompleting && (
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700">
            <Loader2 className="h-8 w-8 text-viverblue animate-spin mx-auto" />
            <p className="text-white text-center font-medium">Finalizando onboarding...</p>
            <p className="text-gray-400 text-center text-sm">Preparando sua experiência personalizada</p>
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
