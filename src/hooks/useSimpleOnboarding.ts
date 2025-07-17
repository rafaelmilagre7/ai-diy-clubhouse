import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Tipos simplificados para o novo onboarding
export interface SimpleOnboardingData {
  id?: string;
  user_id: string;
  
  // Step 1: Dados pessoais
  personal_info: {
    name?: string;
    email?: string;
    phone?: string;
    profile_picture?: string;
  };
  
  // Step 2: Contexto empresarial (opcional)
  business_info: {
    company_name?: string;
    position?: string;
    company_sector?: string;
    company_size?: string;
  };
  
  // Step 3: Experiência com IA
  ai_experience: {
    ai_knowledge_level?: string;
    has_implemented_ai?: string;
    ai_tools_used?: string[];
  };
  
  // Step 4: Objetivos
  goals_info: {
    main_objective?: string;
    expected_result_90_days?: string;
    urgency_level?: string;
  };
  
  // Step 5: Personalização
  personalization: {
    content_preference?: string[];
    weekly_learning_time?: string;
    preferred_communication_channel?: string;
  };
  
  // Controle de etapas
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  status: 'in_progress' | 'completed';
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState<SimpleOnboardingData>({
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

  // Carregar dados na inicialização
  useEffect(() => {
    if (user?.id) {
      loadOnboardingData();
    }
  }, [user?.id]);

  const loadOnboardingData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data: onboardingData, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (onboardingData) {
        // Estruturar dados do servidor
        const serverData: SimpleOnboardingData = {
          ...onboardingData,
          personal_info: onboardingData.personal_info || {},
          business_info: onboardingData.business_info || {},
          ai_experience: onboardingData.ai_experience || {},
          goals_info: onboardingData.goals_info || {},
          personalization: onboardingData.personalization || {},
          completed_steps: onboardingData.completed_steps || [],
        };
        
        setData(serverData);
      } else {
        // Nenhum dado encontrado - inicializar para novo usuário
        await initializeForNewUser();
      }
    } catch (error) {
      console.error('Erro ao carregar onboarding:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const initializeForNewUser = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Buscar dados do perfil para pré-preencher
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .single();

      // 🎯 TENTAR RECUPERAR DADOS DO CONVITE
      const inviteToken = sessionStorage.getItem('current_invite_token');
      let inviteData: { email?: string; from_invite_notes?: string } = {};
      
      if (inviteToken) {
        console.log('🎯 [ONBOARDING] Dados do convite encontrados, integrando no onboarding');
        try {
          const { data: inviteInfo } = await supabase.rpc('validate_invite_token_safe', { 
            p_token: inviteToken 
          });
          
          if (inviteInfo?.valid && inviteInfo?.invite) {
            inviteData = {
              email: inviteInfo.invite.email,
              ...(inviteInfo.invite.notes && { from_invite_notes: inviteInfo.invite.notes })
            };
            console.log('✅ [ONBOARDING] Dados do convite integrados:', inviteData);
          }
        } catch (error) {
          console.warn('⚠️ [ONBOARDING] Erro ao validar convite:', error);
        }
      }

      const initialData: SimpleOnboardingData = {
        user_id: user.id,
        personal_info: {
          name: profile?.name || '',
          email: inviteData.email || profile?.email || user.email || '',
          ...inviteData,
        },
        business_info: {},
        ai_experience: {},
        goals_info: {},
        personalization: {},
        current_step: 1,
        completed_steps: [],
        is_completed: false,
        status: 'in_progress'
      };

      setData(initialData);
      
      // 🎯 MENSAGEM PERSONALIZADA PARA REGISTRO VIA CONVITE
      const registroRecente = sessionStorage.getItem('registro_recente');
      if (registroRecente === 'true') {
        toast({
          title: "Bem-vindo ao VIVER DE IA Club! 🎉",
          description: "Vamos personalizar sua experiência e configurar sua conta.",
        });
      } else {
        toast({
          title: "Bem-vindo! 👋",
          description: "Vamos personalizar sua experiência conosco.",
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar onboarding:', error);
    }
  }, [user?.id, user?.email]);

  const saveStep = useCallback(async (stepData: Partial<SimpleOnboardingData>, currentStep: number) => {
    if (!user?.id || isSaving) return false;

    setIsSaving(true);
    try {
      // Merge dos dados
      const updatedData = {
        ...data,
        ...stepData,
        personal_info: { ...data.personal_info, ...stepData.personal_info },
        business_info: { ...data.business_info, ...stepData.business_info },
        ai_experience: { ...data.ai_experience, ...stepData.ai_experience },
        goals_info: { ...data.goals_info, ...stepData.goals_info },
        personalization: { ...data.personalization, ...stepData.personalization },
        current_step: Math.max(currentStep + 1, data.current_step),
        completed_steps: [...new Set([...data.completed_steps, currentStep])],
        updated_at: new Date().toISOString()
      };

      // Salvar no Supabase
      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          personal_info: updatedData.personal_info,
          business_info: updatedData.business_info,
          ai_experience: updatedData.ai_experience,
          goals_info: updatedData.goals_info,
          personalization: updatedData.personalization,
          current_step: updatedData.current_step,
          completed_steps: updatedData.completed_steps,
          is_completed: updatedData.is_completed,
          status: updatedData.status,
          updated_at: updatedData.updated_at
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Atualizar estado local
      setData(updatedData);
      
      toast({
        title: "Dados salvos! ✅",
        description: `Etapa ${currentStep} concluída com sucesso.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar step:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, data, isSaving]);

  const completeOnboarding = useCallback(async () => {
    if (!user?.id || isSaving) return false;

    setIsSaving(true);
    try {
      const completedData = {
        ...data,
        is_completed: true,
        status: 'completed' as const,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding_final')
        .upsert({
          user_id: user.id,
          personal_info: completedData.personal_info,
          business_info: completedData.business_info,
          ai_experience: completedData.ai_experience,
          goals_info: completedData.goals_info,
          personalization: completedData.personalization,
          current_step: completedData.current_step,
          completed_steps: completedData.completed_steps,
          is_completed: true,
          status: 'completed',
          completed_at: completedData.completed_at,
          updated_at: completedData.updated_at
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Atualizar perfil para marcar onboarding como completo
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          name: completedData.personal_info.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      setData(completedData);
      
      // 🎯 LIMPAR FLAGS DE REGISTRO RECENTE
      sessionStorage.removeItem('registro_recente');
      sessionStorage.removeItem('registro_timestamp');
      sessionStorage.removeItem('current_invite_token');
      
      toast({
        title: "Onboarding concluído! 🎉",
        description: "Sua conta está configurada! Bem-vindo(a) à plataforma personalizada.",
      });

      // Redirecionar para dashboard personalizado
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);

      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível completar o onboarding. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, data, isSaving, navigate]);

  return {
    data,
    isLoading,
    isSaving,
    saveStep,
    completeOnboarding,
    loadOnboardingData
  };
};