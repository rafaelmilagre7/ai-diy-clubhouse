
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';

const getInitialData = (): QuickOnboardingData => ({
  name: '',
  email: '',
  whatsapp: '',
  country_code: '+55',
  birth_date: '',
  country: '',
  state: '',
  city: '',
  instagram_url: '',
  linkedin_url: '',
  how_found_us: '',
  referred_by: '',
  company_name: '',
  role: '',
  company_size: '',
  company_segment: '',
  company_website: '',
  annual_revenue_range: '',
  current_position: '',
  business_model: '',
  business_challenges: [],
  short_term_goals: [],
  medium_term_goals: [],
  important_kpis: [],
  additional_context: '',
  primary_goal: '',
  expected_outcomes: [],
  expected_outcome_30days: '',
  priority_solution_type: '',
  how_implement: '',
  week_availability: '',
  content_formats: [],
  ai_knowledge_level: 'iniciante',
  previous_tools: [],
  has_implemented: '',
  desired_ai_areas: [],
  completed_formation: false,
  is_member_for_month: false,
  nps_score: 0,
  improvement_suggestions: '',
  interests: [],
  time_preference: [],
  available_days: [],
  networking_availability: 5,
  skills_to_share: [],
  mentorship_topics: [],
  live_interest: 0,
  authorize_case_usage: false,
  interested_in_interview: false,
  priority_topics: [],
  currentStep: 1
});

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>(getInitialData());
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const totalSteps = 8;

  // Carregar dados salvos
  const loadData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('📖 Carregando dados do onboarding...');

      const { data: savedData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setData(getInitialData());
        setIsLoading(false);
        return;
      }

      if (savedData) {
        console.log('✅ Dados carregados:', savedData);
        setData(savedData);
        setCurrentStep(savedData.currentStep || 1);
      } else {
        console.log('📝 Inicializando com dados padrão');
        setData(getInitialData());
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      setData(getInitialData());
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Salvar dados automaticamente
  const saveData = useCallback(async (dataToSave: QuickOnboardingData) => {
    if (!user?.id || isSaving) return false;

    try {
      setIsSaving(true);
      console.log('💾 Salvando dados...');

      const cleanedData = {
        ...dataToSave,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert(cleanedData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Erro ao salvar:', error);
        return false;
      }

      console.log('✅ Dados salvos com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, isSaving]);

  // Atualizar campo
  const updateField = useCallback((field: string, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      // Auto-save com debounce
      setTimeout(() => saveData(newData), 1000);
      return newData;
    });
  }, [saveData]);

  // Próxima etapa
  const nextStep = useCallback(async () => {
    const newStep = Math.min(currentStep + 1, totalSteps);
    const newData = { ...data, currentStep: newStep };
    
    setCurrentStep(newStep);
    setData(newData);
    
    await saveData(newData);
  }, [currentStep, totalSteps, data, saveData]);

  // Etapa anterior
  const previousStep = useCallback(() => {
    const newStep = Math.max(currentStep - 1, 1);
    const newData = { ...data, currentStep: newStep };
    
    setCurrentStep(newStep);
    setData(newData);
    
    saveData(newData);
  }, [currentStep, data, saveData]);

  // Completar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id || isCompleting) return false;

    try {
      setIsCompleting(true);
      console.log('🏁 Completando onboarding...');

      const finalData = {
        ...data,
        user_id: user.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
        currentStep: totalSteps
      };

      const { error } = await supabase
        .from('quick_onboarding')
        .upsert(finalData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Erro ao completar onboarding:', error);
        toast.error('Erro ao finalizar onboarding');
        return false;
      }

      console.log('✅ Onboarding completado com sucesso');
      toast.success('Onboarding completado! 🎉');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast.error('Erro inesperado ao finalizar');
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [user?.id, data, totalSteps, isCompleting]);

  // Verificar se pode prosseguir
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.birth_date);
      case 2:
        return !!(data.country && data.state && data.city);
      case 3:
        return !!data.how_found_us;
      case 4:
        return !!(data.company_name && data.role && data.company_size && data.company_segment && data.annual_revenue_range);
      case 5:
        return !!data.business_model;
      case 6:
        return !!(data.primary_goal && data.expected_outcome_30days && data.content_formats?.length);
      case 7:
        return !!(data.ai_knowledge_level && data.desired_ai_areas?.length);
      case 8:
        return !!(data.available_days?.length);
      default:
        return true;
    }
  }, [currentStep, data]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    currentStep,
    totalSteps,
    updateField,
    nextStep,
    previousStep,
    completeOnboarding,
    canProceed: canProceed(),
    isSaving,
    isCompleting,
    isLoading
  };
};
