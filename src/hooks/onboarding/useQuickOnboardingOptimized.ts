
import { useState, useCallback } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboardingDataLoader } from './useQuickOnboardingDataLoader';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

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
  main_goal: '',

  // Campos adicionais para compatibilidade
  desired_ai_areas: [],
  has_implemented: '',
  previous_tools: []
};

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const { 
    data, 
    setData, 
    isLoading, 
    hasExistingData, 
    loadError 
  } = useQuickOnboardingDataLoader();

  // Adicionar auto-save
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setData]);

  // Função para verificar se dados estão salvos no banco
  const validateDataInDatabase = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: quickData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !quickData) {
        console.log('❌ Dados não encontrados no banco');
        return false;
      }

      // Verificar se todos os dados essenciais estão presentes
      const hasEssentialData = !!(
        quickData.name && quickData.email && quickData.whatsapp && quickData.how_found_us &&
        quickData.company_name && quickData.role && quickData.company_size && 
        quickData.company_segment && quickData.annual_revenue_range && quickData.main_challenge &&
        quickData.ai_knowledge_level && quickData.uses_ai && quickData.main_goal
      );

      console.log('✅ Dados validados no banco:', hasEssentialData);
      return hasEssentialData;
    } catch (error) {
      console.error('❌ Erro ao validar dados no banco:', error);
      return false;
    }
  }, [user]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        // Etapa 1: Validar campos obrigatórios incluindo indicação condicional
        const hasRequiredPersonalInfo = !!(data.name && data.email && data.whatsapp && data.how_found_us);
        const hasReferralIfNeeded = data.how_found_us !== 'indicacao' || !!data.referred_by;
        return hasRequiredPersonalInfo && hasReferralIfNeeded;
      case 2:
        // Etapa 2: Validar informações completas do negócio
        return !!(data.company_name && data.role && data.company_size && 
                  data.company_segment && data.annual_revenue_range && data.main_challenge);
      case 3:
        // Etapa 3: Validar experiência completa com IA
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      case 4:
        // Etapa 4: Validar que todas as etapas anteriores estão completas
        const step1Valid = !!(data.name && data.email && data.whatsapp && data.how_found_us &&
                              (data.how_found_us !== 'indicacao' || data.referred_by));
        const step2Valid = !!(data.company_name && data.role && data.company_size && 
                              data.company_segment && data.annual_revenue_range && data.main_challenge);
        const step3Valid = !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
        
        return step1Valid && step2Valid && step3Valid;
      default:
        return false;
    }
  }, [currentStep, data]);

  const nextStep = useCallback(() => {
    if (canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed]);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  // Função para garantir que existe registro em onboarding_progress
  const ensureOnboardingProgress = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      // Verificar se já existe
      const { data: existingProgress } = await supabase
        .from('onboarding_progress')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProgress) {
        return existingProgress.id;
      }

      // Criar novo registro se não existir
      const progressData = {
        user_id: user.id,
        personal_info: {
          name: data.name,
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
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProgress, error } = await supabase
        .from('onboarding_progress')
        .insert([progressData])
        .select('id')
        .single();

      if (error) throw error;

      console.log('✅ Registro criado em onboarding_progress:', newProgress.id);
      return newProgress.id;
    } catch (error) {
      console.error('❌ Erro ao garantir onboarding_progress:', error);
      return null;
    }
  }, [user, data]);

  const completeOnboarding = useCallback(async () => {
    if (!user || !canProceed()) {
      toast.error('Complete todas as etapas antes de finalizar');
      return false;
    }

    console.log('🚀 Iniciando finalização do onboarding...');

    try {
      // 1. Validar se dados estão salvos no banco
      console.log('📋 Validando dados no banco...');
      const dataValid = await validateDataInDatabase();
      if (!dataValid) {
        toast.error('Dados não estão completos no sistema. Aguarde o salvamento automático.');
        return false;
      }

      // 2. Garantir que existe registro em onboarding_progress
      console.log('📄 Garantindo registro em onboarding_progress...');
      const progressId = await ensureOnboardingProgress();
      if (!progressId) {
        toast.error('Erro ao criar registro de progresso. Tente novamente.');
        return false;
      }

      // 3. Atualizar ambas as tabelas de forma atômica usando transação
      console.log('💾 Salvando conclusão nas tabelas...');
      
      // Atualizar quick_onboarding
      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .update({ 
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (quickError) throw quickError;

      // Atualizar onboarding_progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .update({ 
          is_completed: true,
          current_step: 'completed',
          completed_steps: ['personal_info', 'professional_info', 'ai_experience'],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      console.log('✅ Onboarding concluído com sucesso!');
      toast.success('Onboarding concluído com sucesso!');
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao completar onboarding:', error);
      
      // Retry simples uma vez
      try {
        console.log('🔄 Tentando novamente...');
        
        const { error: retryQuickError } = await supabase
          .from('quick_onboarding')
          .update({ is_completed: true, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        const { error: retryProgressError } = await supabase
          .from('onboarding_progress')
          .update({ 
            is_completed: true,
            current_step: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (!retryQuickError && !retryProgressError) {
          console.log('✅ Sucesso no retry!');
          toast.success('Onboarding concluído com sucesso!');
          return true;
        }
      } catch (retryError) {
        console.error('❌ Erro no retry:', retryError);
      }

      toast.error('Erro ao finalizar onboarding. Verifique sua conexão e tente novamente.');
      return false;
    }
  }, [user, canProceed, validateDataInDatabase, ensureOnboardingProgress]);

  return {
    currentStep,
    data,
    updateField,
    nextStep,
    previousStep,
    canProceed: canProceed(),
    isLoading,
    hasExistingData,
    loadError,
    totalSteps: 4,
    // Adicionar estado de salvamento
    isSaving,
    lastSaveTime,
    completeOnboarding
  };
};
