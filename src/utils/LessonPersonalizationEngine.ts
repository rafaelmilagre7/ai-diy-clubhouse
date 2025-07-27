import { PersonalizedContext } from '@/adapters/OnboardingToAIAdapter';
import { LearningLesson } from '@/lib/supabase/types/learning';
import { RecommendedLesson } from '@/types/implementationTrail';

export interface PersonalizationScore {
  total: number;
  experienceMatch: number;
  sectorRelevance: number;
  goalAlignment: number;
  learningFit: number;
  reasoning: string;
}

export class LessonPersonalizationEngine {
  /**
   * Calcula score de personalização para uma aula específica
   */
  static calculatePersonalizationScore(
    lesson: any,
    userContext: PersonalizedContext
  ): PersonalizationScore {
    const experienceMatch = this.calculateExperienceMatch(lesson, userContext.aiReadiness);
    const sectorRelevance = this.calculateSectorRelevance(lesson, userContext.businessContext);
    const goalAlignment = this.calculateGoalAlignment(lesson, userContext.objectives);
    const learningFit = this.calculateLearningFit(lesson, userContext.learningPreferences);
    
    const total = Math.min(experienceMatch + sectorRelevance + goalAlignment + learningFit, 100);
    
    return {
      total,
      experienceMatch,
      sectorRelevance,
      goalAlignment,
      learningFit,
      reasoning: this.generateReasoning(lesson, userContext, {
        experienceMatch,
        sectorRelevance,
        goalAlignment,
        learningFit
      })
    };
  }

  /**
   * Score baseado na compatibilidade com nível de experiência (0-25 pontos)
   */
  private static calculateExperienceMatch(lesson: any, aiReadiness: PersonalizedContext['aiReadiness']): number {
    const experienceLevel = aiReadiness.experienceLevel.toLowerCase();
    const lessonDifficulty = lesson.difficulty_level?.toLowerCase() || 'intermediário';
    
    // Mapping de compatibilidade
    const compatibilityMatrix: Record<string, Record<string, number>> = {
      'iniciante': {
        'básico': 25,
        'iniciante': 25,
        'intermediário': 15,
        'avançado': 5
      },
      'intermediário': {
        'básico': 20,
        'iniciante': 20,
        'intermediário': 25,
        'avançado': 15
      },
      'avançado': {
        'básico': 10,
        'iniciante': 10,
        'intermediário': 20,
        'avançado': 25
      }
    };

    return compatibilityMatrix[experienceLevel]?.[lessonDifficulty] || 15;
  }

  /**
   * Score baseado na relevância para o setor (0-25 pontos)
   */
  private static calculateSectorRelevance(lesson: any, businessContext: PersonalizedContext['businessContext']): number {
    const sector = businessContext.sector.toLowerCase();
    const lessonTitle = lesson.title?.toLowerCase() || '';
    const lessonDescription = lesson.description?.toLowerCase() || '';
    
    // Keywords por setor
    const sectorKeywords: Record<string, string[]> = {
      'tecnologia': ['software', 'desenvolvimento', 'programação', 'api', 'automação', 'dados'],
      'saúde': ['diagnóstico', 'análise médica', 'paciente', 'clínico', 'telemedicina'],
      'educação': ['aprendizado', 'estudante', 'ensino', 'educacional', 'pedagógico'],
      'varejo': ['vendas', 'cliente', 'produto', 'estoque', 'marketing', 'e-commerce'],
      'financeiro': ['análise financeira', 'risco', 'investimento', 'crédito', 'fraude'],
      'marketing': ['campanha', 'cliente', 'engagement', 'conversão', 'social media'],
      'recursos humanos': ['recrutamento', 'funcionário', 'talento', 'performance'],
      'operações': ['processo', 'eficiência', 'produtividade', 'workflow', 'automação']
    };

    let score = 10; // Score base
    const keywords = sectorKeywords[sector] || [];
    
    for (const keyword of keywords) {
      if (lessonTitle.includes(keyword) || lessonDescription.includes(keyword)) {
        score += 3;
      }
    }

    // Score adicional para aulas genéricas aplicáveis a qualquer setor
    const genericKeywords = ['fundamentos', 'introdução', 'básico', 'conceitos', 'estratégia'];
    for (const keyword of genericKeywords) {
      if (lessonTitle.includes(keyword)) {
        score += 2;
      }
    }

    return Math.min(score, 25);
  }

  /**
   * Score baseado no alinhamento com objetivos (0-25 pontos)
   */
  private static calculateGoalAlignment(lesson: any, objectives: PersonalizedContext['objectives']): number {
    const primaryGoal = objectives.primaryGoal.toLowerCase();
    const priorityAreas = objectives.priorityAreas?.map(area => area.toLowerCase()) || [];
    const lessonContent = `${lesson.title} ${lesson.description}`.toLowerCase();
    
    // Mapping de objetivos para keywords
    const goalKeywords: Record<string, string[]> = {
      'aumentar eficiência': ['automação', 'produtividade', 'eficiência', 'otimização'],
      'reduzir custos': ['automação', 'eficiência', 'economia', 'redução'],
      'melhorar atendimento': ['cliente', 'atendimento', 'chatbot', 'suporte'],
      'análise de dados': ['dados', 'analytics', 'análise', 'dashboard', 'relatório'],
      'vendas': ['vendas', 'conversão', 'lead', 'marketing', 'cliente'],
      'inovação': ['inovação', 'transformação', 'digital', 'futuro', 'tecnologia']
    };

    let score = 10; // Score base

    // Score por objetivo principal
    const mainGoalKeywords = goalKeywords[primaryGoal] || [];
    for (const keyword of mainGoalKeywords) {
      if (lessonContent.includes(keyword)) {
        score += 3;
      }
    }

    // Score por áreas prioritárias
    for (const area of priorityAreas) {
      const areaKeywords = goalKeywords[area] || [];
      for (const keyword of areaKeywords) {
        if (lessonContent.includes(keyword)) {
          score += 2;
        }
      }
    }

    return Math.min(score, 25);
  }

  /**
   * Score baseado no fit com preferências de aprendizado (0-25 pontos)
   */
  private static calculateLearningFit(lesson: any, learningPreferences: PersonalizedContext['learningPreferences']): number {
    const style = learningPreferences.style.toLowerCase();
    const contentPrefs = learningPreferences.contentPreference?.map(p => p.toLowerCase()) || [];
    const duration = lesson.estimated_time_minutes || 30;
    
    let score = 15; // Score base

    // Score por duração baseado na disponibilidade
    const availability = learningPreferences.availability?.toLowerCase();
    if (availability === 'pouco tempo' && duration <= 15) {
      score += 5;
    } else if (availability === 'tempo moderado' && duration <= 30) {
      score += 3;
    } else if (availability === 'bastante tempo' && duration > 30) {
      score += 3;
    }

    // Score por tipo de conteúdo preferido
    const lessonType = this.inferLessonType(lesson);
    for (const pref of contentPrefs) {
      if (lessonType.includes(pref)) {
        score += 2;
      }
    }

    return Math.min(score, 25);
  }

  /**
   * Infere o tipo de aula baseado no conteúdo
   */
  private static inferLessonType(lesson: any): string[] {
    const content = `${lesson.title} ${lesson.description}`.toLowerCase();
    const types: string[] = [];

    if (content.includes('prático') || content.includes('hands-on') || content.includes('tutorial')) {
      types.push('prático');
    }
    if (content.includes('teoria') || content.includes('conceito') || content.includes('fundamento')) {
      types.push('teórico');
    }
    if (content.includes('vídeo') || content.includes('visual')) {
      types.push('visual');
    }
    if (content.includes('case') || content.includes('exemplo') || content.includes('estudo')) {
      types.push('case study');
    }

    return types.length > 0 ? types : ['geral'];
  }

  /**
   * Gera justificativa personalizada para a recomendação
   */
  private static generateReasoning(
    lesson: any, 
    userContext: PersonalizedContext,
    scores: { experienceMatch: number; sectorRelevance: number; goalAlignment: number; learningFit: number }
  ): string {
    const reasons: string[] = [];

    // Razão baseada na experiência
    if (scores.experienceMatch >= 20) {
      reasons.push(`Ideal para seu nível ${userContext.aiReadiness.experienceLevel.toLowerCase()}`);
    }

    // Razão baseada no setor
    if (scores.sectorRelevance >= 20) {
      reasons.push(`Altamente relevante para ${userContext.businessContext.sector.toLowerCase()}`);
    }

    // Razão baseada nos objetivos
    if (scores.goalAlignment >= 20) {
      reasons.push(`Alinha com seu objetivo: ${userContext.objectives.primaryGoal.toLowerCase()}`);
    }

    // Razão baseada no cargo
    if (userContext.businessContext.position.toLowerCase().includes('gerente') || 
        userContext.businessContext.position.toLowerCase().includes('diretor')) {
      reasons.push('Focado em gestão e estratégia');
    } else if (userContext.businessContext.position.toLowerCase().includes('analista') ||
               userContext.businessContext.position.toLowerCase().includes('desenvolvedor')) {
      reasons.push('Orientado para aplicação prática');
    }

    return reasons.length > 0 ? reasons.join(' • ') : 'Recomendado para sua jornada de IA';
  }

  /**
   * Prioriza aulas baseado no contexto do usuário
   */
  static prioritizeLessons(
    lessons: any[],
    userContext: PersonalizedContext
  ): RecommendedLesson[] {
    const scoredLessons = lessons.map(lesson => {
      const scores = this.calculatePersonalizationScore(lesson, userContext);
      return {
        lesson,
        scores,
        totalScore: scores.total
      };
    });

    // Ordenar por score e selecionar top 8
    const topLessons = scoredLessons
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 8);

    // Converter para formato RecommendedLesson
    return topLessons.map((item, index) => ({
      lessonId: item.lesson.id,
      moduleId: item.lesson.module_id || 'unknown-module',
      courseId: item.lesson.course_id || 'unknown-course',
      title: item.lesson.title,
      justification: item.scores.reasoning,
      priority: index < 3 ? 1 : index < 6 ? 2 : 3,
      personalizationScore: item.totalScore
    }));
  }

  /**
   * Gera insights sobre a personalização
   */
  static generatePersonalizationInsights(userContext: PersonalizedContext): {
    profileStrength: number;
    recommendations: string[];
    focusAreas: string[];
  } {
    const recommendations: string[] = [];
    const focusAreas: string[] = [];

    // Analisar perfil
    const experience = userContext.aiReadiness.experienceLevel.toLowerCase();
    if (experience === 'iniciante') {
      recommendations.push('Comece com fundamentos antes de partir para implementações');
      focusAreas.push('Conceitos básicos de IA');
    } else if (experience === 'avançado') {
      recommendations.push('Foque em especializações e casos avançados');
      focusAreas.push('Implementações complexas');
    }

    // Analisar objetivos
    const goal = userContext.objectives.primaryGoal.toLowerCase();
    if (goal.includes('eficiência')) {
      focusAreas.push('Automação de processos');
    } else if (goal.includes('vendas')) {
      focusAreas.push('IA para vendas e marketing');
    } else if (goal.includes('dados')) {
      focusAreas.push('Analytics e Business Intelligence');
    }

    // Calcular força do perfil
    const profileStrength = this.calculateProfileStrength(userContext);

    return {
      profileStrength,
      recommendations,
      focusAreas
    };
  }

  /**
   * Calcula a força do perfil para personalização
   */
  private static calculateProfileStrength(userContext: PersonalizedContext): number {
    let strength = 0;
    
    // Dados pessoais (20 pontos)
    if (userContext.personalProfile.name !== 'Usuário') strength += 10;
    if (userContext.personalProfile.location !== 'Localização não informada') strength += 10;
    
    // Dados empresariais (30 pontos)
    if (userContext.businessContext.company !== 'Empresa não informada') strength += 10;
    if (userContext.businessContext.sector !== 'Setor não informado') strength += 10;
    if (userContext.businessContext.position !== 'Cargo não informado') strength += 10;
    
    // Experiência com IA (25 pontos)
    if (userContext.aiReadiness.experienceLevel !== 'Iniciante') strength += 15;
    if (userContext.aiReadiness.currentStatus !== 'Não implementado') strength += 10;
    
    // Objetivos (25 pontos)
    if (userContext.objectives.primaryGoal !== 'Aumentar eficiência') strength += 15;
    if (userContext.objectives.priorityAreas && userContext.objectives.priorityAreas.length > 0) strength += 10;

    return Math.min(strength, 100);
  }
}