import { useState, useCallback } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useOnboardingValidation } from './useOnboardingValidation';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [data, setData] = useState<QuickOnboardingData>({
    name: '',
    email: '',
    whatsapp: '',
    country_code: '',
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
    previous_tools: [],
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const totalSteps = 4;

  const { validateAllSteps } = useOnboardingValidation();
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: onboardingData, error } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar dados:', error);
          setLoadError('Erro ao carregar seus dados. Tente novamente.');
          setIsLoading(false);
          return;
        }

        if (onboardingData) {
          setData(onboardingData);
          setHasExistingData(true);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setLoadError('Erro ao carregar seus dados. Tente novamente.');
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user?.id]);

  const updateField = useCallback((fieldName: keyof QuickOnboardingData, value: any) => {
    setData(prevData => ({ ...prevData, [fieldName]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prevStep => Math.min(prevStep + 1, totalSteps));
  }, [totalSteps]);

  const previousStep = useCallback(() => {
    setCurrentStep(prevStep => Math.max(prevStep - 1, 1));
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.name && data.email && data.whatsapp && data.how_found_us);
      case 2:
        return !!(data.company_name && data.role && data.company_size && 
                  data.company_segment && data.annual_revenue_range && data.main_challenge);
      case 3:
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      default:
        return true;
    }
  }, [currentStep, data]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ Usuário não autenticado');
      toast.error('Erro: usuário não autenticado');
      return false;
    }

    try {
      console.log('🎯 Iniciando finalização do onboarding...');
      
      // Validar se todas as etapas estão completas
      const isValid = validateAllSteps(data);
      if (!isValid) {
        console.error('❌ Dados do onboarding incompletos');
        toast.error('Por favor, complete todas as etapas antes de finalizar');
        return false;
      }

      // Verificar se existe registro na tabela onboarding_progress
      const { data: existingProgress, error: fetchError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar progresso existente:', fetchError);
        throw fetchError;
      }

      // Preparar dados APENAS com campos válidos da tabela onboarding_progress
      const progressData = {
        user_id: user.id,
        current_step: 'completed',
        is_completed: true,
        completed_steps: ['personal_info', 'professional_info', 'ai_experience', 'trail_generation'],
        personal_info: {
          name: data.name || '',
          email: data.email || '',
          phone: data.whatsapp || '',
          ddi: data.country_code || '',
          linkedin: data.linkedin_url || '',
          instagram: data.instagram_url || ''
        },
        professional_info: {
          company_name: data.company_name || '',
          company_size: data.company_size || '',
          company_sector: data.company_segment || '',
          company_website: data.company_website || '',
          current_position: data.role || '',
          annual_revenue: data.annual_revenue_range || ''
        },
        business_goals: {
          primary_goal: data.main_goal || '',
          expected_outcomes: data.desired_ai_areas || []
        },
        ai_experience: {
          knowledge_level: data.ai_knowledge_level || '',
          previous_tools: data.previous_tools || [],
          has_implemented: data.has_implemented || 'nao',
          desired_ai_areas: data.desired_ai_areas || [],
          uses_ai: data.uses_ai || ''
        },
        complementary_info: {
          how_found_us: data.how_found_us || '',
          referred_by: data.referred_by || ''
        },
        business_context: {},
        experience_personalization: {},
        updated_at: new Date().toISOString()
      };

      let progressResult;

      if (existingProgress) {
        // Atualizar registro existente
        console.log('📝 Atualizando registro existente de onboarding_progress...');
        const { data: updateResult, error: updateError } = await supabase
          .from('onboarding_progress')
          .update(progressData)
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (updateError) throw updateError;
        progressResult = updateResult;
      } else {
        // Criar novo registro
        console.log('✨ Criando novo registro de onboarding_progress...');
        const { data: insertResult, error: insertError } = await supabase
          .from('onboarding_progress')
          .insert([{ ...progressData, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (insertError) throw insertError;
        progressResult = insertResult;
      }

      // Atualizar quick_onboarding como concluído
      console.log('📝 Atualizando quick_onboarding como concluído...');
      const { error: quickUpdateError } = await supabase
        .from('quick_onboarding')
        .update({ 
          is_completed: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id);

      if (quickUpdateError) {
        console.warn('⚠️ Erro ao atualizar quick_onboarding:', quickUpdateError);
        // Não falhar por causa disso, pois o principal já foi salvo
      }

      console.log('✅ Onboarding finalizado com sucesso!', progressResult);
      toast.success('Onboarding concluído com sucesso!');
      
      return true;

    } catch (error: any) {
      console.error('❌ Erro na finalização do onboarding:', error);
      
      // Retry uma vez em caso de erro de rede
      try {
        console.log('🔄 Tentativa de retry...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Preparar dados simplificados para retry
        const retryData = {
          user_id: user.id,
          current_step: 'completed',
          is_completed: true,
          completed_steps: ['personal_info', 'professional_info', 'ai_experience', 'trail_generation'],
          personal_info: { name: data.name || '', email: data.email || '' },
          professional_info: { company_name: data.company_name || '' },
          business_goals: { primary_goal: data.main_goal || '' },
          ai_experience: { knowledge_level: data.ai_knowledge_level || '' },
          complementary_info: { how_found_us: data.how_found_us || '' },
          business_context: {},
          experience_personalization: {},
          updated_at: new Date().toISOString()
        };

        const { error: retryError } = await supabase
          .from('onboarding_progress')
          .upsert(retryData, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (retryError) throw retryError;
        
        console.log('✅ Retry bem-sucedido!');
        toast.success('Onboarding concluído com sucesso!');
        return true;
        
      } catch (retryError) {
        console.error('❌ Erro no retry:', retryError);
        toast.error('Erro ao finalizar onboarding. Tente novamente.');
        return false;
      }
    }
  }, [user, data, validateAllSteps, supabase]);

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
    totalSteps,
    isSaving,
    lastSaveTime,
    completeOnboarding
  };
};
