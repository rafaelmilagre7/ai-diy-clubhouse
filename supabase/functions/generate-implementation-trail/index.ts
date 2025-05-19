
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0'

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
    
    // Obter dados da requisição
    const { userId, hasOnboardingData, ...onboardingData } = await req.json();
    console.log(`Dados recebidos:`, { userId, hasOnboardingData, ...onboardingData });
    
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID do usuário é obrigatório' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Buscar soluções publicadas
    console.log("Buscando soluções publicadas");
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('*')
      .eq('published', true);
      
    if (solutionsError) throw solutionsError;
    console.log(`Encontradas ${solutions?.length || 0} soluções publicadas`);
    
    // Buscar cursos publicados para recomendação
    const { data: courses, error: coursesError } = await supabase
      .from('learning_courses')
      .select('*')
      .eq('published', true);
      
    if (coursesError) console.error("Erro ao buscar cursos:", coursesError);
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
    
    if (hasOnboarding) {
      // Extrair objetivos de negócio
      const businessGoals = onboarding.business_goals || {};
      if (businessGoals.primary_goal) {
        personalizationData.goals.push(businessGoals.primary_goal);
      }
      
      if (Array.isArray(businessGoals.expected_outcomes)) {
        personalizationData.goals = [
          ...personalizationData.goals,
          ...businessGoals.expected_outcomes.slice(0, 4)
        ];
      }
      
      // Extrair informações profissionais e da empresa
      if (onboarding.professional_info) {
        personalizationData.industry = onboarding.professional_info.company_sector || '';
        personalizationData.companySize = onboarding.professional_info.company_size || '';
      }
      
      // Extrair nível de experiência com IA
      if (onboarding.ai_experience && typeof onboarding.ai_knowledge_level === 'string') {
        const knowledgeLevel = onboarding.ai_knowledge_level.toLowerCase();
        if (knowledgeLevel.includes('iniciante')) {
          personalizationData.aiExperience = 1;
        } else if (knowledgeLevel.includes('intermediário')) {
          personalizationData.aiExperience = 2;
        } else if (knowledgeLevel.includes('avançado')) {
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
        // Simplificação: considerar match com base no título/descrição
        // Em uma versão mais robusta, poderíamos usar tags ou outras metadados
        const courseKeywords = (course.title + ' ' + (course.description || '')).toLowerCase();
        const solutionKeywords = (solution.title + ' ' + solution.description).toLowerCase();
        
        // Verificar palavras-chave em comum
        return solution.tags?.some((tag: string) => courseKeywords.includes(tag)) || 
               courseKeywords.includes(solution.category?.toLowerCase()) ||
               solutionKeywords.includes(course.title.toLowerCase());
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
    
    // Extrair recomendações de cursos
    const courseRecommendations = scoredSolutions
      .filter(item => item.matchedCourses && item.matchedCourses.length > 0)
      .flatMap(item => item.matchedCourses.map(course => ({
        courseId: course.id,
        justification: `Curso recomendado para complementar a solução ${item.solution.title}`,
        priority: item.priority || 1
      })))
      // Remover duplicatas baseadas no courseId
      .filter((course, index, self) => 
        index === self.findIndex((c) => c.courseId === course.courseId)
      );
    
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
      hasMatchedCourses: courseRecommendations.length > 0
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
        
      if (error) throw error;
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
        
      if (error) throw error;
      result = data;
      console.log(`Nova trilha criada com sucesso`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Trilha gerada com sucesso', 
        trail: result 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Erro ao gerar trilha de implementação:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erro ao gerar trilha: ' + (error.message || 'Erro desconhecido'),
        error: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
