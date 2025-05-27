
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const TOTAL_STEPS = 4; // 3 steps + geração de trilha

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

export const useQuickOnboardingNew = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Atualizar campo específico
  const updateField = useCallback((field: keyof QuickOnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Validar se pode prosseguir
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.country_code && data.how_found_us &&
                 (data.how_found_us !== 'indicacao' || data.referred_by));
      case 2:
        return !!(data.company_name && data.role && data.company_size && 
                 data.company_segment && data.annual_revenue_range && data.main_challenge);
      case 3:
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      default:
        return true;
    }
  }, [currentStep, data]);

  // Próximo passo
  const nextStep = useCallback(() => {
    if (canProceed() && currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed, currentStep]);

  // Passo anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Salvar dados no Supabase
  const saveOnboardingData = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Primeiro, verificar se já existe um registro
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
        ...data
      };

      if (existingRecord) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('quick_onboarding')
          .update(onboardingData)
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('quick_onboarding')
          .insert([onboardingData]);

        if (error) throw error;
      }

      // Também salvar no formato do onboarding antigo para compatibilidade
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
      throw error;
    }
  }, [user?.id, data]);

  // Completar onboarding
  const completeOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      await saveOnboardingData();
      
      toast.success('Onboarding concluído com sucesso!');
      
      // Redirecionar após breve delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [saveOnboardingData, navigate]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed: canProceed(),
    isSubmitting,
    completeOnboarding
  };
};
