
import { useState, useEffect, useCallback, useRef } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { toast } from 'sonner';

const TOTAL_STEPS = 4;

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionAttempts, setCompletionAttempts] = useState(0);
  const maxCompletionAttempts = 3;
  
  const [data, setData] = useState<QuickOnboardingData>({
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
    main_goal: '',
    desired_ai_areas: [],
    has_implemented: '',
    previous_tools: []
  });

  // Auto-save hook
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  // Carregar dados existentes
  useEffect(() => {
    if (!user) return;

    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Carregando dados existentes do onboarding...');

        // Verificar quick_onboarding primeiro
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickError && quickError.code !== 'PGRST116') {
          console.error('❌ Erro ao carregar quick_onboarding:', quickError);
          setLoadError('Erro ao carregar dados. Você pode continuar com dados em branco.');
          return;
        }

        if (quickData) {
          console.log('✅ Dados encontrados no quick_onboarding:', quickData);
          
          // Se já foi concluído, marcar como tal
          if (quickData.is_completed) {
            setIsCompleted(true);
            console.log('🎯 Onboarding já foi concluído anteriormente');
          }

          // Converter dados do banco para o formato do formulário
          const convertedData: QuickOnboardingData = {
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
            main_goal: quickData.main_goal || '',
            desired_ai_areas: quickData.desired_ai_areas || [],
            has_implemented: quickData.has_implemented || '',
            previous_tools: quickData.previous_tools || []
          };

          setData(convertedData);
          setHasExistingData(true);

          // Determinar step atual baseado nos dados
          const determinedStep = determineCurrentStep(convertedData);
          if (!quickData.is_completed) {
            setCurrentStep(determinedStep);
          }
        }
      } catch (error: any) {
        console.error('❌ Erro no carregamento:', error);
        setLoadError('Erro ao conectar com o banco de dados. Você pode continuar com dados em branco.');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user]);

  const determineCurrentStep = (formData: QuickOnboardingData): number => {
    if (!formData.name || !formData.email || !formData.whatsapp || !formData.how_found_us) {
      return 1;
    }
    if (!formData.company_name || !formData.role || !formData.company_size || 
        !formData.company_segment || !formData.annual_revenue_range || !formData.main_challenge) {
      return 2;
    }
    if (!formData.ai_knowledge_level || !formData.uses_ai || !formData.main_goal) {
      return 3;
    }
    return 4;
  };

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
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
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  const nextStep = useCallback(() => {
    if (canProceed() && currentStep < TOTAL_STEPS) {
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
      toast.error('Erro de autenticação. Por favor, faça login novamente.');
      return false;
    }

    if (completionAttempts >= maxCompletionAttempts) {
      console.error('❌ Número máximo de tentativas excedido');
      toast.error('Falha após múltiplas tentativas. Entre em contato com o suporte.');
      return false;
    }

    try {
      setCompletionAttempts(prev => prev + 1);
      console.log(`🎯 Tentativa ${completionAttempts + 1}/${maxCompletionAttempts} de finalização do onboarding...`);

      // Delay progressivo entre tentativas
      if (completionAttempts > 0) {
        const delay = Math.min(1000 * Math.pow(2, completionAttempts), 5000);
        console.log(`⏳ Aguardando ${delay}ms antes da tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Preparar dados limpos para quick_onboarding (sem campos inválidos)
      const quickOnboardingPayload = {
        user_id: user.id,
        name: data.name || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        country_code: data.country_code || '+55',
        birth_date: data.birth_date || null,
        instagram_url: data.instagram_url || null,
        linkedin_url: data.linkedin_url || null,
        how_found_us: data.how_found_us || '',
        referred_by: data.referred_by || null,
        company_name: data.company_name || '',
        role: data.role || '',
        company_size: data.company_size || '',
        company_segment: data.company_segment || '',
        company_website: data.company_website || null,
        annual_revenue_range: data.annual_revenue_range || '',
        main_challenge: data.main_challenge || '',
        ai_knowledge_level: data.ai_knowledge_level || '',
        uses_ai: data.uses_ai || '',
        main_goal: data.main_goal || '',
        desired_ai_areas: data.desired_ai_areas || [],
        has_implemented: data.has_implemented || '',
        previous_tools: data.previous_tools || [],
        is_completed: true
        // Removido updated_at - será tratado pelo trigger
      };

      console.log('📤 Salvando no quick_onboarding:', quickOnboardingPayload);

      // Usar upsert para quick_onboarding
      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .upsert(quickOnboardingPayload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (quickError) {
        console.error('❌ Erro no quick_onboarding:', quickError);
        throw quickError;
      }

      console.log('✅ quick_onboarding salvo com sucesso');

      // Preparar dados para onboarding_progress (sem campos inválidos como 'name')
      const progressPayload = {
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
        // Campos top-level para compatibilidade
        company_name: data.company_name || '',
        company_size: data.company_size || '',
        company_sector: data.company_segment || '',
        company_website: data.company_website || '',
        current_position: data.role || '',
        annual_revenue: data.annual_revenue_range || ''
        // Removido name e updated_at - serão tratados pelo trigger
      };

      console.log('📤 Salvando no onboarding_progress...');

      // Salvar em onboarding_progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert(progressPayload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (progressError) {
        console.error('❌ Erro no onboarding_progress:', progressError);
        throw progressError;
      }

      console.log('✅ onboarding_progress salvo com sucesso');

      // Atualizar profiles apenas com campos que existem (SEM updated_at)
      const profilePayload = {
        company_name: data.company_name || null,
        industry: data.company_segment || null
        // Removido updated_at - essa coluna não existe na tabela profiles
      };

      console.log('📤 Atualizando profiles...');

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('id', user.id);

      if (profileError) {
        console.error('⚠️ Erro ao atualizar profiles (não crítico):', profileError);
        // Não falhar a operação por erro no profiles
      } else {
        console.log('✅ Profiles atualizado com sucesso');
      }

      // Marcar como concluído localmente
      setIsCompleted(true);
      setCompletionAttempts(0); // Reset contador de tentativas
      
      console.log('🎉 Onboarding finalizado com sucesso!');
      return true;

    } catch (error: any) {
      console.error(`❌ Erro na tentativa ${completionAttempts + 1}:`, error);
      
      if (completionAttempts + 1 >= maxCompletionAttempts) {
        toast.error('Falha ao finalizar onboarding após múltiplas tentativas. Entre em contato com o suporte.');
      } else {
        toast.error(`Erro na finalização. Tentativa ${completionAttempts + 1}/${maxCompletionAttempts}`);
      }
      
      return false;
    }
  }, [user, data, completionAttempts, maxCompletionAttempts]);

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
    totalSteps: TOTAL_STEPS,
    isSaving,
    lastSaveTime,
    completeOnboarding,
    isCompleted
  };
};
