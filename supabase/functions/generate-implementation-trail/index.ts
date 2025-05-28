
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('🔧 Configurando cliente Supabase...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Generate trail based on profile
    const trail = generateTrailForProfile(onboarding_data, solutions || []);
    
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
        error: error.message || 'Erro interno do servidor'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateTrailForProfile(onboardingData: OnboardingData, solutions: any[]) {
  console.log('🎯 Gerando trilha para perfil:', {
    company_size: onboardingData.professional_info.company_size,
    knowledge_level: onboardingData.ai_experience.knowledge_level,
    main_goal: onboardingData.ai_experience.main_goal
  });

  // Filter solutions by relevance
  const relevantSolutions = solutions.filter(solution => {
    // Basic filtering logic - can be enhanced
    return solution.published === undefined || solution.published === true;
  });

  console.log(`📊 ${relevantSolutions.length} soluções relevantes encontradas`);

  // Sort by relevance (simplified logic)
  const sortedSolutions = relevantSolutions.sort((a, b) => {
    // Prioritize based on knowledge level and company size
    const aScore = calculateRelevanceScore(a, onboardingData);
    const bScore = calculateRelevanceScore(b, onboardingData);
    return bScore - aScore;
  });

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
    recommended_courses: [],
    recommended_lessons: []
  };

  console.log('✅ Trilha estruturada:', {
    priority1_count: trail.priority1.length,
    priority2_count: trail.priority2.length,
    priority3_count: trail.priority3.length
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
    // Prefer easier implementations for smaller companies
    if (solution.difficulty === 'easy') score += 1;
  }

  return score;
}
