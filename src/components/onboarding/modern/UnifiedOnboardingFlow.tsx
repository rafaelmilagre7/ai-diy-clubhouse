import React, { useState } from 'react';
import { useQuickOnboardingOptimized } from '@/hooks/onboarding/useQuickOnboardingOptimized';
import { useNavigate } from 'react-router-dom';
import { LazyStepLoader } from './steps/LazyStepLoader';
import { EnhancedTrailMagicExperience } from '../EnhancedTrailMagicExperience';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const UnifiedOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  
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
    if (isCompleting) return; // Evitar múltiplos cliques
    
    setIsCompleting(true);
    console.log('🎯 Iniciando finalização do onboarding...');
    
    try {
      // Mostrar loading toast
      const loadingToast = toast.loading('Finalizando seu onboarding...');
      
      const success = await completeOnboarding();
      
      // Remover loading toast
      toast.dismiss(loadingToast);
      
      if (success) {
        console.log('✅ Onboarding finalizado com sucesso!', data);
        
        // Aguardar um momento para garantir que a operação foi concluída
        setTimeout(() => {
          navigate('/onboarding-new/completed');
        }, 1000);
      } else {
        setIsCompleting(false);
      }
    } catch (error) {
      console.error('❌ Erro na finalização:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      setIsCompleting(false);
    }
  };

  // Mostrar loading enquanto carrega dados existentes
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 text-viverblue animate-spin" />
        <p className="text-gray-300">Carregando seus dados...</p>
      </div>
    );
  }

  // Mostrar erro se houver problema no carregamento
  if (loadError) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-400">⚠️ {loadError}</p>
        <p className="text-gray-300">Você pode continuar com dados em branco.</p>
      </div>
    );
  }

  // Mostrar indicador se dados foram carregados
  const showDataLoadedMessage = hasExistingData && currentStep === 1;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
      case 2:
      case 3:
        return (
          <div className="space-y-4">
            {showDataLoadedMessage && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  ✅ Dados anteriores carregados com sucesso! Você pode revisar e continuar.
                </p>
              </div>
            )}
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
          </div>
        );
      
      case 4:
        return (
          <div className="animate-fade-in">
            {isCompleting && (
              <div className="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                  <div>
                    <p className="text-blue-400 font-medium">Finalizando seu onboarding...</p>
                    <p className="text-blue-300 text-sm">Salvando seus dados e criando sua trilha personalizada</p>
                  </div>
                </div>
              </div>
            )}
            <EnhancedTrailMagicExperience 
              onFinish={handleFinish}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderCurrentStep()}
    </div>
  );
};
