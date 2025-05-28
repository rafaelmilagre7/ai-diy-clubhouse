
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserProfile {
  company_name: string;
  company_size: string;
  company_segment: string;
  ai_knowledge_level: string;
  main_goal: string;
  role: string;
  annual_revenue_range?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando geração inteligente da trilha');
    
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'user_id é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar perfil do usuário no quick_onboarding
    console.log('📊 Buscando perfil do usuário...');
    const { data: userData, error: userError } = await supabase
      .from('quick_onboarding')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError || !userData) {
      throw new Error('Dados de onboarding não encontrados');
    }

    const userProfile: UserProfile = {
      company_name: userData.company_name,
      company_size: userData.company_size,
      company_segment: userData.company_segment,
      ai_knowledge_level: userData.ai_knowledge_level,
      main_goal: userData.main_goal,
      role: userData.role,
      annual_revenue_range: userData.annual_revenue_range
    };

    console.log('👤 Perfil do usuário:', userProfile);

    // Buscar todas as soluções e aulas publicadas
    console.log('🔍 Buscando soluções disponíveis...');
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('*')
      .eq('published', true);

    console.log('📚 Buscando aulas disponíveis...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('learning_lessons')
      .select(`
        *,
        learning_modules(
          id,
          title,
          learning_courses(
            id,
            title
          )
        )
      `)
      .eq('published', true);

    if (solutionsError || lessonsError) {
      throw new Error('Erro ao buscar soluções ou aulas');
    }

    console.log(`✅ Encontradas ${solutions?.length || 0} soluções e ${lessons?.length || 0} aulas`);

    // Algoritmo de matching inteligente
    const scoredSolutions = (solutions || []).map(solution => ({
      ...solution,
      score: calculateSolutionScore(solution, userProfile),
      justification: generateSolutionJustification(solution, userProfile)
    })).sort((a, b) => b.score - a.score);

    const scoredLessons = (lessons || []).map(lesson => ({
      ...lesson,
      score: calculateLessonScore(lesson, userProfile),
      justification: generateLessonJustification(lesson, userProfile)
    })).sort((a, b) => b.score - a.score);

    // Distribuir soluções por prioridade
    const trail = {
      priority1: scoredSolutions.slice(0, 3).map(s => ({
        solutionId: s.id,
        justification: s.justification
      })),
      priority2: scoredSolutions.slice(3, 6).map(s => ({
        solutionId: s.id,
        justification: s.justification
      })),
      priority3: scoredSolutions.slice(6, 9).map(s => ({
        solutionId: s.id,
        justification: s.justification
      })),
      recommended_lessons: scoredLessons.slice(0, 5).map((lesson, index) => ({
        lessonId: lesson.id,
        moduleId: lesson.learning_modules?.id,
        courseId: lesson.learning_modules?.learning_courses?.id,
        title: lesson.title,
        moduleTitle: lesson.learning_modules?.title,
        courseTitle: lesson.learning_modules?.learning_courses?.title,
        justification: lesson.justification,
        priority: index + 1
      }))
    };

    console.log('🎯 Trilha gerada:', {
      priority1_count: trail.priority1.length,
      priority2_count: trail.priority2.length,
      priority3_count: trail.priority3.length,
      lessons_count: trail.recommended_lessons.length
    });

    // Salvar no banco
    const { data: existingTrail } = await supabase
      .from('implementation_trails')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existingTrail) {
      const { error: updateError } = await supabase
        .from('implementation_trails')
        .update({
          trail_data: trail,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTrail.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('implementation_trails')
        .insert({
          user_id,
          trail_data: trail,
          status: 'completed'
        });

      if (insertError) throw insertError;
    }

    console.log('✅ Trilha salva com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        trail_data: trail,
        message: 'Trilha inteligente gerada com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na geração da trilha:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function calculateSolutionScore(solution: any, profile: UserProfile): number {
  let score = 0;

  // Score baseado no nível de conhecimento em IA
  if (profile.ai_knowledge_level === 'iniciante' && solution.difficulty === 'easy') {
    score += 30;
  } else if (profile.ai_knowledge_level === 'intermediario' && solution.difficulty === 'medium') {
    score += 30;
  } else if (profile.ai_knowledge_level === 'especialista' && solution.difficulty === 'advanced') {
    score += 30;
  }

  // Score baseado no objetivo principal
  if (profile.main_goal === 'aumentar-receita' && solution.category === 'Receita') {
    score += 25;
  } else if (profile.main_goal === 'reduzir-custos' && solution.category === 'Operacional') {
    score += 25;
  } else if (profile.main_goal === 'melhorar-processos' && solution.category === 'Operacional') {
    score += 25;
  } else if (profile.main_goal === 'inovacao' && solution.category === 'Estratégia') {
    score += 25;
  }

  // Score baseado no tamanho da empresa
  if (profile.company_size === 'startup' || profile.company_size === '1-5') {
    if (solution.difficulty === 'easy') score += 15;
  } else if (profile.company_size === 'grande-empresa') {
    if (solution.difficulty === 'advanced') score += 15;
  }

  // Score baseado no segmento
  if (solution.tags && solution.tags.includes(profile.company_segment)) {
    score += 20;
  }

  // Score aleatório para diversidade
  score += Math.random() * 10;

  return score;
}

function calculateLessonScore(lesson: any, profile: UserProfile): number {
  let score = 0;

  // Score baseado no nível de dificuldade
  if (profile.ai_knowledge_level === 'iniciante' && lesson.difficulty_level === 'beginner') {
    score += 25;
  } else if (profile.ai_knowledge_level === 'intermediario' && lesson.difficulty_level === 'intermediate') {
    score += 25;
  } else if (profile.ai_knowledge_level === 'especialista' && lesson.difficulty_level === 'advanced') {
    score += 25;
  }

  // Score baseado no tempo estimado (preferir aulas mais curtas para iniciantes)
  if (lesson.estimated_time_minutes) {
    if (profile.ai_knowledge_level === 'iniciante' && lesson.estimated_time_minutes <= 30) {
      score += 15;
    } else if (lesson.estimated_time_minutes <= 60) {
      score += 10;
    }
  }

  // Score baseado no título/conteúdo (palavras-chave)
  const keywords = getKeywordsFromProfile(profile);
  const lessonText = `${lesson.title} ${lesson.description || ''}`.toLowerCase();
  
  keywords.forEach(keyword => {
    if (lessonText.includes(keyword.toLowerCase())) {
      score += 15;
    }
  });

  // Score aleatório para diversidade
  score += Math.random() * 5;

  return score;
}

function getKeywordsFromProfile(profile: UserProfile): string[] {
  const keywords: string[] = [];

  // Palavras-chave baseadas no objetivo
  switch (profile.main_goal) {
    case 'aumentar-receita':
      keywords.push('vendas', 'receita', 'marketing', 'conversão');
      break;
    case 'reduzir-custos':
      keywords.push('automação', 'eficiência', 'custos', 'otimização');
      break;
    case 'melhorar-processos':
      keywords.push('processos', 'workflow', 'produtividade', 'gestão');
      break;
    case 'inovacao':
      keywords.push('inovação', 'tecnologia', 'futuro', 'estratégia');
      break;
  }

  // Palavras-chave baseadas no segmento
  keywords.push(profile.company_segment);

  // Palavras-chave baseadas no nível de conhecimento
  if (profile.ai_knowledge_level === 'iniciante') {
    keywords.push('básico', 'introdução', 'iniciante', 'fundamentos');
  } else if (profile.ai_knowledge_level === 'intermediario') {
    keywords.push('intermediário', 'aplicação', 'prática');
  } else {
    keywords.push('avançado', 'especialista', 'expert', 'técnico');
  }

  return keywords;
}

function generateSolutionJustification(solution: any, profile: UserProfile): string {
  const justifications = [
    `Ideal para ${profile.company_name} com base no seu objetivo de ${profile.main_goal}`,
    `Perfeita para empresas ${profile.company_size} no segmento ${profile.company_segment}`,
    `Recomendada para seu nível ${profile.ai_knowledge_level} em IA`,
    `Solução estratégica para acelerar o crescimento da ${profile.company_name}`,
    `Implementação ${solution.difficulty} alinhada com seu perfil profissional`
  ];

  return justifications[Math.floor(Math.random() * justifications.length)];
}

function generateLessonJustification(lesson: any, profile: UserProfile): string {
  const justifications = [
    `Essencial para complementar seu conhecimento ${profile.ai_knowledge_level}`,
    `Aula estratégica para atingir seu objetivo de ${profile.main_goal}`,
    `Conteúdo direcionado para empresas ${profile.company_size}`,
    `Fundamental para aplicar IA no segmento ${profile.company_segment}`,
    `Conhecimento prático para acelerar sua implementação`
  ];

  return justifications[Math.floor(Math.random() * justifications.length)];
}
