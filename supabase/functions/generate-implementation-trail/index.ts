
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0'

// Configuração CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tipos para triagem de soluções e recomendações
interface ScoredSolution {
  solution: any;
  score: number;
  matchReason: string;
  priority?: number;
  matchedCourses?: any[];
}

interface ImplementationRecommendation {
  solutionId: string;
  justification?: string;
  priority?: number;
}

interface ImplementationTrail {
  priority1: ImplementationRecommendation[];
  priority2: ImplementationRecommendation[];
  priority3: ImplementationRecommendation[];
  recommended_courses?: { courseId: string; justification?: string; priority?: number }[];
}

// Manipulador principal para a função de borda
Deno.serve(async (req) => {
  // Tratar preflight CORS OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Edge function invocada: generate-implementation-trail");
    
    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente Supabase não configuradas')
    }
    
    console.log(`Configurando cliente Supabase com URL: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Processar corpo da requisição de forma segura
    let requestData;
    try {
      const bodyText = await req.text();
      console.log("Corpo da requisição recebido:", bodyText.length, "caracteres");
      
      if (!bodyText || bodyText.trim() === '') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Corpo da requisição vazio' 
          }),
          { 
            status: 400, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      requestData = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("Erro ao analisar corpo da requisição:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Erro ao analisar corpo da requisição: ${parseError.message}`,
          error: 'JSON_PARSE_ERROR'
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Obter dados da requisição
    const { userId, hasOnboardingData, ...onboardingData } = requestData;
    console.log(`Dados recebidos:`, { 
      userId, 
      hasOnboardingData,
      hasPersonalInfo: !!onboardingData?.personal_info, 
      hasProfessionalInfo: !!onboardingData?.professional_info,
      hasBusinessGoals: !!onboardingData?.business_goals
    });
    
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID do usuário é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Buscar soluções publicadas
    console.log("Buscando soluções publicadas");
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('*')
      .eq('published', true);
      
    if (solutionsError) {
      console.error("Erro ao buscar soluções:", solutionsError);
      throw solutionsError;
    }
    console.log(`Encontradas ${solutions?.length || 0} soluções publicadas`);
    
    // Buscar cursos publicados para recomendação
    const { data: courses, error: coursesError } = await supabase
      .from('learning_courses')
      .select('*')
      .eq('published', true);
      
    if (coursesError) {
      console.error("Erro ao buscar cursos:", coursesError);
    }
    console.log(`Encontrados ${courses?.length || 0} cursos publicados para integração`);
    
    // Verificar se existe uma trilha para o usuário
    const { data: existingTrail, error: trailError } = await supabase
      .from('implementation_trails')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    const hasExistingTrail = !!existingTrail;
    
    if (hasExistingTrail) {
      console.log(`Trilha existente encontrada para usuário ${userId}. Atualizando registro existente.`);
    }
    
    // Buscar dados de onboarding
    console.log(`Buscando dados de onboarding para usuário ${userId}`);
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (onboardingError && onboardingError.code !== 'PGRST116') {
      console.error("Erro ao buscar dados de onboarding:", onboardingError);
    }
    
    const hasOnboarding = !!onboarding;
    console.log(`Dados de onboarding encontrados: ${hasOnboarding}`);
    
    // Extrair informações para personalização
    const personalizationData = {
      goals: [],
      industry: '',
      companySize: '',
      aiExperience: 0
    };
    
    // Usar dados do onboarding ou dados passados na requisição
    const dataToUse = hasOnboardingData && Object.keys(onboardingData).length > 0 
      ? onboardingData 
      : onboarding || {};
    
    if (dataToUse) {
      // Extrair objetivos de negócio
      const businessGoals = dataToUse.business_goals || {};
      if (typeof businessGoals === 'string') {
        try {
          const parsedGoals = JSON.parse(businessGoals);
          if (parsedGoals.primary_goal) {
            personalizationData.goals.push(parsedGoals.primary_goal);
          }
          if (Array.isArray(parsedGoals.expected_outcomes)) {
            personalizationData.goals = [
              ...personalizationData.goals,
              ...parsedGoals.expected_outcomes.slice(0, 4)
            ];
          }
        } catch (e) {
          console.error("Erro ao parsear business_goals como string:", e);
        }
      } else if (businessGoals.primary_goal) {
        personalizationData.goals.push(businessGoals.primary_goal);
        
        if (Array.isArray(businessGoals.expected_outcomes)) {
          personalizationData.goals = [
            ...personalizationData.goals,
            ...businessGoals.expected_outcomes.slice(0, 4)
          ];
        }
      }
      
      // Extrair informações profissionais e da empresa
      let professionalInfo = dataToUse.professional_info;
      
      // Verificar se professionalInfo é string e tentar parsear
      if (typeof professionalInfo === 'string') {
        try {
          professionalInfo = JSON.parse(professionalInfo);
        } catch (e) {
          console.error("Erro ao parsear professional_info como string:", e);
          professionalInfo = {};
        }
      }
      
      if (professionalInfo && typeof professionalInfo === 'object') {
        personalizationData.industry = professionalInfo.company_sector || '';
        personalizationData.companySize = professionalInfo.company_size || '';
      }
      
      // Extrair nível de experiência com IA
      let aiExperience = dataToUse.ai_experience;
      let aiKnowledgeLevel = dataToUse.ai_knowledge_level;
      
      // Verificar se aiExperience é string e tentar parsear
      if (typeof aiExperience === 'string') {
        try {
          aiExperience = JSON.parse(aiExperience);
          aiKnowledgeLevel = aiExperience.knowledge_level;
        } catch (e) {
          console.error("Erro ao parsear ai_experience como string:", e);
        }
      }
      
      if (aiKnowledgeLevel && typeof aiKnowledgeLevel === 'string') {
        const knowledgeLevel = aiKnowledgeLevel.toLowerCase();
        if (knowledgeLevel.includes('iniciante')) {
          personalizationData.aiExperience = 1;
        } else if (knowledgeLevel.includes('intermediário') || knowledgeLevel.includes('intermediario')) {
          personalizationData.aiExperience = 2;
        } else if (knowledgeLevel.includes('avançado') || knowledgeLevel.includes('avancado')) {
          personalizationData.aiExperience = 3;
        }
      }
    }
    
    console.log(`Dados para personalização:`, personalizationData);
    
    // Pontuação e triagem de soluções
    const scoredSolutions: ScoredSolution[] = solutions?.map(solution => {
      // Lógica básica de pontuação
      let score = 50; // Pontuação base
      let matchReason = '';
      
      // Categorias de negócio
      if (solution.category === 'Receita' && personalizationData.goals.some(g => 
        g.includes('venda') || g.includes('receita') || g.includes('cliente'))) {
        score += 30;
        matchReason = 'Alinhado com seus objetivos de receita e vendas';
      } else if (solution.category === 'Operacional' && personalizationData.goals.some(g => 
        g.includes('eficiência') || g.includes('automação') || g.includes('operação') || g.includes('automacao'))) {
        score += 30;
        matchReason = 'Alinhado com seus objetivos de eficiência operacional';
      } else if (solution.category === 'Estratégia' && personalizationData.goals.some(g => 
        g.includes('estratégia') || g.includes('decisão') || g.includes('planejamento') || g.includes('estrategia') || g.includes('decisoes'))) {
        score += 30;
        matchReason = 'Alinhado com seus objetivos estratégicos';
      }
      
      // Inovação ou personalização como objetivo
      if (personalizationData.goals.some(g => g.includes('inovação') || g.includes('inovacao') || g.includes('personalização') || g.includes('personalizacao'))) {
        score += 15;
        matchReason += matchReason ? ' e inovação' : 'Focado em inovação para seu negócio';
      }
      
      // Ajuste para nível de experiência com IA
      if (solution.difficulty === 'beginner' && personalizationData.aiExperience <= 1) {
        score += 20;
      } else if (solution.difficulty === 'intermediate' && personalizationData.aiExperience === 2) {
        score += 15;
      } else if (solution.difficulty === 'advanced' && personalizationData.aiExperience >= 3) {
        score += 10;
      }
      
      // Encontrar cursos relacionados à solução (baseado em tags, categoria)
      const matchedCourses = courses?.filter(course => {
        // Verificar se os objetos têm as propriedades necessárias
        if (!course || !solution) return false;
        
        // Garantir que temos strings para comparar
        const courseTitle = String(course.title || '');
        const courseDesc = String(course.description || '');
        const solutionTitle = String(solution.title || '');
        const solutionDesc = String(solution.description || '');
        
        // Simplificação: considerar match com base no título/descrição
        const courseKeywords = (courseTitle + ' ' + courseDesc).toLowerCase();
        const solutionKeywords = (solutionTitle + ' ' + solutionDesc).toLowerCase();
        
        // Verificar tags se existirem
        let tagMatch = false;
        if (Array.isArray(solution.tags)) {
          tagMatch = solution.tags.some((tag: string) => 
            tag && courseKeywords.includes(String(tag).toLowerCase())
          );
        }
        
        // Verificar categoria se existir
        let categoryMatch = false;
        if (solution.category) {
          categoryMatch = courseKeywords.includes(String(solution.category).toLowerCase());
        }
        
        // Verificar palavras-chave em comum
        let keywordMatch = false;
        if (courseTitle && solutionTitle) {
          keywordMatch = solutionKeywords.includes(courseTitle.toLowerCase());
        }
        
        return tagMatch || categoryMatch || keywordMatch;
      }) || [];
      
      return {
        solution,
        score,
        matchReason: matchReason || 'Solução recomendada para seu perfil',
        matchedCourses
      };
    }) || [];
    
    // Ordenar soluções por pontuação
    scoredSolutions.sort((a, b) => b.score - a.score);
    
    // Dividir em prioridades
    const highPriority = scoredSolutions.slice(0, 3).map(item => ({
      ...item,
      priority: 1
    }));
    
    const mediumPriority = scoredSolutions.slice(3, 7).map(item => ({
      ...item,
      priority: 2
    }));
    
    const lowPriority = scoredSolutions.slice(7, 10).map(item => ({
      ...item,
      priority: 3
    }));
    
    // Converter para formato final
    const priority1 = highPriority.map(item => ({
      solutionId: item.solution.id,
      justification: item.matchReason,
      priority: 1
    }));
    
    const priority2 = mediumPriority.map(item => ({
      solutionId: item.solution.id,
      justification: item.matchReason,
      priority: 2
    }));
    
    const priority3 = lowPriority.map(item => ({
      solutionId: item.solution.id,
      justification: item.matchReason,
      priority: 3
    }));
    
    // Extrair recomendações de cursos de forma segura
    let courseRecommendations: {courseId: string, justification?: string, priority?: number}[] = [];
    
    try {
      // Lista para rastrear IDs de cursos já processados
      const processedCourseIds = new Set<string>();
      
      // Coletar todos os cursos correspondentes em todas as soluções pontuadas
      courseRecommendations = scoredSolutions
        .filter(item => item.matchedCourses && item.matchedCourses.length > 0)
        .flatMap(item => 
          (item.matchedCourses || [])
            .filter(course => course && course.id && !processedCourseIds.has(course.id))
            .map(course => {
              // Marcar este ID de curso como processado
              if (course.id) processedCourseIds.add(course.id);
              
              return {
                courseId: course.id,
                justification: `Curso recomendado para complementar a solução ${item.solution.title || 'selecionada'}`,
                priority: item.priority || 1
              };
            })
        )
        .filter(rec => rec && rec.courseId); // Filtrar recomendações inválidas
    } catch (courseError) {
      console.error("Erro ao processar recomendações de cursos:", courseError);
      // Em caso de erro, usar array vazio
      courseRecommendations = [];
    }
    
    // Montar objeto final de recomendações
    const recommendations: ImplementationTrail = {
      priority1,
      priority2,
      priority3,
      recommended_courses: courseRecommendations
    };
    
    console.log(`Recomendações geradas com sucesso:`, {
      priority1Count: priority1.length,
      priority2Count: priority2.length,
      priority3Count: priority3.length,
      coursesRecommendedCount: courseRecommendations.length
    });
    
    // Salvar no banco de dados
    let result;
    if (hasExistingTrail) {
      // Atualizar trilha existente
      const { data, error } = await supabase
        .from('implementation_trails')
        .update({
          trail_data: recommendations,
          updated_at: new Date(),
          generation_attempts: existingTrail.generation_attempts + 1,
          status: 'completed',
          error_message: null
        })
        .eq('id', existingTrail.id)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao atualizar trilha existente:", error);
        throw error;
      }
      result = data;
      console.log(`Trilha existente atualizada com sucesso`);
    } else {
      // Criar nova trilha
      const { data, error } = await supabase
        .from('implementation_trails')
        .insert({
          user_id: userId,
          trail_data: recommendations,
          status: 'completed',
          generation_attempts: 1
        })
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao criar nova trilha:", error);
        throw error;
      }
      result = data;
      console.log(`Nova trilha criada com sucesso`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Trilha gerada com sucesso', 
        trail: result 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Erro ao gerar trilha de implementação:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erro ao gerar trilha: ' + (error.message || 'Erro desconhecido'),
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
