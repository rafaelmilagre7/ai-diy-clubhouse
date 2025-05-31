
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { OnboardingFinalData } from '@/types/onboardingFinal';
import { useAuth } from '@/contexts/auth';

export const useCompleteOnboarding = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const completeOnboarding = async (data: OnboardingFinalData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    setIsSubmitting(true);

    try {
      console.log('🔄 Iniciando finalização do onboarding para usuário:', user.id);

      // VERIFICAÇÃO DE DUPLICAÇÃO - Verificar se já existe onboarding completo
      const { data: existingData, error: checkError } = await supabase
        .from('onboarding_final')
        .select('id, status, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar onboarding existente:', checkError);
        throw new Error(`Erro na verificação: ${checkError.message}`);
      }

      if (existingData) {
        console.log('⚠️ Onboarding já existe e está completo:', existingData);
        toast.warning('Onboarding já foi completado anteriormente', {
          description: 'Redirecionando para o dashboard...'
        });
        return { 
          success: true, 
          data: existingData, 
          wasAlreadyCompleted: true 
        };
      }

      console.log('✅ Verificação passou - prosseguindo com salvamento');

      // Preparar dados para inserção no banco
      const onboardingData = {
        user_id: user.id,
        personal_info: data.personal_info || {
          name: '',
          email: '',
          whatsapp: '',
          country_code: '+55',
          birth_date: ''
        },
        location_info: data.location_info || {
          country: '',
          state: '',
          city: '',
          instagram_url: '',
          linkedin_url: ''
        },
        discovery_info: data.discovery_info || {
          how_found_us: '',
          referred_by: ''
        },
        business_info: data.business_info || {
          company_name: '',
          role: '',
          company_size: '',
          company_sector: '',
          company_website: '',
          annual_revenue: '',
          current_position: ''
        },
        business_context: data.business_context || {
          business_model: '',
          business_challenges: [],
          short_term_goals: [],
          medium_term_goals: [],
          important_kpis: [],
          additional_context: ''
        },
        goals_info: data.goals_info || {
          primary_goal: '',
          expected_outcomes: [],
          expected_outcome_30days: '',
          priority_solution_type: '',
          how_implement: '',
          week_availability: '',
          content_formats: []
        },
        ai_experience: data.ai_experience || {
          ai_knowledge_level: '',
          previous_tools: [],
          has_implemented: '',
          desired_ai_areas: [],
          completed_formation: false,
          is_member_for_month: false,
          nps_score: 0,
          improvement_suggestions: ''
        },
        personalization: data.personalization || {
          interests: [],
          time_preference: [],
          available_days: [],
          networking_availability: 0,
          skills_to_share: [],
          mentorship_topics: [],
          live_interest: 0,
          authorize_case_usage: false,
          interested_in_interview: false,
          priority_topics: [],
          content_formats: []
        },
        completed_at: new Date().toISOString(),
        status: 'completed'
      };

      console.log('💾 Salvando dados do onboarding...');

      // Inserir dados no banco de dados usando upsert para evitar conflitos
      const { data: insertedData, error } = await supabase
        .from('onboarding_final')
        .upsert(onboardingData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar onboarding:', error);
        throw error;
      }

      console.log('✅ Onboarding salvo com sucesso:', insertedData);

      // Atualizar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: onboardingData.personal_info.name,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Erro ao atualizar perfil:', profileError);
        // Não fazer throw aqui para não bloquear o fluxo principal
        console.log('⚠️ Continuando mesmo com erro no perfil...');
      } else {
        console.log('✅ Perfil atualizado com sucesso');
      }

      toast.success('Onboarding finalizado com sucesso!', {
        description: 'Bem-vindo à plataforma!'
      });

      return { success: true, data: insertedData };

    } catch (error: any) {
      console.error('❌ Erro durante finalização do onboarding:', error);
      
      // Mensagens de erro mais específicas
      if (error.message?.includes('duplicate key')) {
        toast.error('Onboarding já foi completado', {
          description: 'Redirecionando para o dashboard...'
        });
      } else {
        toast.error('Erro ao finalizar onboarding', {
          description: 'Tente novamente ou entre em contato com o suporte.'
        });
      }
      
      return { success: false, error: error.message || 'Erro desconhecido' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    completeOnboarding,
    isSubmitting
  };
};
