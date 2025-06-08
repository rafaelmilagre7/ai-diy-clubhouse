
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { toast } from 'sonner';

export const useOnboardingSubmit = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitOnboarding = async (data: OnboardingData, memberType: 'club' | 'formacao') => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Preparar dados para inserção no banco
      const onboardingRecord = {
        user_id: user.id,
        name: data.name,
        nickname: data.nickname,
        
        // Dados específicos do tipo de membro
        business_stage: memberType === 'club' ? data.businessStage : null,
        business_area: memberType === 'club' ? data.businessArea : null,
        team_size: memberType === 'club' ? data.teamSize : null,
        
        education_level: memberType === 'formacao' ? data.educationLevel : null,
        study_area: memberType === 'formacao' ? data.studyArea : null,
        institution: memberType === 'formacao' ? data.institution : null,
        
        // Mercado/Área de Atuação
        target_market: data.targetMarket,
        main_challenges: data.mainChallenges || [],
        current_tools: data.currentTools || [],
        
        // Experiência com IA
        ai_experience: data.aiExperience,
        ai_tools_used: data.aiToolsUsed || [],
        ai_challenges: data.aiChallenges || [],
        
        // Objetivos
        primary_goals: data.primaryGoals || [],
        timeframe: data.timeframe,
        success_metrics: data.successMetrics || [],
        
        // Personalização
        communication_style: data.communicationStyle,
        learning_preference: data.learningPreference,
        content_types: data.contentTypes || [],
        
        // Metadados
        member_type: memberType,
        completed_at: new Date().toISOString()
      };

      // Verificar se já existe um registro para este usuário
      const { data: existingRecord, error: checkError } = await supabase
        .from('onboarding_final')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existingRecord) {
        // Atualizar registro existente
        result = await supabase
          .from('onboarding_final')
          .update(onboardingRecord)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Inserir novo registro
        result = await supabase
          .from('onboarding_final')
          .insert(onboardingRecord)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast.success('Onboarding concluído com sucesso!');
      return result.data;

    } catch (error: any) {
      console.error('Erro ao salvar onboarding:', error);
      const errorMessage = error.message || 'Erro ao salvar dados do onboarding';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkOnboardingStatus = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('onboarding_final')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao verificar status do onboarding:', error);
      return null;
    }
  };

  return {
    submitOnboarding,
    checkOnboardingStatus,
    isSubmitting,
    submitError
  };
};
