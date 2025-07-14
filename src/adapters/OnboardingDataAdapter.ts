// Adaptador para converter dados entre formatos frontend e onboarding_final

export interface FrontendOnboardingData {
  // Step 1
  personal_info: {
    name?: string;
    email?: string;
    phone?: string;
    instagram?: string;
    linkedin?: string;
    birthDate?: string;
    profilePicture?: string;
    curiosity?: string;
  };
  location_info: {
    state?: string;
    city?: string;
    country?: string;
    timezone?: string;
  };
  
  // Step 2
  business_info: {
    companyName?: string;
    position?: string;
    businessSector?: string;
    companySize?: string;
    annualRevenue?: string;
    companyWebsite?: string;
  };
  
  // Step 3
  ai_experience: {
    hasImplementedAI?: string;
    aiToolsUsed?: string[];
    aiKnowledgeLevel?: string;
    whoWillImplement?: string;
    aiImplementationObjective?: string;
    aiImplementationUrgency?: string;
    aiMainChallenge?: string;
  };
  
  // Step 4
  goals_info: {
    mainObjective?: string;
    areaToImpact?: string;
    expectedResult90Days?: string;
    urgencyLevel?: string;
    successMetric?: string;
    mainObstacle?: string;
    preferredSupport?: string;
    aiImplementationBudget?: string;
  };
  
  // Step 5
  personalization: {
    weeklyLearningTime?: string;
    bestDays?: string[];
    bestPeriods?: string[];
    contentPreference?: string[];
    contentFrequency?: string;
    wantsNetworking?: string;
    communityInteractionStyle?: string;
    preferredCommunicationChannel?: string;
    followUpType?: string;
    motivationSharing?: string;
  };
  
  // Control
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
}

export interface OnboardingFinalData {
  id?: string;
  user_id: string;
  personal_info: any;
  business_info: any;
  ai_experience: any;
  goals: any;
  preferences: any;
  company_name?: string;
  annual_revenue?: string;
  ai_knowledge_level?: string;
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  completed_at?: string;
  status: string;
  time_per_step?: any;
  completion_score?: number;
  abandonment_points?: any[];
  created_at?: string;
  updated_at?: string;
}

export class OnboardingDataAdapter {
  // Converter dados do frontend para formato onboarding_final
  static toOnboardingFinal(frontendData: FrontendOnboardingData, userId: string): OnboardingFinalData {
    return {
      user_id: userId,
      
      // JSONB fields com estrutura limpa
      personal_info: {
        ...frontendData.personal_info,
        ...frontendData.location_info
      },
      
      business_info: {
        company_name: frontendData.business_info?.companyName,
        position: frontendData.business_info?.position,
        business_sector: frontendData.business_info?.businessSector,
        company_size: frontendData.business_info?.companySize,
        annual_revenue: frontendData.business_info?.annualRevenue,
        company_website: frontendData.business_info?.companyWebsite
      },
      
      ai_experience: {
        has_implemented_ai: frontendData.ai_experience?.hasImplementedAI,
        ai_tools_used: frontendData.ai_experience?.aiToolsUsed || [],
        ai_knowledge_level: frontendData.ai_experience?.aiKnowledgeLevel,
        who_will_implement: frontendData.ai_experience?.whoWillImplement,
        ai_implementation_objective: frontendData.ai_experience?.aiImplementationObjective,
        ai_implementation_urgency: frontendData.ai_experience?.aiImplementationUrgency,
        ai_main_challenge: frontendData.ai_experience?.aiMainChallenge
      },
      
      goals: {
        main_objective: frontendData.goals_info?.mainObjective,
        area_to_impact: frontendData.goals_info?.areaToImpact,
        expected_result_90_days: frontendData.goals_info?.expectedResult90Days,
        urgency_level: frontendData.goals_info?.urgencyLevel,
        success_metric: frontendData.goals_info?.successMetric,
        main_obstacle: frontendData.goals_info?.mainObstacle,
        preferred_support: frontendData.goals_info?.preferredSupport,
        ai_implementation_budget: frontendData.goals_info?.aiImplementationBudget
      },
      
      preferences: {
        weekly_learning_time: frontendData.personalization?.weeklyLearningTime,
        best_days: frontendData.personalization?.bestDays || [],
        best_periods: frontendData.personalization?.bestPeriods || [],
        content_preference: frontendData.personalization?.contentPreference || [],
        content_frequency: frontendData.personalization?.contentFrequency,
        wants_networking: frontendData.personalization?.wantsNetworking,
        community_interaction_style: frontendData.personalization?.communityInteractionStyle,
        preferred_communication_channel: frontendData.personalization?.preferredCommunicationChannel,
        follow_up_type: frontendData.personalization?.followUpType,
        motivation_sharing: frontendData.personalization?.motivationSharing
      },
      
      // Campos diretos (duplicados para compatibilidade)
      company_name: frontendData.business_info?.companyName,
      annual_revenue: frontendData.business_info?.annualRevenue,
      ai_knowledge_level: frontendData.ai_experience?.aiKnowledgeLevel,
      
      // Controle
      current_step: frontendData.current_step,
      completed_steps: frontendData.completed_steps,
      is_completed: frontendData.is_completed,
      status: frontendData.is_completed ? 'completed' : 'in_progress',
      
      // Analytics
      time_per_step: {},
      completion_score: this.calculateCompletionScore(frontendData),
      abandonment_points: []
    };
  }
  
  // Converter dados de onboarding_final para frontend
  static toFrontend(onboardingData: OnboardingFinalData): FrontendOnboardingData {
    return {
      personal_info: {
        name: onboardingData.personal_info?.name || '',
        email: onboardingData.personal_info?.email || '',
        phone: onboardingData.personal_info?.phone || '',
        instagram: onboardingData.personal_info?.instagram || '',
        linkedin: onboardingData.personal_info?.linkedin || '',
        birthDate: onboardingData.personal_info?.birth_date || '',
        profilePicture: onboardingData.personal_info?.profile_picture || '',
        curiosity: onboardingData.personal_info?.curiosity || ''
      },
      
      location_info: {
        state: onboardingData.personal_info?.state || '',
        city: onboardingData.personal_info?.city || '',
        country: onboardingData.personal_info?.country || 'Brasil',
        timezone: onboardingData.personal_info?.timezone || 'America/Sao_Paulo'
      },
      
      business_info: {
        companyName: onboardingData.business_info?.company_name || '',
        position: onboardingData.business_info?.position || '',
        businessSector: onboardingData.business_info?.business_sector || '',
        companySize: onboardingData.business_info?.company_size || '',
        annualRevenue: onboardingData.business_info?.annual_revenue || '',
        companyWebsite: onboardingData.business_info?.company_website || ''
      },
      
      ai_experience: {
        hasImplementedAI: onboardingData.ai_experience?.has_implemented_ai || '',
        aiToolsUsed: onboardingData.ai_experience?.ai_tools_used || [],
        aiKnowledgeLevel: onboardingData.ai_experience?.ai_knowledge_level || '',
        whoWillImplement: onboardingData.ai_experience?.who_will_implement || '',
        aiImplementationObjective: onboardingData.ai_experience?.ai_implementation_objective || '',
        aiImplementationUrgency: onboardingData.ai_experience?.ai_implementation_urgency || '',
        aiMainChallenge: onboardingData.ai_experience?.ai_main_challenge || ''
      },
      
      goals_info: {
        mainObjective: onboardingData.goals?.main_objective || '',
        areaToImpact: onboardingData.goals?.area_to_impact || '',
        expectedResult90Days: onboardingData.goals?.expected_result_90_days || '',
        urgencyLevel: onboardingData.goals?.urgency_level || '',
        successMetric: onboardingData.goals?.success_metric || '',
        mainObstacle: onboardingData.goals?.main_obstacle || '',
        preferredSupport: onboardingData.goals?.preferred_support || '',
        aiImplementationBudget: onboardingData.goals?.ai_implementation_budget || ''
      },
      
      personalization: {
        weeklyLearningTime: onboardingData.preferences?.weekly_learning_time || '',
        bestDays: onboardingData.preferences?.best_days || [],
        bestPeriods: onboardingData.preferences?.best_periods || [],
        contentPreference: onboardingData.preferences?.content_preference || [],
        contentFrequency: onboardingData.preferences?.content_frequency || '',
        wantsNetworking: onboardingData.preferences?.wants_networking || '',
        communityInteractionStyle: onboardingData.preferences?.community_interaction_style || '',
        preferredCommunicationChannel: onboardingData.preferences?.preferred_communication_channel || '',
        followUpType: onboardingData.preferences?.follow_up_type || '',
        motivationSharing: onboardingData.preferences?.motivation_sharing || ''
      },
      
      current_step: onboardingData.current_step,
      completed_steps: onboardingData.completed_steps || [],
      is_completed: onboardingData.is_completed
    };
  }
  
  // Calcular pontuação de completude
  private static calculateCompletionScore(data: FrontendOnboardingData): number {
    let score = 0;
    let totalFields = 0;
    
    // Contar campos preenchidos em cada seção
    const sections = [data.personal_info, data.business_info, data.ai_experience, data.goals_info, data.personalization];
    
    sections.forEach(section => {
      if (section) {
        Object.values(section).forEach(value => {
          totalFields++;
          if (value && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '')) {
            score++;
          }
        });
      }
    });
    
    return totalFields > 0 ? Math.round((score / totalFields) * 100) : 0;
  }
}