
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
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

  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const totalSteps = 4;

  // Auto-save hook
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  // Carregar dados existentes
  const loadExistingData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      console.log('🔄 Carregando dados existentes para usuário:', user.id);

      const { data: existingData, error } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setLoadError(`Erro ao carregar dados: ${error.message}`);
        return;
      }

      if (existingData) {
        console.log('✅ Dados encontrados:', existingData);
        
        // Mapear dados existentes para o estado
        setData({
          name: existingData.name || '',
          email: existingData.email || '',
          whatsapp: existingData.whatsapp || '',
          country_code: existingData.country_code || '+55',
          birth_date: existingData.birth_date || null,
          instagram_url: existingData.instagram_url || null,
          linkedin_url: existingData.linkedin_url || null,
          how_found_us: existingData.how_found_us || '',
          referred_by: existingData.referred_by || null,
          company_name: existingData.company_name || '',
          role: existingData.role || '',
          company_size: existingData.company_size || '',
          company_segment: existingData.company_segment || '',
          company_website: existingData.company_website || null,
          annual_revenue_range: existingData.annual_revenue_range || '',
          main_challenge: existingData.main_challenge || '',
          ai_knowledge_level: existingData.ai_knowledge_level || '',
          uses_ai: existingData.uses_ai || '',
          main_goal: existingData.main_goal || '',
          desired_ai_areas: existingData.desired_ai_areas || [],
          has_implemented: existingData.has_implemented || '',
          previous_tools: existingData.previous_tools || []
        });

        setHasExistingData(true);
        setIsCompleted(existingData.is_completed || false);

        // Determinar step atual baseado nos dados
        if (existingData.is_completed) {
          console.log('✅ Onboarding já concluído');
          setCurrentStep(4);
        } else {
          const step = determineCurrentStep(existingData);
          console.log(`📍 Step atual determinado: ${step}`);
          setCurrentStep(step);
        }
      } else {
        console.log('ℹ️ Nenhum dado existente encontrado');
        setHasExistingData(false);
        setIsCompleted(false);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar dados:', error);
      setLoadError('Erro inesperado ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Determinar step atual baseado nos dados
  const determineCurrentStep = (existingData: any): number => {
    // Step 1: Dados pessoais
    if (!existingData.name || !existingData.email || !existingData.whatsapp || !existingData.how_found_us) {
      return 1;
    }
    
    // Step 2: Dados profissionais
    if (!existingData.company_name || !existingData.role || !existingData.company_size || 
        !existingData.company_segment || !existingData.annual_revenue_range || !existingData.main_challenge) {
      return 2;
    }
    
    // Step 3: Experiência com IA
    if (!existingData.ai_knowledge_level || !existingData.uses_ai || !existingData.main_goal) {
      return 3;
    }
    
    // Step 4: Finalização
    return 4;
  };

  // Carregar dados na inicialização
  useEffect(() => {
    if (user?.id) {
      loadExistingData();
    }
  }, [user?.id, loadExistingData]);

  // Função para atualizar campo
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    console.log(`📝 Atualizando campo ${field}:`, value);
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Validação de step
  const canProceed = useCallback((): boolean => {
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

  // Navegar para próximo step
  const nextStep = useCallback(() => {
    if (canProceed() && currentStep < totalSteps) {
      const newStep = currentStep + 1;
      console.log(`➡️ Avançando para step ${newStep}`);
      setCurrentStep(newStep);
    }
  }, [currentStep, canProceed]);

  // Navegar para step anterior
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      console.log(`⬅️ Retornando para step ${newStep}`);
      setCurrentStep(newStep);
    }
  }, [currentStep]);

  // Finalizar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ Usuário não encontrado');
      return false;
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      setRetryCount(attempt);
      
      try {
        console.log(`🎯 Tentativa ${attempt}/${maxRetries} de finalização do onboarding`);

        // Preparar payload limpo para quick_onboarding (sem campos inválidos)
        const cleanPayload = {
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
          // Removido: updated_at (será tratado pelo trigger)
        };

        console.log('📤 Payload de finalização:', JSON.stringify(cleanPayload, null, 2));

        // Fazer upsert na tabela quick_onboarding
        const { error: quickError } = await supabase
          .from('quick_onboarding')
          .upsert(cleanPayload, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (quickError) {
          console.error(`❌ Erro na tentativa ${attempt} - quick_onboarding:`, quickError);
          if (attempt === maxRetries) {
            throw quickError;
          }
          // Delay progressivo antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }

        console.log('✅ quick_onboarding atualizado com sucesso');

        // Atualizar onboarding_progress para compatibilidade (sem campo 'name')
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
          current_step: 'completed',
          completed_steps: ['personal_info', 'professional_info', 'ai_experience', 'business_goals'],
          is_completed: true,
          // Campos top-level para compatibilidade (SEM 'name')
          company_name: data.company_name || '',
          company_size: data.company_size || '',
          company_sector: data.company_segment || '',
          company_website: data.company_website || '',
          current_position: data.role || '',
          annual_revenue: data.annual_revenue_range || ''
          // Removido: updated_at (será tratado pelo trigger)
        };

        const { error: progressError } = await supabase
          .from('onboarding_progress')
          .upsert(progressPayload, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (progressError) {
          console.warn('⚠️ Erro ao atualizar onboarding_progress (não crítico):', progressError);
        } else {
          console.log('✅ onboarding_progress atualizado');
        }

        // Marcar como concluído localmente
        setIsCompleted(true);
        console.log('🎉 Onboarding finalizado com sucesso!');
        
        return true;

      } catch (error: any) {
        console.error(`❌ Erro na tentativa ${attempt}:`, error);
        
        if (attempt === maxRetries) {
          console.error('❌ Todas as tentativas falharam');
          return false;
        }
        
        // Delay progressivo antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    return false;
  }, [user?.id, data]);

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
