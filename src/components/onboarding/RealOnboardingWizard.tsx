import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Importar os steps reais adaptados dos mockados
import { OnboardingStep1 } from './steps/OnboardingStep1';
import { OnboardingStep2 } from './steps/OnboardingStep2';
import { OnboardingStep3 } from './steps/OnboardingStep3';
import { OnboardingStep4 } from './steps/OnboardingStep4';
import { OnboardingStep5 } from './steps/OnboardingStep5';
import { OnboardingStep6 } from './steps/OnboardingStep6';

import { OnboardingProgress } from './OnboardingProgress';
import { MotivationalMessage } from './components/MotivationalMessage';
import { StepNavigation } from './components/StepNavigation';
import { createProfileBadges } from './components/GamificationBadge';

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

export const RealOnboardingWizard: React.FC = () => {
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

      if (error && error.code !== 'PGRST116') { // Não é erro de "não encontrado"
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
      
      toast({
        title: "Progresso salvo!",
        description: `Etapa ${stepNumber} concluída com sucesso.`,
      });

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
          title: "🎉 Parabéns!",
          description: "Seu onboarding foi concluído com sucesso!",
        });

        // Redirecionar para dashboard após 2 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-viverblue mb-4"></div>
          <p className="text-white text-lg">Carregando seu onboarding...</p>
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
        return <OnboardingStep1 {...stepProps} />;
      case 2:
        return <OnboardingStep2 {...stepProps} />;
      case 3:
        return <OnboardingStep3 {...stepProps} />;
      case 4:
        return <OnboardingStep4 {...stepProps} />;
      case 5:
        return <OnboardingStep5 {...stepProps} />;
      case 6:
        return <OnboardingStep6 {...stepProps} />;
      default:
        return <OnboardingStep1 {...stepProps} />;
    }
  };

  const badges = createProfileBadges(onboardingData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com progresso */}
        <div className="mb-8">
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            badges={badges}
          />
        </div>

        {/* Mensagem motivacional */}
        <div className="mb-6">
          <MotivationalMessage
            step={currentStep}
            completedSteps={onboardingData.completed_steps.length}
            totalSteps={TOTAL_STEPS}
          />
        </div>

        {/* Conteúdo do step atual */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navegação */}
          <div className="border-t border-slate-700/50 p-6">
            <StepNavigation
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
      </div>
    </div>
  );
};