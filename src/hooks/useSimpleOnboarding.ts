import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Tipos simplificados - mantendo compatibilidade
export interface OnboardingData {
  id?: string;
  user_id: string;
  
  // 5 objetos principais unificados
  personal_info: {
    name?: string;
    email?: string;
    phone?: string;
    instagram?: string;
    linkedin?: string;
    birth_date?: string;
    profile_picture?: string;
    curiosity?: string;
    // Localização integrada
    state?: string;
    city?: string;
    country?: string;
    timezone?: string;
  };
  
  business_info: {
    company_name?: string;
    position?: string;
    business_sector?: string;
    company_size?: string;
    annual_revenue?: string;
    company_website?: string;
  };
  
  ai_experience: {
    has_implemented_ai?: string;
    ai_tools_used?: string[];
    ai_knowledge_level?: string;
    who_will_implement?: string;
    ai_implementation_objective?: string;
    ai_implementation_urgency?: string;
    ai_main_challenge?: string;
  };
  
  goals_info: {
    main_objective?: string;
    area_to_impact?: string;
    expected_result_90_days?: string;
    urgency_level?: string;
    success_metric?: string;
    main_obstacle?: string;
    preferred_support?: string;
    ai_implementation_budget?: string;
  };
  
  personalization: {
    weekly_learning_time?: string;
    best_days?: string[];
    best_periods?: string[];
    content_preference?: string[];
    content_frequency?: string;
    wants_networking?: string;
    community_interaction_style?: string;
    preferred_communication_channel?: string;
    follow_up_type?: string;
    motivation_sharing?: string;
  };
  
  // Campos de controle
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  status: 'in_progress' | 'completed' | 'abandoned';
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  
  // Campos de compatibilidade (mapeados automaticamente)
  location_info?: any;
  preferences?: any;
}

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<OnboardingData>({
    user_id: user?.id || '',
    personal_info: {},
    business_info: {},
    ai_experience: {},
    goals_info: {},
    personalization: {},
    current_step: 1,
    completed_steps: [],
    is_completed: false,
    status: 'in_progress'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataRestored, setDataRestored] = useState(false);

  // **1. FUNÇÃO CORE: Carregar dados**
  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    console.log('🔍 [SIMPLE-ONBOARDING] Carregando dados:', user.id);

    try {
      const { data: result, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (result) {
        // Mapear dados do servidor
        const mappedData: OnboardingData = {
          ...result,
          personal_info: {
            ...result.personal_info,
            // Integrar localização no personal_info
            state: result.personal_info?.state,
            city: result.personal_info?.city,
            country: result.personal_info?.country || 'Brasil',
            timezone: result.personal_info?.timezone || 'America/Sao_Paulo'
          },
          business_info: result.business_info || {},
          ai_experience: result.ai_experience || {},
          goals_info: result.goals_info || {},
          personalization: result.personalization || {},
          // Compatibilidade com campos antigos
          location_info: {
            state: result.personal_info?.state,
            city: result.personal_info?.city,
            country: result.personal_info?.country || 'Brasil',
            timezone: result.personal_info?.timezone || 'America/Sao_Paulo'
          },
          preferences: result.personalization || {},
          completed_steps: result.completed_steps || []
        };

        // Detectar se dados foram restaurados
        const hasPreFilledData = Boolean(
          result.personal_info?.name || 
          result.personal_info?.email || 
          result.business_info?.company_name ||
          result.completed_steps?.length > 0
        );
        
        setDataRestored(hasPreFilledData);
        console.log('✅ [SIMPLE-ONBOARDING] Dados carregados', { hasPreFilledData });
        setData(mappedData);
      } else {
        // Inicializar se não existe
        await initializeOnboarding();
      }
    } catch (error) {
      console.error('❌ [SIMPLE-ONBOARDING] Erro ao carregar:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar seus dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // **2. FUNÇÃO CORE: Inicializar onboarding**
  const initializeOnboarding = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: result, error } = await supabase.rpc('initialize_onboarding_for_user', {
        p_user_id: user.id
      });

      if (error) throw error;

      if (result?.success) {
        await loadData();
        
        if (result.profile_used) {
          setDataRestored(true);
          toast({
            title: "Dados pré-preenchidos! ✨",
            description: "Suas informações foram carregadas automaticamente.",
          });
        }
      }
    } catch (error) {
      console.error('❌ [SIMPLE-ONBOARDING] Erro ao inicializar:', error);
    }
  }, [user?.id, loadData]);

  // **3. FUNÇÃO CORE: Atualizar dados localmente**
  const updateData = useCallback((stepData: Partial<OnboardingData>) => {
    if (isSaving) return;
    
    setData(prev => {
      const updated = {
        ...prev,
        ...stepData,
        personal_info: { ...prev.personal_info, ...stepData.personal_info },
        business_info: { ...prev.business_info, ...stepData.business_info },
        ai_experience: { ...prev.ai_experience, ...stepData.ai_experience },
        goals_info: { ...prev.goals_info, ...stepData.goals_info },
        personalization: { ...prev.personalization, ...stepData.personalization },
        // Manter compatibilidade
        location_info: {
          state: stepData.personal_info?.state || prev.personal_info?.state,
          city: stepData.personal_info?.city || prev.personal_info?.city,
          country: stepData.personal_info?.country || prev.personal_info?.country || 'Brasil',
          timezone: stepData.personal_info?.timezone || prev.personal_info?.timezone || 'America/Sao_Paulo'
        },
        preferences: { ...prev.personalization, ...stepData.personalization },
        updated_at: new Date().toISOString()
      };
      
      return updated;
    });
  }, [isSaving]);

  // **4. FUNÇÃO CORE: Salvar e navegar**
  const saveAndNavigate = useCallback(async (stepData: any, currentStep: number, targetStep: number) => {
    if (isSaving) return false;

    setIsSaving(true);
    console.log('💾 [SIMPLE-ONBOARDING] Salvando step:', currentStep, '->', targetStep);

    try {
      // Preparar dados finais
      const finalData = {
        user_id: user!.id,
        personal_info: { ...data.personal_info, ...stepData.personal_info },
        business_info: { ...data.business_info, ...stepData.business_info },
        ai_experience: { ...data.ai_experience, ...stepData.ai_experience },
        goals_info: { ...data.goals_info, ...stepData.goals_info },
        personalization: { ...data.personalization, ...stepData.personalization },
        current_step: Math.max(targetStep, data.current_step),
        completed_steps: [...new Set([...data.completed_steps, currentStep])],
        is_completed: targetStep > 6,
        status: (targetStep > 6 ? 'completed' : 'in_progress') as 'in_progress' | 'completed' | 'abandoned',
        updated_at: new Date().toISOString(),
        completed_at: targetStep > 6 ? new Date().toISOString() : null
      };

      // Salvar direto no Supabase
      const { error } = await supabase
        .from('onboarding_final')
        .upsert(finalData, { onConflict: 'user_id' });

      if (error) throw error;

      // Atualizar estado local
      setData(prev => ({
        ...prev,
        ...finalData,
        status: finalData.status as 'in_progress' | 'completed' | 'abandoned',
        location_info: {
          state: finalData.personal_info?.state,
          city: finalData.personal_info?.city,
          country: finalData.personal_info?.country || 'Brasil',
          timezone: finalData.personal_info?.timezone || 'America/Sao_Paulo'
        },
        preferences: finalData.personalization
      } as OnboardingData));

      toast({
        title: "Dados salvos! ✅",
        description: `Etapa ${currentStep} concluída.`,
      });

      // Navegar
      if (targetStep <= 6) {
        navigate(`/onboarding/step/${targetStep}`, { replace: true });
      } else {
        toast({
          title: "Onboarding concluído! 🎉",
          description: "Bem-vindo(a) à plataforma!",
        });
        navigate('/dashboard');
      }

      return true;
    } catch (error: any) {
      console.error('❌ [SIMPLE-ONBOARDING] Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: `Problema ao salvar: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, user, navigate, isSaving]);

  // Carregar dados na inicialização
  useEffect(() => {
    if (user?.id && !isLoading) {
      loadData();
    }
  }, [user?.id]);

  // Interface pública (compatível com useCleanOnboarding)
  return {
    data,
    isLoading,
    isSaving,
    updateData,
    saveAndNavigate,
    loadData,
    // Campos de compatibilidade
    dataRestored
  };
};