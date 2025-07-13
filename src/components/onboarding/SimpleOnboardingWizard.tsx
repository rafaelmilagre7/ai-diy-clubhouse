import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  'Como nos encontrou',
  'Objetivos',
  'Experiência com IA',
  'Finalização'
];

export const SimpleOnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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
  }, [user, searchParams]);

  const resetOnboardingData = async () => {
    console.log('🔄 [ONBOARDING] Resetando dados do onboarding...');
    
    try {
      const { error } = await supabase
        .from('onboarding_final')
        .delete()
        .eq('user_id', user!.id);

      if (error) {
        console.error('❌ [ONBOARDING] Erro ao resetar:', error);
        // Não impedir o usuário de continuar mesmo se houve erro ao deletar
      }

      console.log('✅ [ONBOARDING] Dados resetados com sucesso');
      
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
      
    } catch (error) {
      console.error('❌ [ONBOARDING] Erro inesperado ao resetar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOnboardingData = async () => {
    console.log('🔍 [ONBOARDING] Carregando dados existentes para usuário:', user!.id);
    
    try {
      const { data, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      console.log('📥 [ONBOARDING] Resultado da consulta:', { data, error });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        console.log('✅ [ONBOARDING] Dados carregados:', data);
        setOnboardingData(data);
        setCurrentStep(data.current_step || 1);
      } else {
        console.log('📭 [ONBOARDING] Nenhum dado encontrado, iniciando do zero');
      }
    } catch (error) {
      console.error('❌ [ONBOARDING] Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar seus dados de onboarding.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 [ONBOARDING] Carregamento finalizado');
      setIsLoading(false);
    }
  };

  const saveOnboardingData = async (stepData: any, stepNumber: number) => {
    if (!user) return;
    
    console.log('🔄 [ONBOARDING] Iniciando salvamento:', {
      stepNumber,
      stepData,
      currentOnboardingData: onboardingData,
      userId: user.id
    });
    
    
    setIsSaving(true);
    try {
      const updatedData = { ...onboardingData };
      
      console.log('📝 [ONBOARDING] Dados antes da atualização:', updatedData);
      
      // Atualizar dados do step específico
      switch (stepNumber) {
        case 1:
          // Step 1: Informações pessoais + localização
          updatedData.personal_info = { ...updatedData.personal_info, ...stepData.personal_info };
          updatedData.location_info = { ...updatedData.location_info, ...stepData.location_info };
          break;
        case 2:
          // Step 2: Contexto empresarial
          updatedData.business_info = { ...updatedData.business_info, ...stepData };
          break;
        case 3:
          // Step 3: Como nos encontrou
          updatedData.discovery_info = { ...updatedData.discovery_info, ...stepData };
          break;
        case 4:
          // Step 4: Objetivos
          updatedData.goals_info = { ...updatedData.goals_info, ...stepData };
          break;
        case 5:
          // Step 5: Experiência com IA
          updatedData.ai_experience = { ...updatedData.ai_experience, ...stepData };
          break;
        case 6:
          // Step 6: Finalização
          updatedData.personalization = { ...updatedData.personalization, ...stepData };
          break;
      }

      // Marcar step como completo
      const completedSteps = [...new Set([...updatedData.completed_steps, stepNumber])];
      updatedData.completed_steps = completedSteps;
      updatedData.current_step = Math.max(stepNumber + 1, updatedData.current_step);

      console.log('💾 [ONBOARDING] Dados finais para salvar:', {
        user_id: user.id,
        ...updatedData
      });

      const finalData = {
        user_id: user.id,
        personal_info: updatedData.personal_info || {},
        location_info: updatedData.location_info || {},
        discovery_info: updatedData.discovery_info || {},
        business_info: updatedData.business_info || {},
        business_context: updatedData.business_context || {},
        goals_info: updatedData.goals_info || {},
        ai_experience: updatedData.ai_experience || {},
        personalization: updatedData.personalization || {},
        current_step: updatedData.current_step || 1,
        completed_steps: updatedData.completed_steps || [],
        is_completed: updatedData.is_completed || false
      };

      console.log('💾 [ONBOARDING] Dados finais formatados para upsert:', finalData);

      const { error } = await supabase
        .from('onboarding_final')
        .upsert(finalData);

      if (error) {
        console.error('❌ [ONBOARDING] Erro ao salvar no Supabase:', error);
        throw error;
      }

      console.log('✅ [ONBOARDING] Dados salvos com sucesso!');
      setOnboardingData(updatedData);

    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seu progresso. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async (stepData?: any) => {
    if (stepData) {
      await saveOnboardingData(stepData, currentStep);
    }
    
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      // Scroll para o topo ao avançar para próxima etapa
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await completeOnboarding();
    }
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
        return onboardingData.business_info;
      case 3:
        return onboardingData.discovery_info;
      case 4:
        return onboardingData.goals_info;
      case 5:
        return onboardingData.ai_experience;
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

  const completeOnboarding = async () => {
    if (!user) return;
    
    setIsCompleting(true);
    try {
      const { data, error } = await supabase.rpc('complete_onboarding', {
        p_user_id: user.id
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Onboarding concluído!",
          description: "Seu perfil foi configurado com sucesso.",
        });
        navigate('/dashboard');
      } else {
        throw new Error(data?.message || 'Erro desconhecido');
      }

    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível finalizar seu onboarding. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando seu onboarding...</p>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    const stepProps = {
      data: onboardingData,
      onNext: handleNext,
      isLoading: isSaving
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
                onNext={handleNextFromNavigation}
                onComplete={completeOnboarding}
                canGoNext={true}
                canGoPrevious={currentStep > 1}
                isLoading={isSaving || isCompleting}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};