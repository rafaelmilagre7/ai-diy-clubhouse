
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { toast } from 'sonner';

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const totalSteps = 4;

  // Auto-save functionality
  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) return;

      try {
        console.log('🔍 Carregando dados existentes do usuário:', user.id);
        
        // Verificar se já está completo
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
          console.log('✅ Dados encontrados no quick_onboarding:', quickData);
          
          // Verificar se está completo
          if (quickData.is_completed) {
            setIsCompleted(true);
            console.log('🎯 Onboarding já está completo');
          }

          // Mapear dados do banco para o estado
          const mappedData: QuickOnboardingData = {
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

          setData(mappedData);
          setHasExistingData(true);
          
          // Determinar o step atual baseado nos dados
          if (!quickData.is_completed) {
            const step = determineCurrentStep(mappedData);
            setCurrentStep(step);
          }
        } else {
          console.log('ℹ️ Nenhum dado anterior encontrado, começando do zero');
        }

      } catch (error: any) {
        console.error('❌ Erro ao carregar dados:', error);
        setLoadError(error.message || 'Erro ao carregar dados anteriores');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

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
      console.error('❌ Usuário não encontrado');
      return false;
    }

    // Implementar retry com delay progressivo
    const maxRetries = 3;
    const baseDelay = 1000; // 1 segundo

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🎯 Tentativa ${attempt}/${maxRetries} de finalizar onboarding...`);
        
        // Preparar dados limpos para quick_onboarding (SEM campos inválidos)
        const quickOnboardingData = {
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
          // REMOVIDO: updated_at (será tratado pelo trigger)
        };

        console.log('📤 Salvando quick_onboarding...');
        const { error: quickError } = await supabase
          .from('quick_onboarding')
          .upsert(quickOnboardingData, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (quickError) {
          console.error('❌ Erro ao salvar quick_onboarding:', quickError);
          throw quickError;
        }

        console.log('✅ quick_onboarding salvo com sucesso');

        // Salvar em onboarding_progress para compatibilidade (SEM campos inválidos)
        const progressData = {
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
          // REMOVIDO: name (não existe na tabela)
          // REMOVIDO: updated_at (será tratado pelo trigger)
        };

        console.log('📤 Salvando onboarding_progress...');
        const { error: progressError } = await supabase
          .from('onboarding_progress')
          .upsert(progressData, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (progressError) {
          console.error('❌ Erro ao salvar onboarding_progress:', progressError);
          throw progressError;
        }

        console.log('✅ onboarding_progress salvo com sucesso');

        // Atualizar profiles (SEM campos inválidos)
        const profileUpdateData = {
          name: data.name || '',
          company_name: data.company_name || '',
          industry: data.company_segment || ''
          // REMOVIDO: updated_at (não existe na tabela profiles)
        };

        console.log('📤 Atualizando profile...');
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdateData)
          .eq('id', user.id);

        if (profileError) {
          console.error('❌ Erro ao atualizar profile:', profileError);
          // Não falha por erro no profile, continua
        } else {
          console.log('✅ Profile atualizado com sucesso');
        }

        // Sucesso - marcar como completo no estado
        setIsCompleted(true);
        setRetryCount(0);
        
        console.log('🎉 Onboarding finalizado com sucesso!');
        return true;

      } catch (error: any) {
        console.error(`❌ Tentativa ${attempt} falhou:`, error);
        
        if (attempt === maxRetries) {
          // Última tentativa falhou
          setRetryCount(maxRetries);
          toast.error(`Erro ao finalizar onboarding após ${maxRetries} tentativas. Tente novamente.`);
          return false;
        } else {
          // Delay progressivo antes da próxima tentativa
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
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

// Função auxiliar para determinar o step atual baseado nos dados
const determineCurrentStep = (data: QuickOnboardingData): number => {
  if (!data.name || !data.email || !data.whatsapp || !data.how_found_us) {
    return 1;
  }
  if (!data.company_name || !data.role || !data.company_size || !data.company_segment || !data.annual_revenue_range || !data.main_challenge) {
    return 2;
  }
  if (!data.ai_knowledge_level || !data.uses_ai || !data.main_goal) {
    return 3;
  }
  return 4;
};
