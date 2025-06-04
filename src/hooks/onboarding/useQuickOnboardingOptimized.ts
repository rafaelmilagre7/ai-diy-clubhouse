
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { toast } from 'sonner';

const TOTAL_STEPS = 4;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 segundo

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>({} as QuickOnboardingData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const retryAttemptRef = useRef(0);

  // Auto-save functionality
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  // Load existing data
  const loadExistingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      // Primeiro verificar quick_onboarding
      const { data: quickData, error: quickError } = await supabase
        .from('quick_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (quickError && quickError.code !== 'PGRST116') {
        console.error('Erro ao carregar quick_onboarding:', quickError);
        throw new Error(`Erro no banco: ${quickError.message}`);
      }

      if (quickData) {
        console.log('✅ Dados do quick_onboarding carregados:', quickData);
        
        if (quickData.is_completed) {
          setIsCompleted(true);
          setData(quickData);
          setHasExistingData(true);
          return;
        }

        // Carregar dados existentes
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
        console.log('📊 Dados existentes carregados com sucesso');
      } else {
        console.log('📝 Nenhum dado existente encontrado, iniciando do zero');
        setHasExistingData(false);
      }

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setLoadError(error.message || 'Erro ao carregar dados do onboarding');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Update field
  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    console.log(`🔄 Atualizando campo: ${field} =`, value);
    setData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📊 Estado atualizado:', updated);
      return updated;
    });
  }, []);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      const newStep = currentStep + 1;
      console.log(`➡️ Avançando para etapa ${newStep}`);
      setCurrentStep(newStep);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      console.log(`⬅️ Retornando para etapa ${newStep}`);
      setCurrentStep(newStep);
    }
  }, [currentStep]);

  // Validation logic
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

  // Complete onboarding with retry logic
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ Usuário não encontrado');
      return false;
    }

    const attemptCompletion = async (attempt: number): Promise<boolean> => {
      try {
        console.log(`🎯 Tentativa ${attempt}/${MAX_RETRY_ATTEMPTS} de finalizar onboarding...`);

        // Preparar dados para quick_onboarding (sem campos inválidos)
        const quickOnboardingPayload = {
          user_id: user.id,
          name: data.name || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
          country_code: data.country_code || '+55',
          birth_date: data.birth_date,
          instagram_url: data.instagram_url,
          linkedin_url: data.linkedin_url,
          how_found_us: data.how_found_us || '',
          referred_by: data.referred_by,
          company_name: data.company_name || '',
          role: data.role || '',
          company_size: data.company_size || '',
          company_segment: data.company_segment || '',
          company_website: data.company_website,
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

        console.log('📤 Payload para quick_onboarding:', quickOnboardingPayload);

        // Salvar/atualizar quick_onboarding
        const { error: quickError } = await supabase
          .from('quick_onboarding')
          .upsert(quickOnboardingPayload, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (quickError) {
          console.error('❌ Erro ao salvar quick_onboarding:', quickError);
          throw new Error(`Erro na tabela quick_onboarding: ${quickError.message}`);
        }

        console.log('✅ quick_onboarding salvo com sucesso');

        // Preparar dados para onboarding_progress (sem campos inválidos)
        const progressPayload = {
          user_id: user.id,
          personal_info: {
            email: data.email || '',
            phone: data.whatsapp || '',
            ddi: data.country_code || '+55',
            linkedin: data.linkedin_url,
            instagram: data.instagram_url,
            birth_date: data.birth_date
          },
          professional_info: {
            company_name: data.company_name || '',
            current_position: data.role || '',
            company_size: data.company_size || '',
            company_sector: data.company_segment || '',
            company_website: data.company_website,
            annual_revenue: data.annual_revenue_range || ''
          },
          ai_experience: {
            knowledge_level: data.ai_knowledge_level || '',
            previous_tools: data.previous_tools || [],
            desired_ai_areas: data.desired_ai_areas || [],
            has_implemented: data.has_implemented || '',
            uses_ai: data.uses_ai || ''
          },
          business_goals: {
            primary_goal: data.main_goal || '',
            expected_outcomes: []
          },
          business_context: {
            business_challenges: data.main_challenge ? [data.main_challenge] : []
          },
          complementary_info: {
            how_found_us: data.how_found_us || '',
            referred_by: data.referred_by
          },
          experience_personalization: {},
          current_step: 'completed',
          completed_steps: ['personal_info', 'professional_info', 'ai_experience', 'business_goals'],
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

        console.log('📤 Payload para onboarding_progress:', progressPayload);

        // Salvar/atualizar onboarding_progress
        const { error: progressError } = await supabase
          .from('onboarding_progress')
          .upsert(progressPayload, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (progressError) {
          console.error('❌ Erro ao salvar onboarding_progress:', progressError);
          throw new Error(`Erro na tabela onboarding_progress: ${progressError.message}`);
        }

        console.log('✅ onboarding_progress salvo com sucesso');

        // Atualizar perfil do usuário (apenas campos válidos)
        const profilePayload = {
          // Removido updated_at - coluna não existe na tabela profiles
          company_name: data.company_name || null,
          industry: data.company_segment || null
        };

        console.log('📤 Payload para profiles:', profilePayload);

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('id', user.id);

        if (profileError) {
          console.warn('⚠️ Erro ao atualizar perfil (não crítico):', profileError);
          // Não falhar por causa do perfil - continuar
        } else {
          console.log('✅ Perfil atualizado com sucesso');
        }

        // Sucesso
        setIsCompleted(true);
        retryAttemptRef.current = 0; // Reset contador
        return true;

      } catch (error: any) {
        console.error(`❌ Tentativa ${attempt} falhou:`, error);
        
        if (attempt < MAX_RETRY_ATTEMPTS) {
          console.log(`🔄 Tentando novamente em ${RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
          return attemptCompletion(attempt + 1);
        } else {
          console.error('❌ Todas as tentativas falharam');
          throw error;
        }
      }
    };

    try {
      return await attemptCompletion(1);
    } catch (error: any) {
      console.error('❌ Falha definitiva na finalização:', error);
      toast.error(`Erro ao finalizar onboarding: ${error.message}`);
      return false;
    }
  }, [user?.id, data]);

  // Load data on mount
  useEffect(() => {
    if (user?.id) {
      loadExistingData();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, loadExistingData]);

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
