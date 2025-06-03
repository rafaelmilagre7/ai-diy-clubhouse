import { useState, useEffect, useCallback } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSimpleOnboarding = () => {
  const [data, setData] = useState<QuickOnboardingData>({
    // Etapa 1 - Informações Pessoais
    name: '',
    email: '',
    whatsapp: '',
    country_code: '+55',
    birth_date: '',
    
    // Etapa 2 - Localização e Redes
    country: '',
    state: '',
    city: '',
    instagram_url: '',
    linkedin_url: '',
    
    // Etapa 3 - Como nos conheceu
    how_found_us: '',
    referred_by: '',
    
    // Etapa 4 - Seu negócio
    company_name: '',
    role: '',
    company_size: '',
    company_segment: '',
    company_website: '',
    annual_revenue_range: '',
    current_position: '',
    
    // Etapa 5 - Contexto do negócio
    business_model: '',
    business_challenges: [],
    short_term_goals: [],
    medium_term_goals: [],
    important_kpis: [],
    additional_context: '',
    
    // Etapa 6 - Objetivos e metas
    primary_goal: '',
    expected_outcomes: [],
    expected_outcome_30days: '',
    priority_solution_type: '',
    how_implement: '',
    week_availability: '',
    content_formats: [],
    
    // Etapa 7 - Experiência com IA
    ai_knowledge_level: '',
    previous_tools: [],
    has_implemented: '',
    desired_ai_areas: [],
    completed_formation: false,
    is_member_for_month: false,
    nps_score: 0,
    improvement_suggestions: '',
    
    // Etapa 8 - Personalização
    interests: [],
    time_preference: [],
    available_days: [],
    networking_availability: 0,
    skills_to_share: [],
    mentorship_topics: [],
    
    // Campos de controle
    live_interest: 0,
    authorize_case_usage: false,
    interested_in_interview: false,
    priority_topics: [],
    
    currentStep: 1
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const totalSteps = 8;

  const loadSavedData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔄 Carregando dados salvos do onboarding...');
      
      const { data: savedData, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar dados:', error);
        return;
      }

      if (savedData) {
        console.log('✅ Dados carregados:', savedData);
        setData(prevData => ({
          ...prevData,
          ...savedData,
          // Garantir que arrays sejam arrays
          business_challenges: savedData.business_challenges || [],
          short_term_goals: savedData.short_term_goals || [],
          medium_term_goals: savedData.medium_term_goals || [],
          important_kpis: savedData.important_kpis || [],
          expected_outcomes: savedData.expected_outcomes || [],
          content_formats: savedData.content_formats || [],
          previous_tools: savedData.previous_tools || [],
          desired_ai_areas: savedData.desired_ai_areas || [],
          interests: savedData.interests || [],
          time_preference: savedData.time_preference || [],
          available_days: savedData.available_days || [],
          skills_to_share: savedData.skills_to_share || [],
          mentorship_topics: savedData.mentorship_topics || [],
          priority_topics: savedData.priority_topics || []
        }));
        
        if (savedData.current_step) {
          setCurrentStep(typeof savedData.current_step === 'string' ? 
            parseInt(savedData.current_step) : savedData.current_step);
        }
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  const saveData = useCallback(async (dataToSave: Partial<QuickOnboardingData>) => {
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      const { error } = await supabase
        .from('onboarding')
        .upsert({
          user_id: user.id,
          ...dataToSave,
          current_step: currentStep,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao salvar:', error);
        toast.error('Erro ao salvar dados');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar:', error);
      toast.error('Erro inesperado ao salvar');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentStep]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: string | string[] | number | boolean) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-save após 1 segundo
      setTimeout(() => {
        saveData(newData);
      }, 1000);
      
      return newData;
    });
  }, [saveData]);

  const nextStep = useCallback(async () => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      const success = await saveData({ ...data, current_step: newStep });
      if (success) {
        toast.success(`Etapa ${currentStep} concluída!`);
      }
    }
  }, [currentStep, totalSteps, data, saveData]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveData({ ...data, current_step: newStep });
    }
  }, [currentStep, data, saveData]);

  const completeOnboarding = useCallback(async () => {
    try {
      setIsCompleting(true);
      
      const finalData = {
        ...data,
        is_completed: true,
        completed_at: new Date().toISOString()
      };
      
      const success = await saveData(finalData);
      if (success) {
        toast.success('Onboarding concluído com sucesso!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [data, saveData]);

  const canProceed = (() => {
    switch (currentStep) {
      case 1: // Quem é você
        return !!(data.name && data.email && data.whatsapp && data.country_code);
      case 2: // Localização e redes
        return !!(data.country && data.state && data.city);
      case 3: // Como nos conheceu
        return !!data.how_found_us;
      case 4: // Seu negócio
        return !!(data.company_name && data.role && data.company_size && data.company_segment);
      case 5: // Contexto do negócio
        return !!(data.business_model && data.business_challenges.length > 0);
      case 6: // Objetivos e metas
        return !!(data.primary_goal && data.expected_outcome_30days);
      case 7: // Experiência com IA
        return !!(data.ai_knowledge_level && data.has_implemented);
      case 8: // Personalização
        return data.interests.length > 0;
      default:
        return false;
    }
  })();

  return {
    data,
    currentStep,
    totalSteps,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed,
    isSaving,
    isCompleting,
    isLoading
  };
};
