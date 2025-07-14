import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OnboardingData {
  id?: string;
  user_id?: string;
  
  // Dados pessoais (Step 1)
  name?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  linkedin?: string;
  birth_date?: string;
  profile_picture?: string;
  curiosity?: string;
  
  // Localização (Step 1)
  state?: string;
  city?: string;
  country?: string;
  timezone?: string;
  
  // Dados empresariais (Step 2)
  company_name?: string;
  position?: string;
  business_sector?: string;
  company_size?: string;
  annual_revenue?: string;
  company_website?: string;
  
  // Experiência com IA (Step 3)
  has_implemented_ai?: string;
  ai_tools_used?: string[];
  ai_knowledge_level?: string;
  who_will_implement?: string;
  ai_implementation_objective?: string;
  ai_implementation_urgency?: string;
  ai_main_challenge?: string;
  
  // Objetivos (Step 4)
  main_objective?: string;
  area_to_impact?: string;
  expected_result_90_days?: string;
  urgency_level?: string;
  success_metric?: string;
  main_obstacle?: string;
  preferred_support?: string;
  ai_implementation_budget?: string;
  
  // Personalização (Step 5)
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
  
  // Controle
  current_step?: number;
  completed_steps?: number[];
  is_completed?: boolean;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const useDirectOnboardingAdapter = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Converter dados do frontend para backend (mapeamento direto)
  const mapFrontendToBackend = useCallback((frontendData: any): OnboardingData => {
    console.log('🔄 [DIRECT] Mapeando frontend para backend:', frontendData);
    
    return {
      user_id: user?.id,
      
      // Step 1 - Dados pessoais e localização
      name: frontendData.personal_info?.name,
      email: frontendData.personal_info?.email,
      phone: frontendData.personal_info?.phone,
      instagram: frontendData.personal_info?.instagram,
      linkedin: frontendData.personal_info?.linkedin,
      birth_date: frontendData.personal_info?.birthDate,
      profile_picture: frontendData.personal_info?.profilePicture,
      curiosity: frontendData.personal_info?.curiosity,
      
      state: frontendData.location_info?.state,
      city: frontendData.location_info?.city,
      country: frontendData.location_info?.country || 'Brasil',
      timezone: frontendData.location_info?.timezone || 'America/Sao_Paulo',
      
      // Step 2 - Dados empresariais
      company_name: frontendData.business_info?.companyName,
      position: frontendData.business_info?.position,
      business_sector: frontendData.business_info?.businessSector,
      company_size: frontendData.business_info?.companySize,
      annual_revenue: frontendData.business_info?.annualRevenue,
      company_website: frontendData.business_info?.companyWebsite,
      
      // Step 3 - Experiência com IA
      has_implemented_ai: frontendData.ai_experience?.hasImplementedAI,
      ai_tools_used: frontendData.ai_experience?.aiToolsUsed || [],
      ai_knowledge_level: frontendData.ai_experience?.aiKnowledgeLevel,
      who_will_implement: frontendData.ai_experience?.whoWillImplement,
      ai_implementation_objective: frontendData.ai_experience?.aiImplementationObjective,
      ai_implementation_urgency: frontendData.ai_experience?.aiImplementationUrgency,
      ai_main_challenge: frontendData.ai_experience?.aiMainChallenge,
      
      // Step 4 - Objetivos
      main_objective: frontendData.goals_info?.mainObjective,
      area_to_impact: frontendData.goals_info?.areaToImpact,
      expected_result_90_days: frontendData.goals_info?.expectedResult90Days,
      urgency_level: frontendData.goals_info?.urgencyLevel,
      success_metric: frontendData.goals_info?.successMetric,
      main_obstacle: frontendData.goals_info?.mainObstacle,
      preferred_support: frontendData.goals_info?.preferredSupport,
      ai_implementation_budget: frontendData.goals_info?.aiImplementationBudget,
      
      // Step 5 - Personalização
      weekly_learning_time: frontendData.personalization?.weeklyLearningTime,
      best_days: frontendData.personalization?.bestDays || [],
      best_periods: frontendData.personalization?.bestPeriods || [],
      content_preference: frontendData.personalization?.contentPreference || [],
      content_frequency: frontendData.personalization?.contentFrequency,
      wants_networking: frontendData.personalization?.wantsNetworking,
      community_interaction_style: frontendData.personalization?.communityInteractionStyle,
      preferred_communication_channel: frontendData.personalization?.preferredCommunicationChannel,
      follow_up_type: frontendData.personalization?.followUpType,
      motivation_sharing: frontendData.personalization?.motivationSharing,
      
      // Controle
      current_step: frontendData.current_step || 1,
      completed_steps: frontendData.completed_steps || [],
      is_completed: frontendData.is_completed || false,
      completed_at: frontendData.is_completed ? new Date().toISOString() : undefined
    };
  }, [user?.id]);

  // Converter dados do backend para frontend (mapeamento direto)
  const mapBackendToFrontend = useCallback((backendData: OnboardingData): any => {
    console.log('🔄 [DIRECT] Mapeando backend para frontend:', backendData);
    
    return {
      // Estrutura complexa do frontend mantida para compatibilidade
      personal_info: {
        name: backendData.name || '',
        email: backendData.email || '',
        phone: backendData.phone || '',
        instagram: backendData.instagram || '',
        linkedin: backendData.linkedin || '',
        birthDate: backendData.birth_date || '',
        profilePicture: backendData.profile_picture || '',
        curiosity: backendData.curiosity || ''
      },
      location_info: {
        state: backendData.state || '',
        city: backendData.city || '',
        country: backendData.country || 'Brasil',
        timezone: backendData.timezone || 'America/Sao_Paulo'
      },
      business_info: {
        companyName: backendData.company_name || '',
        position: backendData.position || '',
        businessSector: backendData.business_sector || '',
        companySize: backendData.company_size || '',
        annualRevenue: backendData.annual_revenue || '',
        companyWebsite: backendData.company_website || ''
      },
      ai_experience: {
        hasImplementedAI: backendData.has_implemented_ai || '',
        aiToolsUsed: backendData.ai_tools_used || [],
        aiKnowledgeLevel: backendData.ai_knowledge_level || '',
        whoWillImplement: backendData.who_will_implement || '',
        aiImplementationObjective: backendData.ai_implementation_objective || '',
        aiImplementationUrgency: backendData.ai_implementation_urgency || '',
        aiMainChallenge: backendData.ai_main_challenge || ''
      },
      goals_info: {
        mainObjective: backendData.main_objective || '',
        areaToImpact: backendData.area_to_impact || '',
        expectedResult90Days: backendData.expected_result_90_days || '',
        urgencyLevel: backendData.urgency_level || '',
        successMetric: backendData.success_metric || '',
        mainObstacle: backendData.main_obstacle || '',
        preferredSupport: backendData.preferred_support || '',
        aiImplementationBudget: backendData.ai_implementation_budget || ''
      },
      personalization: {
        weeklyLearningTime: backendData.weekly_learning_time || '',
        bestDays: backendData.best_days || [],
        bestPeriods: backendData.best_periods || [],
        contentPreference: backendData.content_preference || [],
        contentFrequency: backendData.content_frequency || '',
        wantsNetworking: backendData.wants_networking || '',
        communityInteractionStyle: backendData.community_interaction_style || '',
        preferredCommunicationChannel: backendData.preferred_communication_channel || '',
        followUpType: backendData.follow_up_type || '',
        motivationSharing: backendData.motivation_sharing || ''
      },
      current_step: backendData.current_step || 1,
      completed_steps: backendData.completed_steps || [],
      is_completed: backendData.is_completed || false
    };
  }, []);

  // Carregar dados do onboarding
  const loadOnboardingData = useCallback(async (): Promise<any> => {
    if (!user?.id) {
      console.warn('❌ [DIRECT] Usuário não autenticado');
      return null;
    }

    setIsLoading(true);
    console.log('🔍 [DIRECT] Carregando dados para usuário:', user.id);

    try {
      const { data, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ [DIRECT] Erro ao carregar:', error);
        throw error;
      }

      if (data) {
        console.log('✅ [DIRECT] Dados carregados:', data);
        return mapBackendToFrontend(data);
      } else {
        console.log('📭 [DIRECT] Nenhum dado encontrado');
        return null;
      }
    } catch (error) {
      console.error('❌ [DIRECT] Erro inesperado:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar seus dados de onboarding.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, mapBackendToFrontend]);

  // Salvar dados do onboarding
  const saveOnboardingData = useCallback(async (frontendData: any): Promise<boolean> => {
    if (!user?.id) {
      console.error('❌ [DIRECT] Usuário não autenticado');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar.",
        variant: "destructive",
      });
      return false;
    }

    if (isSaving) {
      console.warn('⚠️ [DIRECT] Já está salvando, cancelando');
      return false;
    }

    setIsSaving(true);
    console.log('💾 [DIRECT] Iniciando salvamento...');

    try {
      const backendData = mapFrontendToBackend(frontendData);
      console.log('💾 [DIRECT] Dados mapeados:', backendData);

      const { error } = await supabase
        .from('onboarding')
        .upsert(backendData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ [DIRECT] Erro ao salvar:', error);
        throw error;
      }

      console.log('✅ [DIRECT] Dados salvos com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ [DIRECT] Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seu progresso.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, isSaving, mapFrontendToBackend]);

  // Completar onboarding
  const completeOnboarding = useCallback(async (frontendData: any): Promise<boolean> => {
    console.log('🎯 [DIRECT] Completando onboarding...');
    
    const completedData = {
      ...frontendData,
      is_completed: true,
      completed_at: new Date().toISOString()
    };

    return await saveOnboardingData(completedData);
  }, [saveOnboardingData]);

  return {
    loadOnboardingData,
    saveOnboardingData,
    completeOnboarding,
    isLoading,
    isSaving
  };
};