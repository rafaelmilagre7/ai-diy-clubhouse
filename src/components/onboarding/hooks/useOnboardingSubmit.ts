
import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';

export const useOnboardingSubmit = () => {
  const { user } = useAuth();

  const checkOnboardingStatus = useCallback(async () => {
    if (!user?.id) {
      console.log('useOnboardingSubmit: Usuário não encontrado');
      return null;
    }
    
    try {
      console.log('useOnboardingSubmit: Verificando status para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Usar maybeSingle() ao invés de single() para evitar erro se não existir

      if (error) {
        console.error('useOnboardingSubmit: Erro na consulta:', error);
        return null;
      }
      
      console.log('useOnboardingSubmit: Dados encontrados:', data);
      return data;
    } catch (error) {
      console.error('useOnboardingSubmit: Erro inesperado:', error);
      return null;
    }
  }, [user?.id]);

  const submitOnboardingData = useCallback(async (data: OnboardingData) => {
    if (!user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('useOnboardingSubmit: Salvando dados do onboarding');
      
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
        updated_at: new Date().toISOString()
      };

      // Salvar no banco usando upsert para evitar conflitos
      const { error } = await supabase
        .from('user_onboarding')
        .upsert(onboardingRecord, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('useOnboardingSubmit: Erro ao salvar:', error);
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
        console.error('useOnboardingSubmit: Erro ao atualizar perfil:', profileError);
        // Não falhar aqui, pois o onboarding principal foi salvo
      }

      console.log('useOnboardingSubmit: Onboarding salvo com sucesso');
      return onboardingRecord;
    } catch (error) {
      console.error('useOnboardingSubmit: Erro ao salvar onboarding:', error);
      throw error;
    }
  }, [user?.id]);

  // Memoizar o retorno para evitar recriações desnecessárias
  return useMemo(() => ({
    checkOnboardingStatus,
    submitOnboardingData
  }), [checkOnboardingStatus, submitOnboardingData]);
};
