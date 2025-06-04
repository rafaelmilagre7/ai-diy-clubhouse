
import React, { useState } from 'react';
import { useQuickOnboardingOptimized } from '@/hooks/onboarding/useQuickOnboardingOptimized';
import { useNavigate } from 'react-router-dom';
import { LazyStepLoader } from './steps/LazyStepLoader';
import { EnhancedTrailMagicExperience } from '../EnhancedTrailMagicExperience';
import { ModernSuccessScreen } from './ModernSuccessScreen';
import { OnboardingReadOnlyView } from './OnboardingReadOnlyView';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const UnifiedOnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  
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
    isCompleted,
    retryCount
  } = useQuickOnboardingOptimized();

  const handleFinish = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    console.log('🎯 Iniciando finalização do onboarding...');
    
    try {
      const loadingToast = toast.loading('Finalizando seu onboarding...');
      
      const success = await completeOnboarding();
      
      toast.dismiss(loadingToast);
      
      if (success) {
        console.log('✅ Onboarding finalizado com sucesso!');
        
        toast.success('Onboarding concluído com sucesso!', {
          duration: 2000
        });
        
        setTimeout(() => {
          setShowSuccessScreen(true);
          setIsCompleting(false);
        }, 1500);
      } else {
        console.error('❌ Falha na finalização do onboarding');
        const retryMessage = retryCount > 0 ? ` (${retryCount} tentativas realizadas)` : '';
        toast.error(`Erro ao finalizar onboarding${retryMessage}. Tente novamente.`);
        setIsCompleting(false);
      }
    } catch (error) {
      console.error('❌ Erro na finalização:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      setIsCompleting(false);
    }
  };

  const handleNavigateFromSuccess = (path: string) => {
    console.log(`🚀 Navegando para: ${path}`);
    navigate(path);
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

  // Se onboarding já foi concluído, mostrar visualização somente leitura
  if (isCompleted && !showSuccessScreen) {
    return <OnboardingReadOnlyView data={data} />;
  }

  // Mostrar tela de sucesso se o onboarding foi concluído
  if (showSuccessScreen) {
    return <ModernSuccessScreen onNavigate={handleNavigateFromSuccess} />;
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
              canProceed={canProceed()}
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
                    <p className="text-blue-300 text-sm">Salvando seus dados e liberando acesso às funcionalidades</p>
                  </div>
                </div>
              </div>
            )}
            {retryCount > 0 && (
              <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Algumas tentativas falharam ({retryCount} tentativas). Tentando novamente...
                </p>
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
