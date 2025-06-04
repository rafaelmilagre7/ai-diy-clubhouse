
import React, { useState } from 'react';
import { useQuickOnboardingOptimized } from '@/hooks/onboarding/useQuickOnboardingOptimized';
import { useNavigate } from 'react-router-dom';
import { LazyStepLoader } from './steps/LazyStepLoader';
import { ModernFinalizationScreen } from './ModernFinalizationScreen';
import { ModernSuccessScreen } from './ModernSuccessScreen';
import { OnboardingReadOnlyView } from './OnboardingReadOnlyView';
import { Loader2, AlertTriangle } from 'lucide-react';
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
    retryCount,
    canFinalize
  } = useQuickOnboardingOptimized();

  const handleFinish = async () => {
    if (isCompleting) {
      console.log('⚠️ Finalização já em progresso, ignorando...');
      return;
    }

    // Validação prévia rigorosa
    if (!canFinalize()) {
      console.log('❌ Validação prévia falhou - não pode finalizar');
      toast.error('Complete todos os campos obrigatórios antes de finalizar', {
        duration: 3000
      });
      return;
    }
    
    setIsCompleting(true);
    console.log('🎯 Iniciando finalização do onboarding...');
    
    try {
      const loadingToast = toast.loading('Finalizando seu onboarding...', {
        duration: 0 // Não remove automaticamente
      });
      
      const success = await completeOnboarding();
      
      toast.dismiss(loadingToast);
      
      if (success) {
        console.log('✅ Onboarding finalizado com sucesso!');
        
        toast.success('Onboarding concluído com sucesso!', {
          duration: 2000
        });
        
        // Pequeno delay antes de mostrar tela de sucesso
        setTimeout(() => {
          setShowSuccessScreen(true);
          setIsCompleting(false);
        }, 1500);
      } else {
        console.error('❌ Falha na finalização do onboarding');
        const retryMessage = retryCount > 0 ? ` (${retryCount}/3 tentativas)` : '';
        toast.error(`Erro ao finalizar onboarding${retryMessage}. Verifique os dados e tente novamente.`, {
          duration: 5000
        });
        setIsCompleting(false);
      }
    } catch (error) {
      console.error('❌ Erro na finalização:', error);
      toast.error('Erro inesperado ao finalizar onboarding. Tente novamente.', {
        duration: 5000
      });
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
        <div className="flex items-center justify-center gap-2 text-red-400 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <p className="text-lg font-medium">Erro no Carregamento</p>
        </div>
        <p className="text-red-400">⚠️ {loadError}</p>
        <p className="text-gray-300">Você pode continuar com dados em branco.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-viverblue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // VERIFICAÇÃO PRINCIPAL: Se onboarding está realmente concluído no backend
  if (isCompleted && !showSuccessScreen) {
    console.log('📖 Onboarding completo - exibindo dados em modo somente leitura');
    return <OnboardingReadOnlyView data={data} />;
  }

  // Mostrar tela de sucesso apenas se foi explicitamente ativada após finalização
  if (showSuccessScreen) {
    console.log('🎉 Exibindo tela de sucesso');
    return <ModernSuccessScreen onNavigate={handleNavigateFromSuccess} />;
  }

  // Controle de navegação seguro - impedir acesso à etapa 4 sem completar as anteriores
  const canAccessStep4 = () => {
    const step1Valid = currentStep >= 1; // Sempre pode acessar step 1
    const step2Valid = currentStep >= 2; // Pode acessar step 2 se chegou lá
    const step3Valid = currentStep >= 3; // Pode acessar step 3 se chegou lá
    
    // Para acessar step 4, precisa ter completado as 3 primeiras etapas
    if (currentStep === 4) {
      return canFinalize();
    }
    
    return true;
  };

  // Se tentou acessar etapa 4 sem completar as anteriores, voltar para etapa apropriada
  if (currentStep === 4 && !canFinalize()) {
    console.log('⚠️ Tentativa de acessar etapa 4 sem completar anteriores - redirecionando');
    // Encontrar a primeira etapa incompleta
    if (!canProceed()) {
      setTimeout(() => setCurrentStep(1), 100);
    }
  }

  // Mostrar indicador se dados foram carregados mas onboarding não está concluído
  const showDataLoadedMessage = hasExistingData && currentStep === 1 && !isCompleted;

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
        // Só renderizar etapa 4 se realmente pode finalizar
        if (!canFinalize()) {
          return (
            <div className="text-center py-12 space-y-4">
              <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
                <AlertTriangle className="h-6 w-6" />
                <p className="text-lg font-medium">Etapas Anteriores Incompletas</p>
              </div>
              <p className="text-gray-300">
                Complete todas as etapas anteriores antes de finalizar o onboarding.
              </p>
              <button 
                onClick={() => setCurrentStep(1)}
                className="mt-4 px-6 py-2 bg-viverblue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Voltar para Etapas Anteriores
              </button>
            </div>
          );
        }

        return (
          <ModernFinalizationScreen
            isCompleting={isCompleting}
            retryCount={retryCount}
            onFinish={handleFinish}
            canFinalize={canFinalize()}
          />
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">Etapa não encontrada</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug info - apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-800 rounded">
          Debug: Step {currentStep}, canProceed: {canProceed().toString()}, canFinalize: {canFinalize().toString()}, isCompleted: {isCompleted.toString()}
        </div>
      )}
      
      {renderCurrentStep()}
    </div>
  );
};
