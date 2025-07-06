import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  'Localização',
  'Como nos encontrou',
  'Contexto Empresarial',
  'Objetivos',
  'Finalização'
];

export const SimpleOnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
      loadOnboardingData();
    }
  }, [user]);

  const loadOnboardingData = async () => {
    try {
      const { data, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setOnboardingData(data);
        setCurrentStep(data.current_step || 1);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do onboarding:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar seus dados de onboarding.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboardingData = async (stepData: any, stepNumber: number) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const updatedData = { ...onboardingData };
      
      // Atualizar dados do step específico
      switch (stepNumber) {
        case 1:
          updatedData.personal_info = { ...updatedData.personal_info, ...stepData };
          break;
        case 2:
          updatedData.location_info = { ...updatedData.location_info, ...stepData };
          break;
        case 3:
          updatedData.discovery_info = { ...updatedData.discovery_info, ...stepData };
          break;
        case 4:
          updatedData.business_info = { ...updatedData.business_info, ...stepData };
          break;
        case 5:
          updatedData.goals_info = { ...updatedData.goals_info, ...stepData };
          break;
        case 6:
          updatedData.ai_experience = { ...updatedData.ai_experience, ...stepData };
          break;
      }

      // Marcar step como completo
      const completedSteps = [...new Set([...updatedData.completed_steps, stepNumber])];
      updatedData.completed_steps = completedSteps;
      updatedData.current_step = Math.max(stepNumber + 1, updatedData.current_step);

      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          ...updatedData
        });

      if (error) throw error;

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
    } else {
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
          <div className="mt-8 pt-6 border-t">
            <SimpleStepNavigation
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              onPrevious={handlePrevious}
              onNext={() => handleNext()}
              onComplete={completeOnboarding}
              canGoNext={true}
              canGoPrevious={currentStep > 1}
              isLoading={isSaving || isCompleting}
            />
          </div>
        </div>
      </main>
    </div>
  );
};