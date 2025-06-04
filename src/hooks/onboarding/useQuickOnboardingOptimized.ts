
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { useOnboardingValidation } from './useOnboardingValidation';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const initialData: QuickOnboardingData = {
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: null,
  instagram_url: null,
  linkedin_url: null,
  how_found_us: '',
  referred_by: null,
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: null,
  annual_revenue_range: '',
  main_challenge: '',
  ai_knowledge_level: '',
  uses_ai: '',
  main_goal: '',
  desired_ai_areas: [],
  has_implemented: '',
  previous_tools: []
};

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const { 
    validateStep1, 
    validateStep2, 
    validateStep3, 
    validateAllSteps,
    validateDataInDatabase 
  } = useOnboardingValidation();
  
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  const loadExistingData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (quickError) {
        console.error('❌ Erro ao carregar dados:', quickError);
        setLoadError('Erro ao carregar seus dados. Tente novamente.');
        return;
      }

      if (quickData) {
        setData(quickData as QuickOnboardingData);
        setHasExistingData(true);
        console.log('✅ Dados carregados com sucesso:', quickData);
      } else {
        setHasExistingData(false);
        console.log('ℹ️ Nenhum dado existente encontrado.');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setLoadError('Erro ao carregar seus dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadExistingData();
    }
  }, [user, loadExistingData]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return validateStep1(data);
      case 2:
        return validateStep2(data);
      case 3:
        return validateStep3(data);
      case 4:
        return validateAllSteps(data);
      default:
        return false;
    }
  }, [currentStep, data, validateStep1, validateStep2, validateStep3, validateAllSteps]);

  const nextStep = useCallback(() => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return false;
    }

    try {
      console.log('🎯 Iniciando finalização do onboarding...');

      // Validar dados antes de prosseguir
      const validation = await validateDataInDatabase();
      if (!validation.isValid) {
        console.error('❌ Dados inválidos:', validation.missingFields);
        toast.error('Dados incompletos. Revise as etapas.');
        return false;
      }

      // Preparar dados para onboarding_progress - apenas campos válidos da tabela
      const progressData = {
        user_id: user.id,
        personal_info: {
          email: data.email,
          phone: data.whatsapp,
          ddi: data.country_code,
          linkedin: data.linkedin_url,
          instagram: data.instagram_url
        },
        professional_info: {
          company_name: data.company_name,
          current_position: data.role,
          company_size: data.company_size,
          company_sector: data.company_segment,
          company_website: data.company_website,
          annual_revenue: data.annual_revenue_range
        },
        ai_experience: {
          knowledge_level: data.ai_knowledge_level,
          previous_tools: data.previous_tools,
          desired_ai_areas: data.desired_ai_areas,
          has_implemented: data.has_implemented,
          uses_ai: data.uses_ai
        },
        business_goals: {
          primary_goal: data.main_goal,
          expected_outcomes: []
        },
        business_context: {
          business_challenges: data.main_challenge ? [data.main_challenge] : []
        },
        complementary_info: {
          how_found_us: data.how_found_us,
          referred_by: data.referred_by
        },
        experience_personalization: {},
        current_step: 'completed',
        completed_steps: ['personal_info', 'professional_info', 'ai_experience'],
        is_completed: true,
        // Remover campos que causam erro - usar apenas campos válidos da tabela
        company_name: data.company_name,
        company_size: data.company_size,
        company_sector: data.company_segment,
        company_website: data.company_website,
        current_position: data.role,
        annual_revenue: data.annual_revenue_range
      };

      // Verificar se existe progresso
      const { data: existingProgress } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Atualizar ou criar progresso atomicamente
      let progressSuccess = false;
      if (existingProgress) {
        const { error: updateError } = await supabase
          .from('onboarding_progress')
          .update(progressData)
          .eq('id', existingProgress.id);
        progressSuccess = !updateError;
        if (updateError) console.error('❌ Erro ao atualizar progresso:', updateError);
      } else {
        const { error: insertError } = await supabase
          .from('onboarding_progress')
          .insert([{ ...progressData, created_at: new Date().toISOString() }]);
        progressSuccess = !insertError;
        if (insertError) console.error('❌ Erro ao criar progresso:', insertError);
      }

      // Atualizar quick_onboarding como concluído - apenas campos válidos
      const quickOnboardingUpdate = {
        is_completed: true,
        updated_at: new Date().toISOString()
      };

      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .update(quickOnboardingUpdate)
        .eq('user_id', user.id);

      const quickSuccess = !quickError;
      if (quickError) console.error('❌ Erro ao finalizar quick_onboarding:', quickError);

      if (progressSuccess && quickSuccess) {
        console.log('✅ Onboarding finalizado com sucesso!');
        return true;
      } else {
        console.error('❌ Falha na finalização do onboarding');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erro na finalização do onboarding:', error);
      return false;
    }
  }, [user, data, validateDataInDatabase]);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed,
    isLoading,
    hasExistingData,
    loadError,
    totalSteps: 4,
    isSaving,
    lastSaveTime,
    completeOnboarding
  };
};
