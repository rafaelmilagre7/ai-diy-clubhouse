
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';

export const useOnboardingSubmit = () => {
  const { user } = useAuth();

  const checkOnboardingStatus = useCallback(async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar onboarding:', error);
        return null; // Retorna null em caso de erro para permitir que o usuário continue
      }
      
      return data;
    } catch (error) {
      console.error('Erro inesperado ao verificar onboarding:', error);
      return null; // Graceful fallback
    }
  }, [user]);

  const submitOnboardingData = useCallback(async (data: OnboardingData) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Preparar dados para o banco
      const onboardingRecord = {
        user_id: user.id,
        name: data.name,
        nickname: data.nickname,
        member_type: data.memberType,
        
        // Dados específicos do tipo de membro
        business_stage: data.businessStage,
        business_area: data.businessArea,
        team_size: data.teamSize,
        education_level: data.educationLevel,
        study_area: data.studyArea,
        institution: data.institution,
        
        // Dados gerais
        target_market: data.targetMarket,
        main_challenges: data.mainChallenges || [],
        current_tools: data.currentTools || [],
        ai_experience: data.aiExperience,
        ai_tools_used: data.aiToolsUsed || [],
        ai_challenges: data.aiChallenges || [],
        primary_goals: data.primaryGoals || [],
        timeframe: data.timeframe,
        success_metrics: data.successMetrics || [],
        communication_style: data.communicationStyle,
        learning_preference: data.learningPreference,
        content_types: data.contentTypes || [],
        
        started_at: data.startedAt,
        completed_at: data.completedAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Salvar no banco usando upsert para evitar conflitos
      const { error } = await supabase
        .from('user_onboarding')
        .upsert(onboardingRecord, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro ao salvar onboarding:', error);
        throw error;
      }

      // Atualizar o perfil do usuário para marcar onboarding como completo
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        // Não falhar aqui, pois o onboarding principal foi salvo
      }

      return onboardingRecord;
    } catch (error) {
      console.error('Erro ao salvar onboarding:', error);
      throw error;
    }
  }, [user]);

  return {
    checkOnboardingStatus,
    submitOnboardingData
  };
};
