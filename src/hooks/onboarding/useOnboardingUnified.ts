
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { OnboardingProgress } from '@/types/onboarding';
import { OnboardingValidator } from '@/utils/onboardingValidation';

interface UnifiedOnboardingState {
  // Estados do Quick Onboarding
  currentStep: number;
  totalSteps: number;
  data: QuickOnboardingData;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
  
  // Estados do Onboarding Completo
  progress: OnboardingProgress | null;
  isLoading: boolean;
  hasExistingData: boolean;
  loadError: string | null;
}

const TOTAL_STEPS = 4;

export const useOnboardingUnified = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [state, setState] = useState<UnifiedOnboardingState>({
    currentStep: 1,
    totalSteps: TOTAL_STEPS,
    data: {
      name: '',
      email: '',
      whatsapp: '',
      country_code: '+55',
      birth_date: '',
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
      main_challenge: '',
      ai_knowledge_level: '',
      uses_ai: '',
      main_goal: ''
    },
    isSubmitting: false,
    validationErrors: {},
    progress: null,
    isLoading: true,
    hasExistingData: false,
    loadError: null
  });

  // Carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, loadError: null }));

      // Tentar carregar dados do quick onboarding primeiro
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (quickData && !quickError) {
        setState(prev => ({
          ...prev,
          data: {
            name: quickData.name || '',
            email: quickData.email || '',
            whatsapp: quickData.whatsapp || '',
            country_code: quickData.country_code || '+55',
            birth_date: quickData.birth_date || '',
            instagram_url: quickData.instagram_url || '',
            linkedin_url: quickData.linkedin_url || '',
            how_found_us: quickData.how_found_us || '',
            referred_by: quickData.referred_by || '',
            company_name: quickData.company_name || '',
            role: quickData.role || '',
            company_size: quickData.company_size || '',
            company_segment: quickData.company_segment || '',
            company_website: quickData.company_website || '',
            annual_revenue_range: quickData.annual_revenue_range || '',
            main_challenge: quickData.main_challenge || '',
            ai_knowledge_level: quickData.ai_knowledge_level || '',
            uses_ai: quickData.uses_ai || '',
            main_goal: quickData.main_goal || ''
          },
          currentStep: quickData.is_completed ? 4 : quickData.current_step || 1,
          hasExistingData: true,
          isLoading: false
        }));
        return;
      }

      // Se não houver dados do quick onboarding, tentar carregar do onboarding completo
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressData && !progressError) {
        setState(prev => ({
          ...prev,
          progress: progressData,
          data: {
            name: progressData.personal_info?.name || '',
            email: progressData.personal_info?.email || '',
            whatsapp: progressData.personal_info?.phone || '',
            country_code: progressData.personal_info?.ddi || '+55',
            birth_date: '',
            instagram_url: progressData.personal_info?.instagram || '',
            linkedin_url: progressData.personal_info?.linkedin || '',
            how_found_us: progressData.complementary_info?.how_found_us || '',
            referred_by: progressData.complementary_info?.referred_by || '',
            company_name: progressData.professional_info?.company_name || '',
            role: progressData.professional_info?.current_position || '',
            company_size: progressData.professional_info?.company_size || '',
            company_segment: progressData.professional_info?.company_sector || '',
            company_website: progressData.professional_info?.company_website || '',
            annual_revenue_range: progressData.professional_info?.annual_revenue || '',
            main_challenge: '',
            ai_knowledge_level: progressData.ai_experience?.knowledge_level || '',
            uses_ai: progressData.ai_experience?.has_implemented || '',
            main_goal: progressData.business_goals?.primary_goal || ''
          },
          hasExistingData: true,
          isLoading: false
        }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Erro ao carregar dados existentes:', error);
      setState(prev => ({
        ...prev,
        loadError: 'Erro ao carregar dados salvos',
        isLoading: false
      }));
    }
  }, [user?.id]);

  // Atualizar campo específico
  const updateField = useCallback((field: keyof QuickOnboardingData, value: string) => {
    setState(prev => {
      const newData = { ...prev.data, [field]: value };
      
      // Validação em tempo real
      const validation = prev.currentStep === 1 
        ? OnboardingValidator.validateStep1(newData)
        : prev.currentStep === 2
        ? OnboardingValidator.validateStep2(newData)
        : OnboardingValidator.validateStep3(newData);
      
      return {
        ...prev,
        data: newData,
        validationErrors: validation.errors
      };
    });
  }, []);

  // Validar se pode prosseguir
  const canProceed = useCallback(() => {
    const validation = state.currentStep === 1 
      ? OnboardingValidator.validateStep1(state.data)
      : state.currentStep === 2
      ? OnboardingValidator.validateStep2(state.data)
      : OnboardingValidator.validateStep3(state.data);
    
    return validation.isValid;
  }, [state.currentStep, state.data]);

  // Próximo passo
  const nextStep = useCallback(() => {
    const validation = state.currentStep === 1 
      ? OnboardingValidator.validateStep1(state.data)
      : state.currentStep === 2
      ? OnboardingValidator.validateStep2(state.data)
      : OnboardingValidator.validateStep3(state.data);

    if (!validation.isValid) {
      setState(prev => ({ ...prev, validationErrors: validation.errors }));
      toast.error('Por favor, corrija os erros antes de prosseguir');
      return;
    }

    if (state.currentStep < TOTAL_STEPS) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        validationErrors: {}
      }));
    }
  }, [state.currentStep, state.data]);

  // Passo anterior
  const previousStep = useCallback(() => {
    if (state.currentStep > 1) {
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
        validationErrors: {}
      }));
    }
  }, [state.currentStep]);

  // Salvar dados
  const saveOnboardingData = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    const finalValidation = OnboardingValidator.validateAllSteps(state.data);
    if (!finalValidation.isValid) {
      setState(prev => ({ ...prev, validationErrors: finalValidation.errors }));
      throw new Error('Dados inválidos para salvamento');
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
        ...state.data
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

      // Salvar também no formato do onboarding antigo para compatibilidade
      await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          personal_info: {
            name: state.data.name,
            email: state.data.email,
            phone: state.data.whatsapp,
            ddi: state.data.country_code,
            instagram: state.data.instagram_url,
            linkedin: state.data.linkedin_url
          },
          professional_info: {
            company_name: state.data.company_name,
            current_position: state.data.role,
            company_size: state.data.company_size,
            company_sector: state.data.company_segment,
            company_website: state.data.company_website,
            annual_revenue: state.data.annual_revenue_range
          },
          ai_experience: {
            knowledge_level: state.data.ai_knowledge_level,
            has_implemented: state.data.uses_ai
          },
          business_goals: {
            primary_goal: state.data.main_goal
          },
          complementary_info: {
            how_found_us: state.data.how_found_us,
            referred_by: state.data.referred_by
          },
          is_completed: true,
          completed_steps: ['personal_info', 'professional_info', 'ai_experience'],
          current_step: 'completed'
        });

      console.log('Dados do onboarding salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados do onboarding:', error);
      throw error;
    }
  }, [user?.id, state.data]);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await saveOnboardingData();
      toast.success('Onboarding concluído com sucesso!');
      
      setTimeout(() => {
        navigate('/onboarding-new/completed');
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      if (error instanceof Error && error.message.includes('Dados inválidos')) {
        toast.error('Por favor, verifique todos os dados antes de finalizar.');
      } else {
        toast.error('Erro ao finalizar onboarding. Tente novamente.');
      }
      return false;
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [saveOnboardingData, navigate]);

  // Verificar se onboarding está completo
  const isOnboardingComplete = useCallback(() => {
    if (state.progress) {
      const requiredSteps = ['personal_info', 'professional_info', 'ai_experience'];
      const hasAllSteps = requiredSteps.every(step => 
        state.progress?.completed_steps?.includes(step)
      );
      
      const hasRequiredData = !!(
        state.progress.personal_info?.name &&
        state.progress.personal_info?.email &&
        state.progress.professional_info?.company_name &&
        state.progress.business_goals?.primary_goal &&
        state.progress.ai_experience
      );

      return state.progress.is_completed && hasAllSteps && hasRequiredData;
    }
    
    return false;
  }, [state.progress]);

  // Carregar dados na inicialização
  useEffect(() => {
    if (user?.id) {
      loadExistingData();
    }
  }, [user?.id, loadExistingData]);

  return {
    // Estados do Quick Onboarding
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    data: state.data,
    updateField,
    nextStep,
    previousStep,
    canProceed: canProceed(),
    isSubmitting: state.isSubmitting,
    completeOnboarding,
    validationErrors: state.validationErrors,
    clearErrors: () => setState(prev => ({ ...prev, validationErrors: {} })),
    
    // Estados do Onboarding Completo
    progress: state.progress,
    isLoading: state.isLoading,
    hasExistingData: state.hasExistingData,
    loadError: state.loadError,
    isOnboardingComplete: isOnboardingComplete(),
    
    // Métodos compartilhados
    refreshProgress: loadExistingData,
    saveOnboardingData
  };
};
