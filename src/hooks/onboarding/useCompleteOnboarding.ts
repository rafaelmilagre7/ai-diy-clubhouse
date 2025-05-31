
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
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      console.log('Iniciando finalização do onboarding para usuário:', user.id);
      console.log('Dados recebidos:', data);

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
        completed_at: new Date().toISOString(),
        status: 'completed'
      };

      console.log('Dados preparados para inserção:', onboardingData);

      // Inserir dados no banco de dados
      const { data: insertedData, error } = await supabase
        .from('onboarding_final')
        .upsert(onboardingData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar onboarding:', error);
        throw error;
      }

      console.log('Onboarding salvo com sucesso:', insertedData);

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
        console.error('Erro ao atualizar perfil:', profileError);
        throw profileError;
      }

      console.log('Perfil atualizado com sucesso');

      toast.success('Onboarding finalizado com sucesso!');
      return { success: true, data: insertedData };

    } catch (error) {
      console.error('Erro durante finalização do onboarding:', error);
      toast.error('Erro ao finalizar onboarding. Tente novamente.');
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    completeOnboarding,
    isSubmitting
  };
};
