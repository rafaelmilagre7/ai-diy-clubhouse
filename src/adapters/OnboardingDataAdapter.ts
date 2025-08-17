/**
 * Adapter class for handling onboarding data transformations and validations
 */
export class OnboardingDataAdapter {
  
  /**
   * Validates if onboarding data is complete
   */
  static isOnboardingComplete(data: any): boolean {
    console.log('[OnboardingDataAdapter] Validando completude dos dados:', data);
    
    const hasPersonalInfo = !!(
      data.personal_info?.name &&
      data.personal_info?.phone &&
      data.personal_info?.state &&
      data.personal_info?.city
    );

    const hasBusinessInfo = !!(
      data.professional_info?.company_name &&
      data.professional_info?.company_sector
    );

    const hasAIExperience = !!(
      data.ai_experience?.experience_level
    );

    const hasGoals = !!(
      data.goals_info?.primary_goal
    );

    const hasPersonalization = !!(
      data.personalization?.learning_style
    );

    const hasUserType = !!(data.user_type);

    const isComplete = hasPersonalInfo && hasBusinessInfo && hasAIExperience && hasGoals && hasPersonalization && hasUserType;
    
    console.log('[OnboardingDataAdapter] Resultado da validação:', {
      hasPersonalInfo,
      hasBusinessInfo, 
      hasAIExperience,
      hasGoals,
      hasPersonalization,
      hasUserType,
      isComplete
    });

    return isComplete;
  }

  /**
   * Calculates completion percentage
   */
  static getCompletionPercentage(data: any): number {
    const checks = [
      !!data.user_type,
      !!(data.personal_info?.name && data.personal_info?.phone && data.personal_info?.state && data.personal_info?.city),
      !!(data.professional_info?.company_name && data.professional_info?.company_sector),
      !!(data.ai_experience?.experience_level),
      !!(data.goals_info?.primary_goal),
      !!(data.personalization?.learning_style)
    ];

    const completedChecks = checks.filter(Boolean).length;
    return Math.round((completedChecks / checks.length) * 100);
  }

  /**
   * Gets next required field for completion
   */
  static getNextRequiredField(data: any): string {
    if (!data.user_type) return 'Tipo de usuário';
    if (!data.personal_info?.name) return 'Nome';
    if (!data.personal_info?.phone) return 'Telefone';
    if (!data.personal_info?.state) return 'Estado';
    if (!data.personal_info?.city) return 'Cidade';
    if (!data.professional_info?.company_name) return 'Nome da empresa';
    if (!data.professional_info?.company_sector) return 'Setor da empresa';
    if (!data.ai_experience?.experience_level) return 'Nível de experiência em IA';
    if (!data.goals_info?.primary_goal) return 'Objetivo principal';
    if (!data.personalization?.learning_style) return 'Estilo de aprendizado';
    
    return 'Onboarding completo';
  }

  /**
   * Formats data for database storage
   */
  static formatForStorage(data: any): Record<string, any> {
    return {
      user_type: data.user_type || 'entrepreneur',
      personal_info: data.personal_info || {},
      business_info: data.professional_info || {}, // Map to business_info for DB
      ai_experience: data.ai_experience || {},
      goals: data.goals_info || {}, // Map to goals for DB
      preferences: data.personalization || {}, // Map to preferences for DB
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Formats data from database storage
   */
  static formatFromStorage(dbData: Record<string, any>): any {
    return {
      user_type: dbData.user_type || 'entrepreneur',
      personal_info: dbData.personal_info || {},
      professional_info: dbData.business_info || {}, // Map from business_info
      ai_experience: dbData.ai_experience || {},
      goals_info: dbData.goals || {}, // Map from goals
      personalization: dbData.preferences || {} // Map from preferences
    };
  }

  /**
   * Gets appropriate welcome message based on user type and data
   */
  static generateWelcomeMessage(data: any): string {
    const userType = data.user_type || 'entrepreneur';
    const firstName = data.personal_info?.name?.split(' ')[0] || 'Usuário';
    
    if (userType === 'learner') {
      const experienceLevel = data.ai_experience?.experience_level;
      
      switch (experienceLevel) {
        case 'complete_beginner':
          return `Olá ${firstName}! Que empolgante começar do zero na jornada de IA! Preparei um caminho de aprendizado especialmente para iniciantes, com conteúdos práticos e fáceis de entender. Vamos descobrir juntos o incrível mundo da inteligência artificial!`;
        
        case 'curious':
          return `${firstName}, sua curiosidade sobre IA é o primeiro passo para o sucesso! Como você já tem uma base, vou focar em aprofundar seus conhecimentos e mostrar aplicações práticas. Prepare-se para transformar sua curiosidade em expertise!`;
        
        case 'student':
          return `${firstName}, que ótimo ter alguém dedicado aos estudos por aqui! Vou complementar seus estudos acadêmicos com experiências práticas e tendências do mercado. Juntos vamos acelerar seu desenvolvimento profissional!`;
        
        case 'professional':
          return `${firstName}, sua experiência profissional é um grande diferencial! Vou ajudar você a se especializar em IA de forma estratégica, focando em como aplicar no seu contexto profissional e se destacar no mercado.`;
        
        default:
          return `${firstName}, bem-vindo à sua jornada de aprendizado em IA! Vou personalizar cada conteúdo para maximizar seu desenvolvimento. Prepare-se para uma experiência transformadora!`;
      }
    } else {
      const experienceLevel = data.ai_experience?.experience_level;
      const companyName = data.professional_info?.company_name || 'sua empresa';
      
      switch (experienceLevel) {
        case 'beginner':
          return `${firstName}, que oportunidade incrível implementar IA na ${companyName}! Vou te guiar passo a passo, desde as primeiras ferramentas até estratégias avançadas. Prepare-se para transformar seu negócio!`;
        
        case 'basic':
          return `${firstName}, vejo que já deu os primeiros passos com IA! Agora vamos estruturar uma estratégia sólida para a ${companyName} e expandir o uso de forma inteligente e eficiente.`;
        
        case 'intermediate':
          return `${firstName}, sua experiência com IA já é considerável! Vou ajudar você a otimizar os processos existentes na ${companyName} e identificar novas oportunidades de crescimento com inteligência artificial.`;
        
        case 'advanced':
          return `${firstName}, impressionante como a ${companyName} já está avançada em IA! Vou focar em estratégias de inovação, tendências emergentes e como manter a vantagem competitiva no mercado.`;
        
        default:
          return `${firstName}, bem-vindo à transformação digital da ${companyName}! Juntos vamos criar uma estratégia personalizada de IA para impulsionar seus resultados.`;
      }
    }
  }
}