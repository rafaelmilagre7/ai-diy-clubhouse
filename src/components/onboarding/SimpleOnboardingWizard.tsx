import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDirectOnboardingAdapter } from './hooks/useDirectOnboardingAdapter';

// Import dos steps simplificados
import { SimpleOnboardingStep1 } from './steps/SimpleOnboardingStep1';
import { SimpleOnboardingStep2 } from './steps/SimpleOnboardingStep2';
import { SimpleOnboardingStep3 } from './steps/SimpleOnboardingStep3';
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
  const adapter = useDirectOnboardingAdapter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personal_info: {},
    location_info: {},
    discovery_info: {},
    business_info: {},
    business_context: {},
    goals_info: {},
    ai_experience: {},
    personalization: {},
    current_step: 1,
    completed_steps: [],
    is_completed: false
  });
  // Removido auto-save - salvamento apenas nos botões de navegação

  // TODAS AS FUNÇÕES DEVEM ESTAR ANTES DOS RETURNS CONDICIONAIS
  const renderCurrentStep = () => {
    const stepProps = {
      data: onboardingData,
      onNext: handleNext,
      isLoading: adapter.isSaving
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

  // Carregar dados existentes do onboarding
  useEffect(() => {
    if (user) {
      const shouldReset = searchParams.get('reset') === 'true';
      if (shouldReset) {
        resetOnboardingData();
      } else {
        loadOnboardingData();
      }
    }
  }, [user?.id, searchParams]);

  // Auto-save removido: agora apenas através do debounce em handleDataChange

  const resetOnboardingData = async () => {
    console.log('🔄 [ONBOARDING] Resetando dados do onboarding...');
    
    // Inicializar com dados limpos
    setOnboardingData({
      personal_info: {},
      location_info: {},
      discovery_info: {},
      business_info: {},
      business_context: {},
      goals_info: {},
      ai_experience: {},
      personalization: {},
      current_step: 1,
      completed_steps: [],
      is_completed: false
    });
    setCurrentStep(1);
    
    toast({
      title: "Onboarding resetado",
      description: "Vamos começar do zero! 🚀",
    });

    // Limpar parâmetro da URL após reset
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  const loadOnboardingData = async () => {
    console.log('🔍 [ONBOARDING] Carregando dados existentes para usuário:', user!.id);
    
    const loadedData = await adapter.loadOnboardingData();
    
    if (loadedData) {
      console.log('✅ [ONBOARDING] Dados carregados:', loadedData);
      setOnboardingData(loadedData);
      setCurrentStep(loadedData.current_step || 1);
    } else {
      console.log('📭 [ONBOARDING] Nenhum dado encontrado, iniciando do zero');
      setOnboardingData({
        personal_info: {},
        location_info: {},
        discovery_info: {},
        business_info: {},
        business_context: {},
        goals_info: {},
        ai_experience: {},
        personalization: {},
        current_step: 1,
        completed_steps: [],
        is_completed: false
      });
    }
  };

  const saveOnboardingData = async (stepData: any, stepNumber: number) => {
    console.log('💾 [ONBOARDING] Iniciando salvamento via adapter...');
    
    const updatedData = { ...onboardingData };
    
    // Atualizar dados do step específico
    switch (stepNumber) {
      case 1:
        updatedData.personal_info = { ...updatedData.personal_info, ...stepData.personal_info };
        updatedData.location_info = { ...updatedData.location_info, ...stepData.location_info };
        break;
      case 2:
        updatedData.location_info = { ...updatedData.location_info, ...stepData };
        break;
      case 3:
        updatedData.ai_experience = { ...updatedData.ai_experience, ...stepData.ai_experience };
        break;
      case 4:
        updatedData.goals_info = { ...updatedData.goals_info, ...stepData.goals_info };
        break;
      case 5:
        updatedData.personalization = { ...updatedData.personalization, ...stepData.personalization };
        break;
      case 6:
        updatedData.personalization = { ...updatedData.personalization, ...stepData };
        break;
    }

    // Marcar step como completo
    const completedSteps = [...new Set([...updatedData.completed_steps, stepNumber])];
    updatedData.completed_steps = completedSteps;
    updatedData.current_step = Math.max(stepNumber + 1, updatedData.current_step);

    const success = await adapter.saveOnboardingData(updatedData);
    
    if (success) {
      setOnboardingData(updatedData);
    }
  };

  const handleNext = async (stepData?: any) => {
    console.log('➡️ [ONBOARDING] === HANDLENEXT CHAMADO ===');
    console.log('➡️ [ONBOARDING] stepData recebido:', JSON.stringify(stepData, null, 2));
    console.log('➡️ [ONBOARDING] currentStep:', currentStep);
    
    // Salvar dados fornecidos pelo step ou dados atuais
    const dataToSave = stepData || getCurrentStepData();
    console.log('➡️ [ONBOARDING] dataToSave preparado:', JSON.stringify(dataToSave, null, 2));
    
    if (dataToSave && Object.keys(dataToSave).length > 0) {
      console.log('➡️ [ONBOARDING] Chamando saveOnboardingData...');
      await saveOnboardingData(dataToSave, currentStep);
      console.log('➡️ [ONBOARDING] saveOnboardingData finalizada');
    } else {
      console.log('⚠️ [ONBOARDING] Nenhum dado para salvar');
    }
    
    if (currentStep < TOTAL_STEPS) {
      console.log('➡️ [ONBOARDING] Avançando para próxima etapa...');
      setCurrentStep(currentStep + 1);
      // Scroll para o topo ao avançar para próxima etapa
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log('➡️ [ONBOARDING] Completando onboarding...');
      const completedData = { ...onboardingData, is_completed: true };
      const success = await adapter.completeOnboarding(completedData);
      
      if (success) {
        toast({
          title: "Onboarding concluído! 🎉",
          description: "Bem-vindo(a) à nossa plataforma!",
        });
        navigate('/dashboard');
      }
    }
    
    console.log('➡️ [ONBOARDING] === HANDLENEXT FINALIZADO ===');
  };

  const handlePrevious = async () => {
    if (currentStep > 1) {
      // Salvar dados automaticamente antes de navegar
      console.log('⬅️ [ONBOARDING] Navegando para etapa anterior, salvando dados da etapa atual...');
      
      const currentStepData = getCurrentStepData();
      if (currentStepData && Object.keys(currentStepData).length > 0) {
        await saveOnboardingData(currentStepData, currentStep);
      }
      
      setCurrentStep(currentStep - 1);
      // Scroll para o topo ao voltar para etapa anterior
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getCurrentStepData = () => {
    // Retorna os dados da etapa atual baseado no step
    switch (currentStep) {
      case 1:
        return {
          personal_info: onboardingData.personal_info,
          location_info: onboardingData.location_info
        };
      case 2:
        return onboardingData.location_info;
      case 3:
        return onboardingData.ai_experience || onboardingData; // dados diretos do step 3
      case 4:
        return onboardingData.goals_info || onboardingData; // dados diretos do step 4
      case 5:
        return onboardingData.personalization || onboardingData; // dados diretos do step 5
      case 6:
        return onboardingData.personalization;
      default:
        return {};
    }
  };

  const handleNextFromNavigation = async () => {
    // Esta função é chamada pelos botões de navegação
    // Não faz nada porque cada step deve chamar onNext com seus próprios dados
    console.log('⚠️ [ONBOARDING] handleNextFromNavigation foi chamada - esta não deveria ser usada');
  };

  if (adapter.isLoading) {
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
          {currentStep > 1 && (
            <div className="mt-8 pt-6 border-t">
              <SimpleStepNavigation
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onComplete={() => {}}
                canGoNext={true}
                canGoPrevious={currentStep > 1}
                isLoading={adapter.isSaving}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};