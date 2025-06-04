
import { useState, useEffect, useCallback } from 'react';
import { QuickOnboardingData, adaptOnboardingStateToQuickData } from '@/types/quickOnboarding';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useQuickOnboardingAutoSave } from './useQuickOnboardingAutoSave';
import { toast } from 'sonner';

const INITIAL_DATA: QuickOnboardingData = {
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
};

export const useQuickOnboardingOptimized = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<QuickOnboardingData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { isSaving, lastSaveTime } = useQuickOnboardingAutoSave(data);

  const totalSteps = 4;

  // Carregar dados existentes
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Carregando dados existentes do onboarding...');
        
        // Buscar dados do quick_onboarding
        const { data: quickData, error: quickError } = await supabase
          .from('quick_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quickError && quickError.code !== 'PGRST116') {
          console.error('❌ Erro ao carregar quick_onboarding:', quickError);
          setLoadError('Erro ao carregar dados salvos');
          setIsLoading(false);
          return;
        }

        if (quickData) {
          console.log('✅ Dados do quick_onboarding carregados:', quickData);
          
          // Verificar se está completo
          if (quickData.is_completed) {
            console.log('🎉 Onboarding já está concluído!');
            setIsCompleted(true);
            setIsLoading(false);
            return;
          }

          // Adaptar dados carregados
          const adaptedData = {
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

          setData(adaptedData);
          setHasExistingData(true);
          
          // Determinar etapa atual baseada nos dados
          if (adaptedData.name && adaptedData.email && adaptedData.whatsapp && adaptedData.how_found_us) {
            if (adaptedData.company_name && adaptedData.role && adaptedData.company_size && adaptedData.company_segment && adaptedData.annual_revenue_range && adaptedData.main_challenge) {
              if (adaptedData.ai_knowledge_level && adaptedData.uses_ai && adaptedData.main_goal) {
                setCurrentStep(4); // Todas as etapas completas, ir para finalização
              } else {
                setCurrentStep(3); // Ir para experiência com IA
              }
            } else {
              setCurrentStep(2); // Ir para dados profissionais
            }
          } else {
            setCurrentStep(1); // Dados pessoais incompletos
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setLoadError('Erro ao carregar dados salvos');
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  const updateField = useCallback((field: keyof QuickOnboardingData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
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
        return !!(data.company_name && data.role && data.company_size && data.company_segment && data.annual_revenue_range && data.main_challenge);
      case 3:
        return !!(data.ai_knowledge_level && data.uses_ai && data.main_goal);
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ Usuário não encontrado');
      return false;
    }

    const attemptCompletion = async (attempt: number): Promise<boolean> => {
      console.log(`🎯 Tentativa ${attempt} de finalização do onboarding...`);
      
      try {
        // Preparar payload limpo para quick_onboarding (REMOVENDO campos que causam erro)
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
          // REMOVIDO: updated_at (será tratado pelo trigger)
        };

        console.log('📤 Payload para quick_onboarding (tentativa ' + attempt + '):', {
          user_id: quickOnboardingPayload.user_id,
          name: quickOnboardingPayload.name,
          email: quickOnboardingPayload.email,
          company_name: quickOnboardingPayload.company_name,
          is_completed: quickOnboardingPayload.is_completed
        });

        // Salvar em quick_onboarding
        const { error: quickError } = await supabase
          .from('quick_onboarding')
          .upsert(quickOnboardingPayload, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (quickError) {
          console.error(`❌ Erro quick_onboarding (tentativa ${attempt}):`, quickError);
          throw quickError;
        }

        console.log(`✅ quick_onboarding salvo com sucesso (tentativa ${attempt})`);

        // Salvar em onboarding_progress para compatibilidade (SEM campo 'name')
        const progressPayload = {
          user_id: user.id,
          personal_info: {
            email: data.email,
            phone: data.whatsapp,
            ddi: data.country_code,
            linkedin: data.linkedin_url,
            instagram: data.instagram_url
            // REMOVIDO: name (não existe na tabela)
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
          // Campos top-level para compatibilidade (SEM 'name')
          company_name: data.company_name || '',
          company_size: data.company_size || '',
          company_sector: data.company_segment || '',
          company_website: data.company_website || '',
          current_position: data.role || '',
          annual_revenue: data.annual_revenue_range || ''
          // REMOVIDO: updated_at (será tratado pelo trigger)
        };

        const { error: progressError } = await supabase
          .from('onboarding_progress')
          .upsert(progressPayload, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          });

        if (progressError) {
          console.error(`❌ Erro onboarding_progress (tentativa ${attempt}):`, progressError);
          throw progressError;
        }

        console.log(`✅ onboarding_progress salvo com sucesso (tentativa ${attempt})`);

        // Atualizar perfil do usuário (SEM campo 'updated_at')
        const profilePayload = {
          name: data.name,
          company_name: data.company_name,
          industry: data.company_segment
          // REMOVIDO: updated_at (campo não existe na tabela profiles)
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('id', user.id);

        if (profileError) {
          console.error(`❌ Erro ao atualizar profile (tentativa ${attempt}):`, profileError);
          // Não falhar por causa do profile, pois os dados principais já foram salvos
        } else {
          console.log(`✅ Profile atualizado com sucesso (tentativa ${attempt})`);
        }

        setIsCompleted(true);
        return true;

      } catch (error: any) {
        console.error(`❌ Erro na tentativa ${attempt}:`, error);
        setRetryCount(attempt);
        
        // Mostrar toasts diferentes para cada tentativa
        if (attempt === 1) {
          toast.error('Erro na primeira tentativa. Tentando novamente...');
        } else if (attempt === 2) {
          toast.error('Segunda tentativa falhou. Última tentativa...');
        } else if (attempt === 3) {
          toast.error('Todas as tentativas falharam. Tente novamente mais tarde.');
        }
        
        return false;
      }
    };

    // Sistema de retry com delays progressivos
    for (let attempt = 1; attempt <= 3; attempt++) {
      const success = await attemptCompletion(attempt);
      if (success) {
        setRetryCount(0);
        return true;
      }
      
      // Delay progressivo entre tentativas (1s, 2s, 3s)
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    return false;
  }, [user, data]);

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
