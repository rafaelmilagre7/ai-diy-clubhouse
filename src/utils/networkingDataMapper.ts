import { Database } from '@/integrations/supabase/types';

type OnboardingData = Database['public']['Tables']['onboarding_final']['Row'];

export interface NetworkingMappedData {
  value_proposition: string;
  looking_for: string[];
  main_challenge: string;
  keywords: string[];
}

/**
 * Mapeia dados do onboarding_final para formato de networking_profiles_v2
 */
export function mapOnboardingToNetworking(onboarding: OnboardingData): NetworkingMappedData {
  const goals = onboarding.goals_info as any || {};
  const aiExp = onboarding.ai_experience as any || {};
  const businessInfo = onboarding.business_info as any || {};
  const personalization = onboarding.personalization as any || {};
  
  // VALUE PROPOSITION: Combinar objetivos principais
  const value_proposition = [
    goals.main_objective,
    goals.area_to_impact,
    goals.expected_result_90_days
  ].filter(Boolean).join(' • ') || 'Desenvolvimento de negócios estratégicos';
  
  // LOOKING FOR: Derivar de preferências e setor
  const looking_for: string[] = [];
  if (personalization.wants_networking === true || personalization.wants_networking === 'yes') {
    looking_for.push('Parcerias estratégicas');
  }
  if (businessInfo.business_sector) {
    looking_for.push(`Conexões em ${businessInfo.business_sector}`);
  }
  if (goals.main_objective?.includes('cliente') || goals.main_objective?.includes('venda')) {
    looking_for.push('Novos clientes');
  }
  if (looking_for.length === 0) {
    looking_for.push('Oportunidades de negócio', 'Networking B2B');
  }
  
  // MAIN CHALLENGE: Usar desafio de IA ou obstáculo principal
  const main_challenge = aiExp.ai_main_challenge || goals.main_obstacle || 
    'Expansão de rede de contatos estratégicos';
  
  // KEYWORDS: Derivar de nível de IA, urgência, preferências
  const keywords: string[] = [];
  
  // Mapeamento de AI knowledge level
  const aiLevelMap: Record<string, string> = {
    'iniciante': 'Inovador',
    'basico': 'Colaborativo',
    'intermediario': 'Estratégico',
    'avancado': 'Visionário',
    'expert': 'Data-Driven'
  };
  if (aiExp.ai_knowledge_level && aiLevelMap[aiExp.ai_knowledge_level]) {
    keywords.push(aiLevelMap[aiExp.ai_knowledge_level]);
  }
  
  // Mapeamento de urgência
  const urgencyMap: Record<string, string> = {
    'low': 'Organizado',
    'medium': 'Eficiente',
    'high': 'Orientado a Resultados',
    'critical': 'Resiliente'
  };
  if (goals.urgency_level && urgencyMap[goals.urgency_level]) {
    keywords.push(urgencyMap[goals.urgency_level]);
  }
  
  // Mapeamento de preferência de conteúdo
  const contentMap: Record<string, string> = {
    'video': 'Criativo',
    'text': 'Analítico',
    'interactive': 'Adaptável',
    'practical': 'Prático'
  };
  if (personalization.content_preference && contentMap[personalization.content_preference]) {
    keywords.push(contentMap[personalization.content_preference]);
  }
  
  // Garantir pelo menos 3 keywords
  while (keywords.length < 3) {
    const defaults = ['Estratégico', 'Colaborativo', 'Inovador', 'Eficiente', 'Resiliente'];
    const missing = defaults.find(k => !keywords.includes(k));
    if (missing) keywords.push(missing);
    else break;
  }
  
  return {
    value_proposition,
    looking_for: looking_for.slice(0, 5), // Máximo 5
    main_challenge,
    keywords: keywords.slice(0, 3) // Máximo 3
  };
}
