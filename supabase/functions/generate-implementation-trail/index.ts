
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { getSupabaseServiceClient, cleanupConnections } from '../_shared/supabase-client.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OnboardingData {
  personal_info: {
    name: string;
    email: string;
  };
  professional_info: {
    company_name: string;
    role: string;
    company_size: string;
    company_segment: string;
    annual_revenue_range: string;
  };
  ai_experience: {
    knowledge_level: string;
    uses_ai: string;
    main_goal: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando geração de trilha de implementação');
    
    // Parse request data
    const { user_id, onboarding_data } = await req.json() as {
      user_id: string;
      onboarding_data: OnboardingData;
    };

    console.log('📊 Dados recebidos:', {
      user_id,
      onboarding_data
    });

    // Validate required data
    if (!user_id) {
      console.error('❌ user_id não fornecido');
      return new Response(
        JSON.stringify({ success: false, error: 'user_id é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!onboarding_data?.professional_info?.company_name || !onboarding_data?.ai_experience?.knowledge_level) {
      console.error('❌ Dados de onboarding incompletos');
      return new Response(
        JSON.stringify({ success: false, error: 'Dados de onboarding incompletos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    console.log('🔧 Configurando cliente Supabase...');
    const supabase = getSupabaseServiceClient();

    // Fetch available solutions
    console.log('📋 Buscando soluções disponíveis...');
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('id, title, description, category, difficulty')
      .eq('published', true);

    if (solutionsError) {
      console.error('❌ Erro ao buscar soluções:', solutionsError);
      throw new Error('Erro ao buscar soluções disponíveis');
    }

    console.log(`✅ ${solutions?.length || 0} soluções encontradas`);

    // Fetch available lessons (usando a tabela correta: learning_lessons)
    console.log('📚 Buscando aulas disponíveis...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('learning_lessons')
      .select(`
        id,
        title,
        description,
        difficulty_level,
        estimated_time_minutes,
        cover_image_url,
        learning_modules(
          id,
          title,
          learning_courses(
            id,
            title
          )
        )
      `)
      .eq('published', true)
      .limit(20); // Limitar para ter uma seleção inicial

    if (lessonsError) {
      console.error('❌ Erro ao buscar aulas:', lessonsError);
      console.log('⚠️ Continuando sem aulas...');
    }

    console.log(`✅ ${lessons?.length || 0} aulas encontradas`);

    // Generate trail based on profile
    const trail = generateTrailForProfile(onboarding_data, solutions || [], lessons || []);
    
    console.log('🎯 Trilha gerada:', trail);

    // Save trail to database
    console.log('💾 Salvando trilha no banco de dados...');
    
    // Check if user already has a trail
    const { data: existingTrail, error: checkError } = await supabase
      .from('implementation_trails')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Erro ao verificar trilha existente:', checkError);
    }

    let saveError;
    if (existingTrail) {
      console.log('🔄 Atualizando trilha existente...');
      const { error } = await supabase
        .from('implementation_trails')
        .update({
          trail_data: trail,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingTrail.id);
      saveError = error;
    } else {
      console.log('➕ Criando nova trilha...');
      const { error } = await supabase
        .from('implementation_trails')
        .insert({
          user_id,
          trail_data: trail,
          status: 'completed'
        });
      saveError = error;
    }

    if (saveError) {
      console.error('❌ Erro ao salvar trilha:', saveError);
      throw new Error('Erro ao salvar trilha no banco de dados');
    }

    console.log('✅ Trilha salva com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        trail_data: trail,
        message: 'Trilha gerada com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na edge function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  } finally {
    cleanupConnections();
  }
});

function generateTrailForProfile(onboardingData: OnboardingData, solutions: any[], lessons: any[]) {
  console.log('🎯 Gerando trilha para perfil:', {
    company_size: onboardingData.professional_info.company_size,
    knowledge_level: onboardingData.ai_experience.knowledge_level,
    main_goal: onboardingData.ai_experience.main_goal
  });

  // Filter solutions by relevance
  const relevantSolutions = solutions.filter(solution => {
    return solution.published === undefined || solution.published === true;
  });

  console.log(`📊 ${relevantSolutions.length} soluções relevantes encontradas`);

  // Sort by relevance (simplified logic)
  const sortedSolutions = relevantSolutions.sort((a, b) => {
    const aScore = calculateRelevanceScore(a, onboardingData);
    const bScore = calculateRelevanceScore(b, onboardingData);
    return bScore - aScore;
  });

  // Filter and select relevant lessons based on user profile
  const relevantLessons = lessons.filter(lesson => {
    // Filtrar baseado no nível de conhecimento
    const knowledgeLevel = onboardingData.ai_experience.knowledge_level;
    if (knowledgeLevel === 'beginner' && lesson.difficulty_level === 'advanced') return false;
    if (knowledgeLevel === 'expert' && lesson.difficulty_level === 'beginner') return false;
    
    return true;
  });

  // Selecionar as primeiras 6-8 aulas mais relevantes
  const selectedLessons = relevantLessons
    .sort((a, b) => calculateLessonRelevanceScore(b, onboardingData) - calculateLessonRelevanceScore(a, onboardingData))
    .slice(0, 8)
    .map((lesson, index) => ({
      lessonId: lesson.id,
      moduleId: lesson.learning_modules?.id,
      courseId: lesson.learning_modules?.learning_courses?.id,
      title: lesson.title,
      justification: generateLessonJustification(lesson, onboardingData),
      priority: Math.floor(index / 3) + 1 // Distribui em prioridades 1, 2, 3
    }));

  console.log(`📚 ${selectedLessons.length} aulas selecionadas para recomendação`);

  // Distribute solutions across priorities
  const trail = {
    priority1: sortedSolutions.slice(0, 3).map(s => ({
      solutionId: s.id,
      justification: `Solução ideal para ${onboardingData.professional_info.company_name} com base no seu perfil`
    })),
    priority2: sortedSolutions.slice(3, 6).map(s => ({
      solutionId: s.id,
      justification: `Recomendada para expansão das capacidades de IA`
    })),
    priority3: sortedSolutions.slice(6, 9).map(s => ({
      solutionId: s.id,
      justification: `Solução complementar para otimização avançada`
    })),
    recommended_lessons: selectedLessons
  };

  console.log('✅ Trilha estruturada:', {
    priority1_count: trail.priority1.length,
    priority2_count: trail.priority2.length,
    priority3_count: trail.priority3.length,
    lessons_count: trail.recommended_lessons.length
  });

  return trail;
}

function calculateRelevanceScore(solution: any, onboardingData: OnboardingData): number {
  let score = 0;

  // Knowledge level matching
  const knowledgeLevel = onboardingData.ai_experience.knowledge_level;
  if (knowledgeLevel === 'iniciante' && solution.difficulty === 'easy') score += 3;
  if (knowledgeLevel === 'intermediario' && solution.difficulty === 'medium') score += 3;
  if (knowledgeLevel === 'especialista' && solution.difficulty === 'advanced') score += 3;

  // Goal matching
  const mainGoal = onboardingData.ai_experience.main_goal;
  if (mainGoal === 'aumentar-receita' && solution.category === 'revenue') score += 2;
  if (mainGoal === 'reduzir-custos' && solution.category === 'operational') score += 2;
  if (mainGoal === 'melhorar-processos' && solution.category === 'operational') score += 2;

  // Company size considerations
  const companySize = onboardingData.professional_info.company_size;
  if (companySize === 'startup' || companySize === '1-5') {
    if (solution.difficulty === 'easy') score += 1;
  }

  return score;
}

function calculateLessonRelevanceScore(lesson: any, onboardingData: OnboardingData): number {
  let score = 0;

  // Knowledge level matching
  const knowledgeLevel = onboardingData.ai_experience.knowledge_level;
  if (knowledgeLevel === 'beginner' && lesson.difficulty_level === 'beginner') score += 3;
  if (knowledgeLevel === 'intermediate' && lesson.difficulty_level === 'intermediate') score += 3;
  if (knowledgeLevel === 'expert' && lesson.difficulty_level === 'advanced') score += 3;

  // Lesson duration preference (shorter for beginners)
  if (lesson.estimated_time_minutes) {
    if (knowledgeLevel === 'beginner' && lesson.estimated_time_minutes <= 15) score += 2;
    if (knowledgeLevel === 'expert' && lesson.estimated_time_minutes >= 20) score += 1;
  }

  // Boost score if lesson has cover image (better visual appeal)
  if (lesson.cover_image_url) score += 1;

  return score;
}

function generateLessonJustification(lesson: any, onboardingData: OnboardingData): string {
  const knowledgeLevel = onboardingData.ai_experience.knowledge_level;
  const mainGoal = onboardingData.ai_experience.main_goal;
  const companyName = onboardingData.professional_info.company_name;

  // Justificativas baseadas no perfil
  if (knowledgeLevel === 'beginner') {
    return `Aula fundamental para iniciantes em IA, ideal para ${companyName} começar sua jornada de implementação`;
  }
  
  if (mainGoal === 'increase-sales') {
    return `Esta aula mostra como usar IA para aumentar vendas, perfeita para o objetivo da ${companyName}`;
  }
  
  if (mainGoal === 'reduce-costs') {
    return `Aprenda a usar IA para reduzir custos operacionais, alinhado com os objetivos da ${companyName}`;
  }

  return `Aula essencial para aprofundar conhecimentos em IA e acelerar a implementação na ${companyName}`;
}
