
import React, { memo, Suspense, lazy, useMemo, useState, useCallback } from 'react';
import { OnboardingPerformanceOptimizer } from './performance/OnboardingPerformanceOptimizer';
import { PerformanceWrapper } from '@/components/common/performance/PerformanceWrapper';
import LoadingScreen from '@/components/common/LoadingScreen';
import { OnboardingFinalData } from '@/types/onboardingFinal';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Lazy loading otimizado dos componentes de onboarding existentes
const StepPersonalInfo = lazy(() => 
  import('../final/steps/StepPersonalInfo').then(module => ({ 
    default: module.StepPersonalInfo 
  }))
);

const StepCompanyInfo = lazy(() => 
  import('../final/steps/StepBusinessInfo').then(module => ({ 
    default: module.StepBusinessInfo 
  }))
);

const StepBusinessContext = lazy(() => 
  import('../final/steps/StepBusinessContext').then(module => ({ 
    default: module.StepBusinessContext 
  }))
);

const StepAIExperience = lazy(() => 
  import('../final/steps/StepAIExperience').then(module => ({ 
    default: module.StepAIExperience 
  }))
);

const StepGoalsInfo = lazy(() => 
  import('../final/steps/StepGoalsInfo').then(module => ({ 
    default: module.StepGoalsInfo 
  }))
);

const StepDiscoveryInfo = lazy(() => 
  import('../final/steps/StepDiscoveryInfo').then(module => ({ 
    default: module.StepDiscoveryInfo 
  }))
);

interface SimpleOnboardingFlowProps {
  initialStep?: number;
  onComplete?: () => void;
}

const initialData: OnboardingFinalData = {
  personal_info: {
    name: '',
    email: ''
  },
  location_info: {},
  discovery_info: {},
  business_info: {},
  business_context: {},
  goals_info: {},
  ai_experience: {},
  personalization: {}
};

export const SimpleOnboardingFlow: React.FC<SimpleOnboardingFlowProps> = memo(({
  initialStep = 1,
  onComplete
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [data, setData] = useState<OnboardingFinalData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save dos dados a cada mudança
  const autoSave = useCallback(async (newData: OnboardingFinalData) => {
    if (!user?.id || isSaving) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('onboarding')
        .upsert({
          user_id: user.id,
          ...newData,
          current_step: `step_${currentStep}`,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro no auto-save:', error);
      }
    } catch (error) {
      console.error('Erro no auto-save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, currentStep, isSaving]);

  // Atualizar seção dos dados
  const updateSection = useCallback((section: keyof OnboardingFinalData, value: any) => {
    const newData = {
      ...data,
      [section]: value
    };
    setData(newData);
    
    // Auto-save com debounce
    const timeoutId = setTimeout(() => {
      autoSave(newData);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [data, autoSave]);

  // Validação por step
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1: // Personal Info
        return !!(data.personal_info.name && data.personal_info.email);
      case 2: // Business Info
        return !!(data.business_info.company_name && data.business_info.role);
      case 3: // Business Context
        return !!(data.business_context.business_model);
      case 4: // AI Experience
        return !!(data.ai_experience.ai_knowledge_level && data.ai_experience.has_implemented);
      case 5: // Goals Info
        return !!(data.goals_info.primary_goal);
      case 6: // Discovery Info
        return !!(data.discovery_info.how_found_us);
      default:
        return true;
    }
  }, [currentStep, data]);

  // Próximo step
  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finalizar onboarding
      await handleComplete();
    }
  }, [currentStep, validateCurrentStep]);

  // Step anterior
  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Finalizar onboarding
  const handleComplete = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('onboarding')
        .upsert({
          user_id: user.id,
          ...data,
          is_completed: true,
          current_step: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro ao finalizar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return;
      }

      toast.success('Onboarding finalizado com sucesso!');
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao finalizar onboarding:', error);
      toast.error('Erro inesperado ao finalizar onboarding');
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, data, onComplete, navigate]);

  // Props dos steps memoizadas
  const stepProps = useMemo(() => ({
    data,
    onUpdate: updateSection,
    onNext: handleNext,
    onPrevious: currentStep > 1 ? handlePrevious : undefined,
    canProceed: validateCurrentStep(),
    currentStep,
    totalSteps: 6
  }), [data, updateSection, handleNext, handlePrevious, validateCurrentStep, currentStep]);

  // Componente do step atual memoizado
  const CurrentStepComponent = useMemo(() => {
    const components = [
      StepPersonalInfo,
      StepCompanyInfo,
      StepBusinessContext,
      StepAIExperience,
      StepGoalsInfo,
      StepDiscoveryInfo
    ];

    const Component = components[currentStep - 1];
    
    if (!Component) {
      return () => <div className="text-white">Step não encontrado</div>;
    }

    return Component;
  }, [currentStep]);

  // Títulos dos steps
  const stepTitles = {
    1: 'Informações Pessoais',
    2: 'Informações da Empresa', 
    3: 'Contexto do Negócio',
    4: 'Experiência com IA',
    5: 'Objetivos e Metas',
    6: 'Como nos conheceu'
  };

  return (
    <PerformanceWrapper 
      componentName="SimpleOnboardingFlow" 
      context="onboarding"
    >
      <OnboardingPerformanceOptimizer>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="container mx-auto px-4 py-8">
            {/* Header com progresso */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {stepTitles[currentStep as keyof typeof stepTitles]}
                </h1>
                <p className="text-gray-300">
                  Etapa {currentStep} de 6
                </p>
              </div>

              {/* Barra de progresso */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-viverblue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                />
              </div>

              {/* Indicador de auto-save */}
              {isSaving && (
                <div className="text-center text-sm text-gray-400 mb-4">
                  <span className="inline-flex items-center gap-2">
                    <div className="w-3 h-3 border border-viverblue border-t-transparent rounded-full animate-spin" />
                    Salvando automaticamente...
                  </span>
                </div>
              )}
            </div>

            {/* Conteúdo do step */}
            <Suspense fallback={
              <LoadingScreen 
                message="Carregando etapa do onboarding"
                variant="skeleton"
                skeletonVariant="page"
              />
            }>
              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
                  {/* Indicador de submissão */}
                  {isSubmitting && (
                    <div className="mb-6 p-4 bg-viverblue/10 border border-viverblue/20 rounded-lg">
                      <div className="flex items-center justify-center gap-3 text-viverblue">
                        <div className="w-5 h-5 border-2 border-viverblue border-t-transparent rounded-full animate-spin" />
                        <span className="font-medium">Finalizando onboarding...</span>
                      </div>
                    </div>
                  )}

                  <CurrentStepComponent {...stepProps} />
                </div>
              </div>
            </Suspense>
          </div>
        </div>
      </OnboardingPerformanceOptimizer>
    </PerformanceWrapper>
  );
});

SimpleOnboardingFlow.displayName = 'SimpleOnboardingFlow';

export default SimpleOnboardingFlow;
