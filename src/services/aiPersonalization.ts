
import { PersonalizationData } from '@/hooks/onboarding/useOnboardingPersonalization';

export interface NetworkingPersonalization {
  targetCustomerProfile: string;
  targetSupplierProfile: string;
  industries: string[];
  companySizes: string[];
  geographicPreferences: string[];
  keySkills: string[];
  businessObjectives: string[];
}

export interface TrailPersonalization {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  recommendedSolutions: string[];
  learningPath: string[];
  implementationPriority: 'quick_wins' | 'strategic' | 'comprehensive';
}

export class AIPersonalizationService {
  static generateNetworkingPersonalization(data: PersonalizationData): NetworkingPersonalization {
    const companySizeMapping = {
      'micro': ['Microempresa', 'MEI', 'Freelancer'],
      'pequena': ['Pequena empresa', 'Startup'],
      'media': ['Média empresa'],
      'grande': ['Grande empresa', 'Multinacional']
    };

    const segmentMapping = {
      'tecnologia': ['SaaS', 'E-commerce', 'Fintech', 'Healthtech', 'Edtech'],
      'servicos': ['Consultoria', 'Marketing', 'Educação', 'Saúde'],
      'varejo': ['Comércio', 'Varejo', 'Marketplace'],
      'industria': ['Manufatura', 'Logística', 'Agricultura']
    };

    // Determinar perfil de cliente ideal
    const targetCustomerProfile = this.generateCustomerProfile(data);
    const targetSupplierProfile = this.generateSupplierProfile(data);

    // Mapear indústrias relacionadas
    const industries = this.getRelatedIndustries(data.company_segment);

    // Mapear tamanhos de empresa compatíveis
    const companySizes = this.getCompatibleCompanySizes(data.company_size);

    return {
      targetCustomerProfile,
      targetSupplierProfile,
      industries,
      companySizes,
      geographicPreferences: ['Brasil'], // Pode ser expandido com dados de localização
      keySkills: data.desired_ai_areas,
      businessObjectives: [data.main_goal]
    };
  }

  static generateTrailPersonalization(data: PersonalizationData): TrailPersonalization {
    // Determinar nível de habilidade
    const skillLevel = this.determineSkillLevel(data);
    
    // Focar nas áreas de interesse
    const focusAreas = data.desired_ai_areas;
    
    // Determinar prioridade de implementação
    const implementationPriority = this.determineImplementationPriority(data);
    
    // Gerar recomendações baseadas no perfil
    const recommendedSolutions = this.generateSolutionRecommendations(data);
    const learningPath = this.generateLearningPath(data);

    return {
      skillLevel,
      focusAreas,
      recommendedSolutions,
      learningPath,
      implementationPriority
    };
  }

  private static generateCustomerProfile(data: PersonalizationData): string {
    const size = data.company_size || 'média';
    const segment = data.company_segment || 'serviços';
    const goal = data.main_goal || 'aumentar eficiência';

    return `Empresas ${size}s do setor ${segment} que buscam ${goal} através de soluções de IA`;
  }

  private static generateSupplierProfile(data: PersonalizationData): string {
    const areas = data.desired_ai_areas.join(', ') || 'automação';
    return `Fornecedores especializados em ${areas} com experiência em implementação`;
  }

  private static getRelatedIndustries(segment: string): string[] {
    const industryMap = {
      'tecnologia': ['Software', 'TI', 'Telecomunicações', 'Startups'],
      'servicos': ['Consultoria', 'Marketing', 'Educação', 'Saúde', 'Jurídico'],
      'varejo': ['E-commerce', 'Varejo', 'Marketplace', 'Consumo'],
      'industria': ['Manufatura', 'Logística', 'Agricultura', 'Construção'],
      'financeiro': ['Bancos', 'Fintech', 'Seguros', 'Investimentos']
    };

    return industryMap[segment?.toLowerCase()] || ['Geral'];
  }

  private static getCompatibleCompanySizes(size: string): string[] {
    const sizeMap = {
      'micro': ['MEI', 'Microempresa', 'Pequena empresa'],
      'pequena': ['Microempresa', 'Pequena empresa', 'Média empresa'],
      'media': ['Pequena empresa', 'Média empresa', 'Grande empresa'],
      'grande': ['Média empresa', 'Grande empresa', 'Multinacional']
    };

    return sizeMap[size?.toLowerCase()] || ['Todas'];
  }

  private static determineSkillLevel(data: PersonalizationData): 'beginner' | 'intermediate' | 'advanced' {
    const level = data.ai_knowledge_level?.toLowerCase();
    const hasImplemented = data.has_implemented?.toLowerCase() === 'sim';
    const toolsUsed = data.previous_tools?.length || 0;

    if (level === 'avancado' || (hasImplemented && toolsUsed > 3)) {
      return 'advanced';
    } else if (level === 'intermediario' || hasImplemented || toolsUsed > 0) {
      return 'intermediate';
    }
    return 'beginner';
  }

  private static determineImplementationPriority(data: PersonalizationData): 'quick_wins' | 'strategic' | 'comprehensive' {
    const size = data.company_size?.toLowerCase();
    const revenue = data.annual_revenue_range?.toLowerCase();
    const hasImplemented = data.has_implemented?.toLowerCase() === 'sim';

    if (size === 'micro' || size === 'pequena') {
      return 'quick_wins';
    } else if (hasImplemented || revenue?.includes('alto')) {
      return 'comprehensive';
    }
    return 'strategic';
  }

  private static generateSolutionRecommendations(data: PersonalizationData): string[] {
    const recommendations = [];
    const areas = data.desired_ai_areas;
    const goal = data.main_goal?.toLowerCase();

    // Mapear áreas para soluções
    if (areas.includes('automacao') || goal?.includes('eficiencia')) {
      recommendations.push('Automação de Processos', 'Chatbots');
    }
    
    if (areas.includes('marketing') || goal?.includes('vendas')) {
      recommendations.push('IA para Marketing', 'Análise Preditiva');
    }

    if (areas.includes('atendimento')) {
      recommendations.push('Chatbots Inteligentes', 'Análise de Sentimento');
    }

    return recommendations.length > 0 ? recommendations : ['Introdução à IA', 'Automação Básica'];
  }

  private static generateLearningPath(data: PersonalizationData): string[] {
    const skillLevel = this.determineSkillLevel(data);
    const areas = data.desired_ai_areas;

    const paths = {
      beginner: ['Fundamentos de IA', 'Primeiros Passos com Automação'],
      intermediate: ['IA para Negócios', 'Implementação Prática'],
      advanced: ['IA Estratégica', 'Otimização Avançada']
    };

    let basePath = paths[skillLevel];

    // Adicionar cursos específicos por área
    areas.forEach(area => {
      switch (area) {
        case 'marketing':
          basePath.push('IA para Marketing Digital');
          break;
        case 'atendimento':
          basePath.push('Chatbots e Atendimento Automatizado');
          break;
        case 'vendas':
          basePath.push('IA para Vendas e CRM');
          break;
      }
    });

    return basePath;
  }
}
