import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UserProfile {
  // Dados pessoais básicos
  name?: string;
  company_name?: string;
  current_position?: string;
  industry?: string;
  
  // Dados do onboarding completos
  business_info?: any;
  ai_experience?: any;
  business_goals?: any;
  personal_info?: any;
  professional_info?: any;
  personalization?: any;
  
  // Campos derivados para compatibilidade
  company_size?: string;
  annual_revenue?: string;
  ai_knowledge_level?: string;
  main_goal?: string;
}

interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
}

// Matriz de pontuação baseada em perfil completo
const SCORING_MATRIX = {
  // Pontuação por setor/indústria
  industry: {
    'tecnologia': { category: 'Automação', bonus: 25 },
    'vendas': { category: 'Receita', bonus: 30 },
    'marketing': { category: 'Marketing', bonus: 30 },
    'educacao': { category: 'Operacional', bonus: 20 },
    'consultoria': { category: 'Automação', bonus: 25 },
    'saude': { category: 'Operacional', bonus: 20 },
    'financeiro': { category: 'Automação', bonus: 25 },
  },
  
  // Pontuação por tamanho da empresa
  companySize: {
    'solo': { difficulty: 'easy', bonus: 15 },
    '2-10': { difficulty: 'easy', bonus: 10 },
    '11-25': { difficulty: 'medium', bonus: 5 },
    '26-50': { difficulty: 'medium', bonus: 0 },
    '51-100': { difficulty: 'advanced', bonus: -5 },
    '101+': { difficulty: 'advanced', bonus: -10 },
  },
  
  // Pontuação por experiência em IA
  aiExperience: {
    'basic': { difficulty: 'easy', bonus: 25 },
    'intermediate': { difficulty: 'medium', bonus: 15 },
    'advanced': { difficulty: 'advanced', bonus: 5 },
    // Manter compatibilidade com valores antigos
    'iniciante': { difficulty: 'easy', bonus: 25 },
    'intermediario': { difficulty: 'medium', bonus: 15 },
    'avancado': { difficulty: 'advanced', bonus: 5 },
  },
  
  // Pontuação por objetivo principal
  mainGoal: {
    'sales_growth': { category: 'Receita', bonus: 35 },
    'productivity': { category: 'Automação', bonus: 35 },
    'cost_reduction': { category: 'Operacional', bonus: 35 },
    'customer_satisfaction': { category: 'Atendimento', bonus: 30 },
    // Compatibilidade
    'aumentar_vendas': { category: 'Receita', bonus: 35 },
    'automatizar_processos': { category: 'Automação', bonus: 35 },
    'melhorar_marketing': { category: 'Marketing', bonus: 35 },
    'otimizar_operacoes': { category: 'Operacional', bonus: 35 },
  },

  // Pontuação por áreas prioritárias
  priorityAreas: {
    'Marketing e vendas': { category: 'Receita', bonus: 20 },
    'Automação de tarefas repetitivas': { category: 'Automação', bonus: 20 },
    'Análise de dados': { category: 'Estratégia', bonus: 20 },
    'Atendimento ao cliente': { category: 'Atendimento', bonus: 20 },
    'Criação de conteúdo': { category: 'Marketing', bonus: 15 },
    'Gestão de equipes': { category: 'Operacional', bonus: 15 },
  },

  // Pontuação por capacidade de investimento
  investmentCapacity: {
    'low': { difficulty: 'easy', bonus: 10 },
    'medium': { difficulty: 'medium', bonus: 5 },
    'high': { difficulty: 'advanced', bonus: 0 },
    'enterprise': { difficulty: 'advanced', bonus: -5 },
  },

  // Pontuação por estilo de aprendizado
  learningStyle: {
    'hands_on': { tags: ['pratico', 'implementacao'], bonus: 15 },
    'visual': { tags: ['video', 'infografico'], bonus: 10 },
    'reading': { tags: ['documentacao', 'tutorial'], bonus: 10 },
    'mixed': { tags: ['pratico', 'video'], bonus: 12 },
  },
};

function calculateSolutionScore(solution: Solution, profile: UserProfile): number {
  let score = 50; // Score base
  
  // Bonus por categoria preferida baseada na indústria
  const industryPrefs = SCORING_MATRIX.industry[profile.industry?.toLowerCase() || ''];
  if (industryPrefs && solution.category === industryPrefs.category) {
    score += industryPrefs.bonus;
  }
  
  // Bonus por dificuldade adequada ao tamanho da empresa
  const sizePrefs = SCORING_MATRIX.companySize[profile.company_size || 'solo'];
  if (sizePrefs && solution.difficulty === sizePrefs.difficulty) {
    score += sizePrefs.bonus;
  }
  
  // Bonus por experiência em IA
  const aiLevel = profile.ai_knowledge_level || 'basic';
  const aiPrefs = SCORING_MATRIX.aiExperience[aiLevel];
  if (aiPrefs && solution.difficulty === aiPrefs.difficulty) {
    score += aiPrefs.bonus;
  }
  
  // Bonus por objetivo principal
  const goalPrefs = SCORING_MATRIX.mainGoal[profile.main_goal || ''];
  if (goalPrefs && solution.category === goalPrefs.category) {
    score += goalPrefs.bonus;
  }

  // NOVO: Bonus por áreas prioritárias do onboarding
  const priorityAreas = profile.business_goals?.priority_areas || [];
  priorityAreas.forEach((area: string) => {
    const areaPrefs = SCORING_MATRIX.priorityAreas[area];
    if (areaPrefs && solution.category === areaPrefs.category) {
      score += areaPrefs.bonus;
    }
  });

  // NOVO: Bonus por capacidade de investimento
  const investmentCapacity = profile.business_goals?.investment_capacity || 'medium';
  const investmentPrefs = SCORING_MATRIX.investmentCapacity[investmentCapacity];
  if (investmentPrefs && solution.difficulty === investmentPrefs.difficulty) {
    score += investmentPrefs.bonus;
  }

  // NOVO: Bonus por estilo de aprendizado
  const learningStyle = profile.personalization?.learning_style || 'mixed';
  const stylePrefs = SCORING_MATRIX.learningStyle[learningStyle];
  if (stylePrefs) {
    const matchingStyleTags = solution.tags?.filter(tag => 
      stylePrefs.tags.some(styleTag => tag.toLowerCase().includes(styleTag))
    ).length || 0;
    score += matchingStyleTags * stylePrefs.bonus;
  }
  
  // Bonus por tags relevantes (melhorado)
  const relevantTags = ['automacao', 'vendas', 'marketing', 'whatsapp', 'linkedin', 'chatbot', 'crm'];
  const matchingTags = solution.tags?.filter(tag => 
    relevantTags.includes(tag.toLowerCase())
  ).length || 0;
  score += matchingTags * 8;
  
  // NOVO: Bonus por alinhamento com desafios principais
  const mainChallenge = profile.professional_info?.main_challenge || '';
  if (mainChallenge.toLowerCase().includes('vendas') && solution.category === 'Receita') {
    score += 15;
  }
  if (mainChallenge.toLowerCase().includes('automação') && solution.category === 'Automação') {
    score += 15;
  }
  if (mainChallenge.toLowerCase().includes('marketing') && solution.category === 'Marketing') {
    score += 15;
  }
  
  // Garantir que o score está entre 0 e 100
  return Math.max(0, Math.min(100, score));
}

function generatePersonalizedJustification(solution: Solution, profile: UserProfile, score: number): string {
  const reasons = [];
  
  // Razão baseada na indústria
  const industryPrefs = SCORING_MATRIX.industry[profile.industry?.toLowerCase() || ''];
  if (industryPrefs && solution.category === industryPrefs.category) {
    reasons.push(`Ideal para empresas do setor ${profile.industry}`);
  }
  
  // Razão baseada no objetivo principal
  const goalPrefs = SCORING_MATRIX.mainGoal[profile.main_goal || ''];
  if (goalPrefs && solution.category === goalPrefs.category) {
    reasons.push(`Alinhado com seu objetivo de ${profile.main_goal?.replace('_', ' ')}`);
  }

  // NOVO: Razão baseada nas áreas prioritárias
  const priorityAreas = profile.business_goals?.priority_areas || [];
  const matchingAreas = priorityAreas.filter((area: string) => {
    const areaPrefs = SCORING_MATRIX.priorityAreas[area];
    return areaPrefs && solution.category === areaPrefs.category;
  });
  if (matchingAreas.length > 0) {
    reasons.push(`Foca em ${matchingAreas[0]}, uma de suas áreas prioritárias`);
  }

  // NOVO: Razão baseada no desafio principal
  const mainChallenge = profile.professional_info?.main_challenge || '';
  if (mainChallenge.toLowerCase().includes('vendas') && solution.category === 'Receita') {
    reasons.push('Ajuda diretamente com seu desafio de aumentar vendas');
  }
  if (mainChallenge.toLowerCase().includes('automação') && solution.category === 'Automação') {
    reasons.push('Resolve seu desafio de automação de processos');
  }
  
  // Razão baseada na experiência
  const aiLevel = profile.ai_knowledge_level || 'basic';
  if ((aiLevel === 'basic' || aiLevel === 'iniciante') && solution.difficulty === 'easy') {
    reasons.push('Perfeito para quem está começando com IA');
  } else if ((aiLevel === 'intermediate' || aiLevel === 'intermediario') && solution.difficulty === 'medium') {
    reasons.push('Adequado para seu nível intermediário em IA');
  } else if ((aiLevel === 'advanced' || aiLevel === 'avancado') && solution.difficulty === 'advanced') {
    reasons.push('Desafio adequado para seu nível avançado');
  }

  // NOVO: Razão baseada no estilo de aprendizado
  const learningStyle = profile.personalization?.learning_style;
  if (learningStyle === 'hands_on' && solution.difficulty === 'medium') {
    reasons.push('Solução prática que você pode implementar na mão');
  }
  
  // Razão baseada no tamanho da empresa
  if ((profile.company_size === 'solo' || profile.company_size === '2-10') && solution.difficulty === 'easy') {
    reasons.push('Solução prática para empresas menores');
  } else if (profile.company_size === '26-50' && solution.difficulty === 'medium') {
    reasons.push('Adequada para o porte da sua empresa');
  }
  
  // Fallback genérico mais inteligente
  if (reasons.length === 0) {
    if (score >= 80) {
      reasons.push(`Excelente compatibilidade (${score}%) com seu perfil`);
    } else if (score >= 60) {
      reasons.push(`Boa compatibilidade (${score}%) com seus objetivos`);
    } else {
      reasons.push(`Recomendada com ${score}% de compatibilidade`);
    }
  }
  
  return reasons.slice(0, 2).join('. ') + '.';
}

function estimateImplementationTime(solution: Solution, profile: UserProfile): string {
  const aiLevel = profile.ai_knowledge_level || 'basic';
  const companySize = profile.company_size || 'solo';
  
  let baseHours = 2;
  
  // Ajustar por dificuldade
  if (solution.difficulty === 'medium') baseHours = 4;
  if (solution.difficulty === 'advanced') baseHours = 8;
  
  // Ajustar por experiência
  if (aiLevel === 'basic' || aiLevel === 'iniciante') baseHours *= 1.5;
  if (aiLevel === 'advanced' || aiLevel === 'avancado') baseHours *= 0.7;
  
  // Ajustar por tamanho da empresa
  if (companySize === '51-200' || companySize === '200+') baseHours *= 1.3;
  
  const hours = Math.ceil(baseHours);
  
  if (hours <= 2) return '1-2 horas';
  if (hours <= 4) return '2-4 horas';
  if (hours <= 8) return '4-8 horas';
  return '1-2 dias';
}

async function generateAIInsights(profile: UserProfile, solutions: any[]): Promise<string> {
  if (!openAIApiKey) {
    return `Trilha personalizada criada com base no seu perfil: ${profile.name || 'usuário'}. Focamos em soluções que se alinham com sua experiência em IA (${profile.ai_knowledge_level || 'iniciante'}) e objetivos de negócio.`;
  }

  const prompt = `
Você é um consultor especialista em IA para negócios. Analise o perfil do usuário e as soluções recomendadas para gerar uma mensagem personalizada e motivadora.

PERFIL DO USUÁRIO:
- Nome: ${profile.name || 'N/A'}
- Empresa: ${profile.company_name || 'N/A'}
- Cargo: ${profile.current_position || 'N/A'}
- Setor: ${profile.industry || 'N/A'}
- Tamanho da empresa: ${profile.company_size || 'N/A'}
- Receita anual: ${profile.annual_revenue || 'N/A'}
- Nível de conhecimento em IA: ${profile.ai_knowledge_level || 'N/A'}
- Objetivo principal: ${profile.main_goal || 'N/A'}

SOLUÇÕES RECOMENDADAS:
${solutions.map(s => `- ${s.title} (${s.category}, ${s.difficulty})`).join('\n')}

Gere uma mensagem personalizada (máximo 150 palavras) que:
1. Cumprimente o usuário pelo nome se disponível
2. Destaque como as soluções se alinham com seu perfil
3. Motive para começar a implementação
4. Seja empática e profissional
5. Use linguagem brasileira informal mas respeitosa

IMPORTANTE: Seja específico sobre o setor/área dele e como a IA pode impactar positivamente.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um consultor especialista em IA para negócios, brasileiro, que fala de forma amigável e motivadora.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Trilha personalizada criada especialmente para você!';
  } catch (error) {
    console.error('Erro ao gerar insights de IA:', error);
    return `Olá${profile.name ? `, ${profile.name}` : ''}! Sua trilha foi criada com foco em ${profile.industry || 'seu negócio'}. Priorizamos soluções que se alinham com seu nível ${profile.ai_knowledge_level || 'iniciante'} em IA.`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    console.log('🤖 Gerando trilha inteligente para usuário:', userId);

    // 1. Buscar perfil completo do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Buscar dados do onboarding
    const { data: onboardingData } = await supabase
      .from('onboarding_final')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 3. Buscar todas as soluções disponíveis
    const { data: solutions } = await supabase
      .from('solutions')
      .select('*')
      .eq('published', true);

    if (!solutions || solutions.length === 0) {
      throw new Error('Nenhuma solução encontrada');
    }

    // 4. Consolidar perfil do usuário com TODOS os dados do onboarding
    const userProfile: UserProfile = {
      name: profile?.name || onboardingData?.personal_info?.name,
      company_name: profile?.company_name || onboardingData?.professional_info?.company_name,
      current_position: profile?.current_position || onboardingData?.professional_info?.current_position,
      industry: profile?.industry || onboardingData?.professional_info?.company_sector,
      company_size: onboardingData?.professional_info?.company_size || onboardingData?.company_size,
      annual_revenue: onboardingData?.professional_info?.annual_revenue || onboardingData?.annual_revenue,
      ai_knowledge_level: onboardingData?.ai_experience?.experience_level || onboardingData?.ai_knowledge_level,
      main_goal: onboardingData?.goals_info?.primary_goal || onboardingData?.main_goal,
      business_info: onboardingData?.business_info,
      ai_experience: onboardingData?.ai_experience,
      business_goals: onboardingData?.goals_info,
      personal_info: onboardingData?.personal_info,
      professional_info: onboardingData?.professional_info,
      personalization: onboardingData?.personalization,
    };

    console.log('👤 Perfil consolidado:', {
      name: userProfile.name,
      industry: userProfile.industry,
      ai_level: userProfile.ai_knowledge_level,
      goal: userProfile.main_goal
    });

    // 5. Calcular scores para todas as soluções
    const scoredSolutions = solutions.map(solution => ({
      ...solution,
      aiScore: calculateSolutionScore(solution, userProfile),
      justification: generatePersonalizedJustification(solution, userProfile, 0), // Será recalculado abaixo
      estimatedTime: estimateImplementationTime(solution, userProfile)
    }));

    // Atualizar justificações com scores corretos
    scoredSolutions.forEach(solution => {
      solution.justification = generatePersonalizedJustification(solution, userProfile, solution.aiScore);
    });

    // 6. Ordenar por score e dividir em prioridades
    const sortedSolutions = scoredSolutions.sort((a, b) => b.aiScore - a.aiScore);

    const priority1 = sortedSolutions.slice(0, 3).map(s => ({
      solutionId: s.id,
      justification: s.justification,
      aiScore: s.aiScore,
      estimatedTime: s.estimatedTime
    }));

    const priority2 = sortedSolutions.slice(3, 6).map(s => ({
      solutionId: s.id,
      justification: s.justification,
      aiScore: s.aiScore,
      estimatedTime: s.estimatedTime
    }));

    const priority3 = sortedSolutions.slice(6, 9).map(s => ({
      solutionId: s.id,
      justification: s.justification,
      aiScore: s.aiScore,
      estimatedTime: s.estimatedTime
    }));

    // 7. Gerar mensagem de IA personalizada
    const aiMessage = await generateAIInsights(userProfile, priority1);

    // 8. Gerar aulas recomendadas usando IA
    let recommendedLessons = [];
    try {
      console.log('🎓 Gerando aulas recomendadas com IA...');
      
      // Buscar aulas disponíveis
      const { data: availableLessons } = await supabase
        .from('learning_lessons')
        .select('id, title, description, difficulty_level, estimated_time_minutes, module_id')
        .eq('published', true)
        .order('order_index')
        .limit(15);

      if (availableLessons && availableLessons.length > 0) {
        // Criar prompt para recomendar aulas baseado no perfil e soluções
        const lessonsPrompt = `
        Com base no perfil do usuário e nas soluções prioritárias selecionadas, recomende 5-6 aulas que criem uma jornada de aprendizado coerente.

        PERFIL DO USUÁRIO:
        - Nome: ${userProfile.name || 'N/A'}
        - Setor: ${userProfile.industry || 'N/A'}
        - Nível IA: ${userProfile.ai_knowledge_level || 'iniciante'}
        - Objetivo: ${userProfile.main_goal || 'N/A'}

        SOLUÇÕES PRIORITÁRIAS SELECIONADAS:
        ${priority1.map(s => `- ${s.solutionId}`).join('\n')}

        AULAS DISPONÍVEIS:
        ${availableLessons.map(lesson => `
        ID: ${lesson.id}
        Título: ${lesson.title}
        Descrição: ${lesson.description}
        Dificuldade: ${lesson.difficulty_level}
        Duração: ${lesson.estimated_time_minutes} min
        `).join('\n')}

        Retorne APENAS um JSON no formato:
        {
          "recommendations": [
            {
              "lessonId": "uuid",
              "moduleId": "module-id",
              "courseId": "course-id",
              "title": "título da aula",
              "justification": "justificativa personalizada",
              "priority": 1
            }
          ]
        }
        `;

        const lessonsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: 'Você é um especialista em educação corporativa que cria trilhas de aprendizado personalizadas. Sempre responda em JSON válido.' },
              { role: 'user', content: lessonsPrompt }
            ],
            max_tokens: 1500,
            temperature: 0.3,
          }),
        });

        if (lessonsResponse.ok) {
          const lessonsData = await lessonsResponse.json();
          let lessonsContent = lessonsData.choices[0].message.content.trim();
          
          // Limpar markdown se presente
          if (lessonsContent.startsWith('```json')) {
            lessonsContent = lessonsContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (lessonsContent.startsWith('```')) {
            lessonsContent = lessonsContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          const parsedLessons = JSON.parse(lessonsContent);
          recommendedLessons = parsedLessons.recommendations || [];
          console.log('✅ Aulas recomendadas geradas:', recommendedLessons.length);
        } else {
          console.log('⚠️ Erro na resposta da IA para aulas');
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao gerar aulas recomendadas:', error);
      // Fallback: selecionar aulas básicas
      recommendedLessons = [
        {
          lessonId: 'fallback-1',
          moduleId: 'module-basic',
          courseId: 'course-ai-basics',
          title: 'Introdução à Inteligência Artificial',
          justification: 'Fundamentos essenciais para começar sua jornada em IA',
          priority: 1
        },
        {
          lessonId: 'fallback-2', 
          moduleId: 'module-tools',
          courseId: 'course-ai-tools',
          title: 'Ferramentas de IA para Negócios',
          justification: 'Conheça as principais ferramentas disponíveis no mercado',
          priority: 2
        }
      ];
    }

    // 9. Criar trilha personalizada
    const trail = {
      priority1,
      priority2,
      priority3,
      recommended_lessons: recommendedLessons,
      ai_message: aiMessage,
      generated_at: new Date().toISOString(),
      personalization_score: Math.round(sortedSolutions.slice(0, 3).reduce((acc, s) => acc + s.aiScore, 0) / 3)
    };

    // 9. Salvar trilha no banco
    const { error: insertError } = await supabase
      .from('implementation_trails')
      .upsert({
        user_id: userId,
        trail_data: trail,
        status: 'completed',
        generation_attempts: 1
      });

    if (insertError) {
      console.error('Erro ao salvar trilha:', insertError);
      throw insertError;
    }

    console.log('✅ Trilha inteligente gerada com sucesso');

    return new Response(JSON.stringify({ 
      success: true, 
      trail,
      personalization_insights: {
        profile_completeness: Object.values(userProfile).filter(v => v).length / Object.keys(userProfile).length,
        top_category: priority1[0] ? solutions.find(s => s.id === priority1[0].solutionId)?.category : null,
        avg_score: Math.round(sortedSolutions.slice(0, 3).reduce((acc, s) => acc + s.aiScore, 0) / 3)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-smart-trail:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});