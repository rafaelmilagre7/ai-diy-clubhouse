
import { useState, useEffect, useCallback, useRef } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { OnboardingValidator } from '@/utils/onboardingValidation';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [data, setData] = useState<QuickOnboardingData>({
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const loadAttempted = useRef(false);
  
  const totalSteps = 4;

  // Auto-save hook
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  // Função para sanitizar payload rigorosamente
  const sanitizePayload = (payload: any): any => {
    console.log('🧹 Sanitizando payload antes do envio');
    console.log('📥 Payload original:', JSON.stringify(payload, null, 2));
    
    const clean = { ...payload };
    
    // Lista rigorosa de campos que NUNCA devem existir
    const forbiddenFields = [
      'updated_at', 'created_at', 'id', 'user_id', 
      'name', // Este campo aparentemente não existe na tabela
      'profiles', 'auth', 'metadata'
    ];
    
    forbiddenFields.forEach(field => {
      if (field in clean) {
        console.log(`❌ Removendo campo proibido: ${field}`);
        delete clean[field];
      }
    });
    
    // Remove campos undefined/null/vazios
    Object.keys(clean).forEach(key => {
      if (clean[key] === undefined || clean[key] === null || clean[key] === '') {
        console.log(`❌ Removendo campo vazio: ${key}`);
        delete clean[key];
      }
    });

    console.log('✅ Payload sanitizado final:', JSON.stringify(clean, null, 2));
    return clean;
  };

  // Carregar dados existentes
  useEffect(() => {
    if (!user || loadAttempted.current) return;
    
    const loadExistingData = async () => {
      loadAttempted.current = true;
      setIsLoading(true);
      console.log('📥 Carregando dados existentes do onboarding...');

      try {
        // Verificar dados em quick_onboarding
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickError && quickError.code !== 'PGRST116') {
          console.error('❌ Erro ao carregar quick_onboarding:', quickError);
          throw quickError;
        }

        if (quickData) {
          console.log('✅ Dados encontrados em quick_onboarding:', quickData);
          
          if (quickData.is_completed) {
            console.log('🎯 Onboarding já está marcado como concluído');
            setIsCompleted(true);
            setCurrentStep(4);
          }

          // Mapear dados para o estado
          setData({
            name: quickData.name || '',
            email: quickData.email || '',
            whatsapp: quickData.whatsapp || '',
            country_code: quickData.country_code || '+55',
            birth_date: quickData.birth_date || null,
            instagram_url: quickData.instagram_url || null,
            linkedin_url: quickData.linkedin_url || null,
            how_found_us: quickData.how_found_us || '',
            referred_by: quickData.referred_by || null,
            company_name: quickData.company_name || '',
            role: quickData.role || '',
            company_size: quickData.company_size || '',
            company_segment: quickData.company_segment || '',
            company_website: quickData.company_website || null,
            annual_revenue_range: quickData.annual_revenue_range || '',
            main_challenge: quickData.main_challenge || '',
            ai_knowledge_level: quickData.ai_knowledge_level || '',
            uses_ai: quickData.uses_ai || '',
            main_goal: quickData.main_goal || '',
            desired_ai_areas: quickData.desired_ai_areas || [],
            has_implemented: quickData.has_implemented || '',
            previous_tools: quickData.previous_tools || []
          });

          setHasExistingData(true);
          
          // Determinar step atual baseado nos dados
          const determineStep = () => {
            if (!quickData.name || !quickData.email || !quickData.whatsapp || !quickData.how_found_us) {
              return 1;
            }
            if (!quickData.company_name || !quickData.role || !quickData.company_size || !quickData.company_segment || !quickData.annual_revenue_range || !quickData.main_challenge) {
              return 2;
            }
            if (!quickData.ai_knowledge_level || !quickData.uses_ai || !quickData.main_goal) {
              return 3;
            }
            return quickData.is_completed ? 4 : 4; // Se todos os dados estão preenchidos, vai para finalização
          };

          setCurrentStep(determineStep());
        }

      } catch (error: any) {
        console.error('❌ Erro ao carregar dados:', error);
        setLoadError(error.message || 'Erro ao carregar dados do onboarding');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user]);

  // Função para finalizar onboarding
  const completeOnboarding = async (): Promise<boolean> => {
    if (!user) {
      console.error('❌ Usuário não encontrado');
      return false;
    }

    console.log('🎯 Iniciando finalização do onboarding...');

    try {
      // Preparar dados limpos para quick_onboarding
      const quickOnboardingPayload = sanitizePayload({
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
      });

      console.log('📤 Enviando para quick_onboarding...');
      
      const { error: quickError } = await supabase
        .from('quick_onboarding')
        .upsert(quickOnboardingPayload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (quickError) {
        console.error('❌ Erro ao salvar em quick_onboarding:', quickError);
        
        // Se erro 400, não fazer retry
        if (quickError.code === '42703' || quickError.message?.includes('does not exist')) {
          console.error('❌ Erro estrutural detectado - payload inválido');
          setRetryCount(prev => prev + 1);
          return false;
        }
        
        throw quickError;
      }

      console.log('✅ quick_onboarding salvo com sucesso');

      // Também salvar em onboarding_progress para compatibilidade
      await saveToOnboardingProgress();

      setIsCompleted(true);
      console.log('🎉 Onboarding finalizado com sucesso!');
      return true;

    } catch (error: any) {
      console.error('❌ Erro na finalização:', error);
      setRetryCount(prev => prev + 1);
      return false;
    }
  };

  // Função auxiliar para salvar em onboarding_progress
  const saveToOnboardingProgress = async () => {
    try {
      const progressPayload = sanitizePayload({
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
      });

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert(progressPayload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('⚠️ Erro ao salvar em onboarding_progress:', error);
      } else {
        console.log('✅ onboarding_progress salvo');
      }
    } catch (error) {
      console.error('⚠️ Erro ao salvar em onboarding_progress:', error);
    }
  };

  // Função para avançar etapa
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  // Função para voltar etapa
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Função para validar se pode prosseguir
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return OnboardingValidator.validateStep1(data).isValid;
      case 2:
        return OnboardingValidator.validateStep2(data).isValid;
      case 3:
        return OnboardingValidator.validateStep3(data).isValid;
      default:
        return OnboardingValidator.validateAllSteps(data).isValid;
    }
  }, [currentStep, data]);

  // Função para atualizar dados
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

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
    completeOnboarding,
    isCompleted,
    retryCount
  };
};
