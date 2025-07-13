import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { OnboardingData } from '../types/simpleOnboardingTypes';

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OnboardingData>({
    current_step: 1,
    is_completed: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados existentes
  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      const { data: existingData } = await supabase
        .from('onboarding_simple')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existingData) {
        // Mapear do backend simplificado para a estrutura completa do frontend
        const mappedData: OnboardingData = {
          // Etapa 1 - Informações pessoais
          name: existingData.name || '',
          email: existingData.email || '',
          phone: existingData.phone || '',
          instagram: existingData.data?.instagram || '',
          linkedin: existingData.data?.linkedin || '',
          state: existingData.data?.state || '',
          city: existingData.data?.city || '',
          birthDate: existingData.data?.birthDate || '',
          birthDay: existingData.data?.birthDay || '',
          birthMonth: existingData.data?.birthMonth || '',
          birthYear: existingData.data?.birthYear || '',
          curiosity: existingData.data?.curiosity || '',
          profilePicture: existingData.data?.profilePicture || '',
          
          // Etapa 2 - Perfil Empresarial
          companyName: existingData.company_name || '',
          companyWebsite: existingData.data?.companyWebsite || '',
          businessSector: existingData.business_sector || '',
          companySize: existingData.data?.companySize || '',
          annualRevenue: existingData.data?.annualRevenue || '',
          position: existingData.data?.position || '',
          
          // Etapa 3 - Maturidade em IA
          hasImplementedAI: existingData.data?.hasImplementedAI || '',
          aiToolsUsed: existingData.data?.aiToolsUsed || [],
          aiKnowledgeLevel: existingData.ai_knowledge_level || '',
          dailyTools: existingData.data?.dailyTools || [],
          whoWillImplement: existingData.data?.whoWillImplement || '',
          aiImplementationObjective: existingData.data?.aiImplementationObjective || '',
          aiImplementationUrgency: existingData.data?.aiImplementationUrgency || '',
          aiMainChallenge: existingData.data?.aiMainChallenge || '',
          
          // Etapa 4 - Objetivos e Expectativas
          mainObjective: existingData.main_objective || '',
          areaToImpact: existingData.data?.areaToImpact || '',
          expectedResult90Days: existingData.data?.expectedResult90Days || '',
          urgencyLevel: existingData.data?.urgencyLevel || '',
          successMetric: existingData.data?.successMetric || '',
          mainObstacle: existingData.data?.mainObstacle || '',
          preferredSupport: existingData.data?.preferredSupport || '',
          aiImplementationBudget: existingData.data?.aiImplementationBudget || '',
          
          // Etapa 5 - Personalização da Experiência
          weeklyLearningTime: existingData.data?.weeklyLearningTime || '',
          contentPreference: existingData.data?.contentPreference || [],
          contentFrequency: existingData.data?.contentFrequency || '',
          wantsNetworking: existingData.data?.wantsNetworking || '',
          communityInteractionStyle: existingData.data?.communityInteractionStyle || '',
          preferredCommunicationChannel: existingData.data?.preferredCommunicationChannel || '',
          followUpType: existingData.data?.followUpType || '',
          learningMotivators: existingData.data?.learningMotivators || [],
          bestDays: existingData.data?.bestDays || [],
          bestPeriods: existingData.data?.bestPeriods || [],
          acceptsCaseStudy: existingData.data?.acceptsCaseStudy || '',
          
          // Metadados
          memberType: existingData.data?.memberType || 'club',
          current_step: existingData.current_step || 1,
          is_completed: existingData.is_completed || false,
          completedAt: existingData.completed_at,
          startedAt: existingData.created_at,
          updatedAt: existingData.updated_at,
          
          // IA Interativa
          aiMessage1: existingData.data?.aiMessage1 || '',
          aiMessage2: existingData.data?.aiMessage2 || '',
          aiMessage3: existingData.data?.aiMessage3 || '',
          aiMessage4: existingData.data?.aiMessage4 || '',
          aiMessage5: existingData.data?.aiMessage5 || '',
          aiFinalMessage: existingData.data?.aiFinalMessage || ''
        };
        
        setData(mappedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (stepData: Partial<OnboardingData>) => {
    if (!user?.id) return false;

    try {
      const updatedData = { ...data, ...stepData };
      setData(updatedData);

      // Mapear os dados principais para as colunas diretas
      const mainData = {
        user_id: user.id,
        name: updatedData.name || '',
        email: updatedData.email || '',
        phone: updatedData.phone || '',
        company_name: updatedData.companyName || '',
        business_sector: updatedData.businessSector || '',
        ai_knowledge_level: updatedData.aiKnowledgeLevel || '',
        main_objective: updatedData.mainObjective || '',
        current_step: updatedData.current_step || 1,
        is_completed: updatedData.is_completed || false,
        completed_at: updatedData.completedAt,
        updated_at: new Date().toISOString()
      };

      // Todos os outros dados vão para o campo JSONB 'data'
      const additionalData = {
        // Etapa 1
        instagram: updatedData.instagram,
        linkedin: updatedData.linkedin,
        state: updatedData.state,
        city: updatedData.city,
        birthDate: updatedData.birthDate,
        birthDay: updatedData.birthDay,
        birthMonth: updatedData.birthMonth,
        birthYear: updatedData.birthYear,
        curiosity: updatedData.curiosity,
        profilePicture: updatedData.profilePicture,
        
        // Etapa 2
        companyWebsite: updatedData.companyWebsite,
        companySize: updatedData.companySize,
        annualRevenue: updatedData.annualRevenue,
        position: updatedData.position,
        
        // Etapa 3
        hasImplementedAI: updatedData.hasImplementedAI,
        aiToolsUsed: updatedData.aiToolsUsed,
        dailyTools: updatedData.dailyTools,
        whoWillImplement: updatedData.whoWillImplement,
        aiImplementationObjective: updatedData.aiImplementationObjective,
        aiImplementationUrgency: updatedData.aiImplementationUrgency,
        aiMainChallenge: updatedData.aiMainChallenge,
        
        // Etapa 4
        areaToImpact: updatedData.areaToImpact,
        expectedResult90Days: updatedData.expectedResult90Days,
        urgencyLevel: updatedData.urgencyLevel,
        successMetric: updatedData.successMetric,
        mainObstacle: updatedData.mainObstacle,
        preferredSupport: updatedData.preferredSupport,
        aiImplementationBudget: updatedData.aiImplementationBudget,
        
        // Etapa 5
        weeklyLearningTime: updatedData.weeklyLearningTime,
        contentPreference: updatedData.contentPreference,
        contentFrequency: updatedData.contentFrequency,
        wantsNetworking: updatedData.wantsNetworking,
        communityInteractionStyle: updatedData.communityInteractionStyle,
        preferredCommunicationChannel: updatedData.preferredCommunicationChannel,
        followUpType: updatedData.followUpType,
        learningMotivators: updatedData.learningMotivators,
        bestDays: updatedData.bestDays,
        bestPeriods: updatedData.bestPeriods,
        acceptsCaseStudy: updatedData.acceptsCaseStudy,
        
        // Metadados
        memberType: updatedData.memberType,
        
        // IA Interativa
        aiMessage1: updatedData.aiMessage1,
        aiMessage2: updatedData.aiMessage2,
        aiMessage3: updatedData.aiMessage3,
        aiMessage4: updatedData.aiMessage4,
        aiMessage5: updatedData.aiMessage5,
        aiFinalMessage: updatedData.aiFinalMessage
      };

      const { error } = await supabase
        .from('onboarding_simple')
        .upsert({
          ...mainData,
          data: additionalData
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  };

  const completeOnboarding = async () => {
    return await saveData({
      is_completed: true,
      completedAt: new Date().toISOString()
    });
  };

  return {
    data,
    isLoading,
    saveData,
    completeOnboarding
  };
};