import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSimpleOnboarding as useCleanOnboarding } from '@/hooks/useSimpleOnboarding';

// Import dos steps simplificados (versões corrigidas)
import { SimpleOnboardingStep1 } from './steps/SimpleOnboardingStep1';
import { SimpleOnboardingStep2UltraSimple as SimpleOnboardingStep2 } from './steps/SimpleOnboardingStep2UltraSimple';
import { SimpleOnboardingStep3Fixed as SimpleOnboardingStep3 } from './steps/SimpleOnboardingStep3Fixed';
import { SimpleOnboardingStep4 } from './steps/SimpleOnboardingStep4';
import { SimpleOnboardingStep5 } from './steps/SimpleOnboardingStep5';
import { SimpleOnboardingStep6 } from './steps/SimpleOnboardingStep6';

import { SimpleOnboardingProgress } from './SimpleOnboardingProgress';
import { SimpleStepNavigation } from './SimpleStepNavigation';

interface OnboardingData {
  user_id?: string;
  personal_info: any;
  location_info: any;
  discovery_info: any;
  business_info: any;
  business_context: any;
  goals_info: any;
  ai_experience: any;
  personalization: any;
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
}

const TOTAL_STEPS = 6;
const STEP_TITLES = [
  'Informações Pessoais',
  'Contexto Empresarial', 
  'Experiência com IA',
  'Objetivos',
  'Personalização',
  'Finalização'
];

export const SimpleOnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onboarding = useCleanOnboarding();
  
  const [currentStep, setCurrentStep] = useState(1);
  // Removido auto-save - salvamento apenas nos botões de navegação

  // TODAS AS FUNÇÕES DEVEM ESTAR ANTES DOS RETURNS CONDICIONAIS
  const renderCurrentStep = () => {
    const stepProps = {
      data: onboarding.data,
      onNext: handleNext,
      isLoading: onboarding.isSaving
    };

    switch (currentStep) {
      case 1:
        return <SimpleOnboardingStep1 {...stepProps} />;
      case 2:
        return <SimpleOnboardingStep2 {...stepProps} />;
      case 3:
        return <SimpleOnboardingStep3 {...stepProps} />;
      case 4:
        return <SimpleOnboardingStep4 {...stepProps} />;
      case 5:
        return <SimpleOnboardingStep5 {...stepProps} />;
      case 6:
        return <SimpleOnboardingStep6 {...stepProps} />;
      default:
        return <SimpleOnboardingStep1 {...stepProps} />;
    }
  };

  // Sincronizar step local com dados do hook
  useEffect(() => {
    if (onboarding.data.current_step) {
      setCurrentStep(onboarding.data.current_step);
    }
  }, [onboarding.data.current_step]);

  // Gerenciar reset via URL e inicialização com dados do convite
  useEffect(() => {
    if (user && !onboarding.isLoading) {
      const shouldReset = searchParams.get('reset') === 'true';
      const inviteToken = searchParams.get('invite');
      
      if (shouldReset) {
        resetOnboardingData();
      } else {
        // 🎯 CORREÇÃO: Simplificar inicialização
        // O hook useCleanOnboarding já cuida da inicialização automaticamente
        // Só precisamos aguardar o carregamento dos dados
         console.log('🔍 [ONBOARDING] Dados carregados:', {
           hasData: !!onboarding.data.id,
           currentStep: onboarding.data.current_step,
          inviteToken: inviteToken ? inviteToken.substring(0, 6) + '***' : 'none'
        });
      }
    }
  }, [user?.id, searchParams, onboarding.isLoading]);

  // Auto-save removido: agora apenas através do debounce em handleDataChange

  const resetOnboardingData = async () => {
    console.log('🔄 [ONBOARDING] Resetando dados do onboarding...');
    
    setCurrentStep(1);
    
    toast({
      title: "Onboarding resetado",
      description: "Vamos começar do zero! 🚀",
    });

    // Limpar parâmetro da URL após reset
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    
    // O reset real será implementado no hook quando necessário
  };

  // Função removida - dados são carregados automaticamente pelo hook

  // Função removida - salvamento é feito pelo hook

  const handleNext = async (stepData?: any) => {
    console.log('➡️ [ONBOARDING] === HANDLENEXT CHAMADO ===');
    console.log('➡️ [ONBOARDING] stepData recebido:', stepData);
    console.log('➡️ [ONBOARDING] currentStep:', currentStep);
    
     // Simplificado - sem verificação de canAccessStep
     // Permitir navegação livre entre steps
    
    if (!stepData || Object.keys(stepData).length === 0) {
      console.log('⚠️ [ONBOARDING] Nenhum dado para salvar, mas tentando avançar');
      
      // Para step 6 (finalização), sempre deve haver dados
      if (currentStep === 6) {
        console.error('❌ [ONBOARDING] Step 6 requer dados de finalização');
        return;
      }
      
      // Para outros steps, permitir avanço sem dados se necessário
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Usar o hook para salvar e navegar
    const targetStep = currentStep === 6 ? 7 : currentStep + 1; // Step 6 vai para 7 (completo)
    const success = await onboarding.saveAndNavigate(stepData, currentStep, targetStep);
    
    if (success) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // Se currentStep === 6, o saveAndNavigate já vai redirecionar para /dashboard
    }
    
    console.log('➡️ [ONBOARDING] === HANDLENEXT FINALIZADO ===');
  };

  const handlePrevious = async () => {
    if (currentStep > 1) {
      // Salvar dados automaticamente antes de navegar (opcional)
      console.log('⬅️ [ONBOARDING] Navegando para etapa anterior...');
      
      // Note: Não salvamos ao voltar para evitar sobrescrever dados
      // Os dados já devem estar salvos quando o usuário avançou
      
      setCurrentStep(currentStep - 1);
      // Scroll para o topo ao voltar para etapa anterior
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      console.log('⬅️ [ONBOARDING] Navegação para etapa anterior concluída');
    }
  };

  // Função removida - não mais necessária com o novo hook

  const handleNextFromNavigation = async () => {
    // Esta função é chamada pelos botões de navegação
    // Não faz nada porque cada step deve chamar onNext com seus próprios dados
    console.log('⚠️ [ONBOARDING] handleNextFromNavigation foi chamada - esta não deveria ser usada');
  };

  if (onboarding.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando seu onboarding...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <SimpleOnboardingProgress
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            stepTitles={STEP_TITLES}
          />
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border rounded-lg p-8">
          {renderCurrentStep()}
          
          {/* Navegação */}
          <div className="mt-8 pt-6 border-t">
            <SimpleStepNavigation
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onComplete={() => {}}
              canGoNext={true}
              canGoPrevious={currentStep > 1}
              isLoading={onboarding.isSaving}
            />
          </div>
        </div>
      </main>
    </div>
  );
};