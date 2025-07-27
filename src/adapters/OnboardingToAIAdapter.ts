/**
 * Adapter para converter dados de onboarding em contexto de personalização para IA
 */

export interface PersonalizedContext {
  personalProfile: {
    name: string;
    location: string;
    experienceLevel: string;
  };
  businessContext: {
    company: string;
    sector: string;
    size: string;
    revenue: string;
    position: string;
    mainChallenge?: string;
  };
  aiReadiness: {
    currentStatus: string;
    approach: string;
    experienceLevel: string;
  };
  objectives: {
    primaryGoal: string;
    timeline?: string;
    successMetrics?: string[];
    investment?: string;
    priorityAreas?: string[];
    specificObjectives?: string;
  };
  learningPreferences: {
    style: string;
    contentPreference?: string[];
    supportLevel?: string;
    availability?: string;
    frequency?: string;
  };
}

export class OnboardingToAIAdapter {
  /**
   * Converte dados de onboarding em contexto estruturado para IA
   */
  static buildPersonalizationContext(onboardingData: any): PersonalizedContext {
    if (!onboardingData) {
      throw new Error('Dados de onboarding não fornecidos');
    }

    return {
      personalProfile: {
        name: onboardingData.personal_info?.name || 'Usuário',
        location: this.formatLocation(onboardingData.personal_info),
        experienceLevel: onboardingData.ai_experience?.experience_level || 'Iniciante'
      },
      businessContext: {
        company: onboardingData.business_info?.company_name || onboardingData.professional_info?.company_name || 'Empresa não informada',
        sector: onboardingData.business_info?.company_sector || onboardingData.professional_info?.company_sector || 'Setor não informado',
        size: onboardingData.business_info?.company_size || onboardingData.professional_info?.company_size || 'Tamanho não informado',
        revenue: onboardingData.business_info?.annual_revenue || onboardingData.professional_info?.annual_revenue || 'Não informado',
        position: onboardingData.business_info?.current_position || onboardingData.professional_info?.current_position || 'Cargo não informado',
        mainChallenge: onboardingData.business_info?.main_challenge || onboardingData.professional_info?.main_challenge
      },
      aiReadiness: {
        currentStatus: onboardingData.ai_experience?.implementation_status || 'Não implementado',
        approach: onboardingData.ai_experience?.implementation_approach || 'Gradual',
        experienceLevel: onboardingData.ai_experience?.experience_level || 'Iniciante'
      },
      objectives: {
        primaryGoal: onboardingData.goals_info?.primary_goal || onboardingData.business_context?.primary_goal || 'Aumentar eficiência',
        timeline: onboardingData.goals_info?.timeline || onboardingData.business_context?.timeline,
        successMetrics: onboardingData.goals_info?.success_metrics || onboardingData.business_context?.success_metrics || [],
        investment: onboardingData.goals_info?.investment_capacity || onboardingData.business_context?.investment_capacity,
        priorityAreas: onboardingData.goals_info?.priority_areas || onboardingData.business_context?.priority_areas || [],
        specificObjectives: onboardingData.goals_info?.specific_objectives || onboardingData.business_context?.specific_objectives
      },
      learningPreferences: {
        style: onboardingData.personalization?.learning_style || 'Visual',
        contentPreference: onboardingData.personalization?.preferred_content || [],
        supportLevel: onboardingData.personalization?.support_level,
        availability: onboardingData.personalization?.availability,
        frequency: onboardingData.personalization?.communication_frequency
      }
    };
  }

  /**
   * Formata localização de forma legível
   */
  private static formatLocation(personalInfo: any): string {
    if (!personalInfo) return 'Localização não informada';
    
    const city = personalInfo.city;
    const state = personalInfo.state;
    
    if (city && state) {
      return `${city}, ${state}`;
    } else if (state) {
      return state;
    } else if (city) {
      return city;
    }
    
    return 'Localização não informada';
  }

  /**
   * Gera summary contextual para IA
   */
  static generateContextSummary(context: PersonalizedContext): string {
    return `
Perfil: ${context.personalProfile.name} de ${context.personalProfile.location}
Empresa: ${context.businessContext.company} (${context.businessContext.sector}, ${context.businessContext.size})
Cargo: ${context.businessContext.position}
Experiência IA: ${context.aiReadiness.experienceLevel}
Status atual: ${context.aiReadiness.currentStatus}
Objetivo principal: ${context.objectives.primaryGoal}
Estilo de aprendizado: ${context.learningPreferences.style}
    `.trim();
  }

  /**
   * Valida se há dados suficientes para personalização
   */
  static validatePersonalizationData(context: PersonalizedContext): {
    isValid: boolean;
    missingFields: string[];
    completeness: number;
  } {
    const requiredFields = [
      'personalProfile.name',
      'businessContext.sector',
      'aiReadiness.experienceLevel',
      'objectives.primaryGoal'
    ];

    const missingFields: string[] = [];
    let validFields = 0;

    requiredFields.forEach(field => {
      const value = this.getNestedValue(context, field);
      if (!value || value === 'Não informado' || value === 'Usuário') {
        missingFields.push(field);
      } else {
        validFields++;
      }
    });

    const completeness = (validFields / requiredFields.length) * 100;

    return {
      isValid: completeness >= 75,
      missingFields,
      completeness
    };
  }

  /**
   * Função auxiliar para acessar valores aninhados
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Cria contexto de fallback quando dados são insuficientes
   */
  static createFallbackContext(partialData?: any): PersonalizedContext {
    return {
      personalProfile: {
        name: partialData?.name || 'Usuário',
        location: 'Brasil',
        experienceLevel: 'Iniciante'
      },
      businessContext: {
        company: 'Empresa',
        sector: 'Tecnologia',
        size: 'Pequena empresa',
        revenue: 'Até R$ 1M',
        position: 'Profissional'
      },
      aiReadiness: {
        currentStatus: 'Interessado em implementar',
        approach: 'Gradual',
        experienceLevel: 'Iniciante'
      },
      objectives: {
        primaryGoal: 'Aumentar eficiência operacional'
      },
      learningPreferences: {
        style: 'Visual e prático'
      }
    };
  }
}