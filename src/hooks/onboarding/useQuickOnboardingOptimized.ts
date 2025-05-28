
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

const TOTAL_STEPS = 4;
const ANALYTICS_EVENTS = {
  ONBOARDING_STARTED: 'onboarding_started',
  STEP_COMPLETED: 'step_completed',
  STEP_ABANDONED: 'step_abandoned',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  VALIDATION_ERROR: 'validation_error'
};

const initialData: QuickOnboardingData = {
  // Etapa 1: Informações Pessoais
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  instagram_url: '',
  linkedin_url: '',
  how_found_us: '',
  referred_by: '',

  // Etapa 2: Negócio
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  main_challenge: '',

  // Etapa 3: Experiência com IA
  ai_knowledge_level: '',
  uses_ai: '',
  main_goal: ''
};

export const useQuickOnboardingOptimized = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analytics, setAnalytics] = useState({
    startTime: Date.now(),
    stepTimes: {} as Record<number, number>,
    errors: [] as string[]
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Analytics tracking
  const trackEvent = useCallback(async (event: string, data: any = {}) => {
    try {
      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        event_name: event,
        event_data: {
          ...data,
          onboarding_type: 'quick_onboarding_new',
          session_id: analytics.startTime.toString()
        }
      });
    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
    }
  }, [user?.id, analytics.startTime]);

  // Validação otimizada com memoização
  const validationRules = useMemo(() => ({
    1: () => !!(data.name && data.email && data.whatsapp && data.country_code && data.how_found_us &&
               (data.how_found_us !== 'indicacao' || data.referred_by)),
    2: () => !!(data.company_name && data.role && data.company_size && 
               data.company_segment && data.annual_revenue_range && data.main_challenge),
    3: () => !!(data.ai_knowledge_level && data.uses_ai && data.main_goal)
  }), [data]);

  // Atualizar campo com validação em tempo real
  const updateField = useCallback((field: keyof QuickOnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Validação em tempo real para UX melhorada
    const isValid = validationRules[currentStep as keyof typeof validationRules]?.();
    if (!isValid && value.length > 0) {
      // Campo preenchido mas validação falhou - não mostrar erro ainda
    }
  }, [currentStep, validationRules]);

  // Verificar se pode prosseguir com memoização
  const canProceed = useMemo(() => {
    const validator = validationRules[currentStep as keyof typeof validationRules];
    return validator ? validator() : true;
  }, [currentStep, validationRules]);

  // Próximo passo com analytics
  const nextStep = useCallback(async () => {
    if (!canProceed) {
      await trackEvent(ANALYTICS_EVENTS.VALIDATION_ERROR, {
        step: currentStep,
        missingFields: Object.entries(data).filter(([_, value]) => !value).map(([key]) => key)
      });
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Registrar tempo gasto na etapa
    const stepTime = Date.now();
    setAnalytics(prev => ({
      ...prev,
      stepTimes: { ...prev.stepTimes, [currentStep]: stepTime - (prev.stepTimes[currentStep - 1] || prev.startTime) }
    }));

    await trackEvent(ANALYTICS_EVENTS.STEP_COMPLETED, {
      step: currentStep,
      timeSpent: analytics.stepTimes[currentStep]
    });

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed, currentStep, data, analytics, trackEvent]);

  // Passo anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Salvamento otimizado com retry
  const saveOnboardingData = useCallback(async (retryCount = 0) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { data: existingRecord } = await supabase
        .from('quick_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const onboardingData = {
        user_id: user.id,
        current_step: 4,
        is_completed: true,
        completed_at: new Date().toISOString(),
        completion_time_minutes: Math.round((Date.now() - analytics.startTime) / 60000),
        ...data
      };

      if (existingRecord) {
        const { error } = await supabase
          .from('quick_onboarding')
          .update(onboardingData)
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quick_onboarding')
          .insert([onboardingData]);

        if (error) throw error;
      }

      // Compatibilidade com sistema antigo
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          personal_info: {
            name: data.name,
            email: data.email,
            whatsapp: data.whatsapp,
            country_code: data.country_code,
            birth_date: data.birth_date,
            instagram_url: data.instagram_url,
            linkedin_url: data.linkedin_url,
            how_found_us: data.how_found_us,
            referred_by: data.referred_by
          },
          professional_info: {
            company_name: data.company_name,
            role: data.role,
            company_size: data.company_size,
            company_segment: data.company_segment,
            company_website: data.company_website,
            annual_revenue_range: data.annual_revenue_range,
            main_challenge: data.main_challenge
          },
          ai_experience: {
            knowledge_level: data.ai_knowledge_level,
            uses_ai: data.uses_ai,
            main_goal: data.main_goal
          },
          is_completed: true,
          completed_steps: ['personal_info', 'professional_info', 'ai_experience'],
          current_step: 'completed'
        });

      console.log('Dados do onboarding salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados do onboarding:', error);
      
      // Retry logic
      if (retryCount < 3) {
        console.log(`Tentativa ${retryCount + 1} de salvamento...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return saveOnboardingData(retryCount + 1);
      }
      
      throw error;
    }
  }, [user?.id, data, analytics.startTime]);

  // Completar onboarding com analytics completos
  const completeOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      await saveOnboardingData();
      
      // Analytics finais
      await trackEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
        totalTime: Date.now() - analytics.startTime,
        stepTimes: analytics.stepTimes,
        userProfile: {
          company_size: data.company_size,
          ai_knowledge: data.ai_knowledge_level,
          main_goal: data.main_goal
        }
      });
      
      toast.success('Onboarding concluído com sucesso!');
      
      setTimeout(() => {
        navigate('/onboarding-new/completed');
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      setAnalytics(prev => ({
        ...prev,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Erro desconhecido']
      }));
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [saveOnboardingData, navigate, trackEvent, analytics, data]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed,
    isSubmitting,
    completeOnboarding,
    analytics: {
      timeSpent: Date.now() - analytics.startTime,
      currentStepTime: analytics.stepTimes[currentStep] || 0,
      errors: analytics.errors
    }
  };
};
