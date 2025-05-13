
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

interface ImplementationRecommendation {
  solutionId: string;
  justification: string;
  priority: number;
}

interface ImplementationTrail {
  priority1: ImplementationRecommendation[];
  priority2: ImplementationRecommendation[];
  priority3: ImplementationRecommendation[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function invocada: generate-implementation-trail");
    
    // Obter dados da requisição
    const requestData = await req.json();
    const { onboardingData, userId } = requestData;
    
    console.log("Dados recebidos:", { 
      hasOnboardingData: !!onboardingData,
      userId: userId || "não fornecido"
    });
    
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'Autorização necessária',
          details: "Header de autorização não fornecido"
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas");
      return new Response(
        JSON.stringify({ 
          error: 'Erro de configuração do servidor',
          details: "Variáveis de ambiente necessárias não estão configuradas"
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Configurando cliente Supabase com URL:", supabaseUrl);
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Obter dados das soluções disponíveis
    console.log("Buscando soluções publicadas");
    
    const { data: solutions, error: solutionsError } = await supabaseClient
      .from('solutions')
      .select('*')
      .eq('published', true);
    
    if (solutionsError) {
      console.error("Erro ao buscar soluções:", solutionsError);
      throw new Error(`Erro ao buscar soluções: ${solutionsError.message}`);
    }
    
    if (!solutions || solutions.length === 0) {
      console.error("Nenhuma solução disponível para recomendação");
      throw new Error('Nenhuma solução disponível para recomendação');
    }
    
    console.log(`Encontradas ${solutions.length} soluções publicadas`);
    
    // Buscar dados dos cursos disponíveis para integração
    const { data: courses, error: coursesError } = await supabaseClient
      .from('learning_courses')
      .select('*, learning_modules(*, learning_lessons(*))')
      .eq('published', true);
      
    if (coursesError) {
      console.error("Erro ao buscar cursos:", coursesError);
      // Não bloquear o fluxo principal, apenas registrar o erro
    }
    
    console.log(`Encontrados ${courses?.length || 0} cursos publicados para integração`);
    
    // Buscar dados de onboarding do usuário usando ID fornecido ou token de autenticação
    let user;
    let userIdToUse = userId;
    
    if (!userIdToUse) {
      // Tentar obter ID do usuário a partir do token de autenticação
      console.log("ID de usuário não fornecido, tentando obter do token");
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !userData?.user) {
          console.error("Erro ao obter usuário do token:", userError);
          throw new Error('Usuário não autenticado ou token inválido');
        }
        
        userIdToUse = userData.user.id;
        user = userData.user;
        console.log("Usuário identificado via token:", userIdToUse);
      } catch (authError) {
        console.error("Erro ao obter usuário do token:", authError);
        throw new Error('Falha ao identificar usuário');
      }
    }
    
    if (!userIdToUse) {
      console.error("Impossível identificar o usuário");
      throw new Error('ID do usuário não fornecido e autenticação falhou');
    }
    
    // Buscar dados do onboarding
    console.log(`Buscando dados de onboarding para usuário ${userIdToUse}`);
    
    const { data: onboardingProgress, error: onboardingError } = await supabaseClient
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userIdToUse)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (onboardingError && !onboardingError.message.includes('Results contain 0 rows')) {
      console.error("Erro ao buscar dados de onboarding:", onboardingError);
      throw new Error(`Erro ao buscar dados de onboarding: ${onboardingError.message}`);
    }
    
    console.log("Dados de onboarding encontrados:", !!onboardingProgress);
    
    // Definir variáveis que serão usadas para personalização
    let businessGoals = [];
    let industryFocus = '';
    let aiExperience: Record<string, any> = {};
    let companySize = '';
    
    // Extrair informações do onboarding para melhorar as recomendações
    if (onboardingProgress) {
      // Processar objetivos de negócio
      if (typeof onboardingProgress.business_goals === 'object') {
        businessGoals = onboardingProgress.business_goals.expected_outcomes || [];
        // Adicionar objetivo primário se disponível
        if (onboardingProgress.business_goals.primary_goal) {
          businessGoals.push(onboardingProgress.business_goals.primary_goal);
        }
      } else if (typeof onboardingProgress.business_goals === 'string') {
        try {
          const parsedGoals = JSON.parse(onboardingProgress.business_goals);
          businessGoals = parsedGoals.expected_outcomes || [];
          // Adicionar objetivo primário se disponível
          if (parsedGoals.primary_goal) {
            businessGoals.push(parsedGoals.primary_goal);
          }
        } catch (e) {
          console.error("Erro ao processar business_goals:", e);
        }
      }
      
      // Extrair setor da empresa
      if (typeof onboardingProgress.professional_info === 'object') {
        industryFocus = onboardingProgress.professional_info.company_sector || '';
        companySize = onboardingProgress.professional_info.company_size || '';
      } else if (typeof onboardingProgress.professional_info === 'string') {
        try {
          const parsedInfo = JSON.parse(onboardingProgress.professional_info);
          industryFocus = parsedInfo.company_sector || '';
          companySize = parsedInfo.company_size || '';
        } catch (e) {
          console.error("Erro ao processar professional_info:", e);
        }
      }
      
      // Extrair experiência com IA
      if (typeof onboardingProgress.ai_experience === 'object') {
        aiExperience = onboardingProgress.ai_experience;
      } else if (typeof onboardingProgress.ai_experience === 'string') {
        try {
          aiExperience = JSON.parse(onboardingProgress.ai_experience);
        } catch (e) {
          console.error("Erro ao processar ai_experience:", e);
        }
      }
      
      // Backup para campos top-level de setor/tamanho
      if (!industryFocus && onboardingProgress.company_sector) {
        industryFocus = onboardingProgress.company_sector;
      }
      
      if (!companySize && onboardingProgress.company_size) {
        companySize = onboardingProgress.company_size;
      }
    } else if (onboardingData) {
      // Usar dados fornecidos na requisição se disponíveis
      // Processar objetivos de negócio
      if (typeof onboardingData.business_goals === 'object') {
        businessGoals = onboardingData.business_goals.expected_outcomes || [];
        // Adicionar objetivo primário se disponível
        if (onboardingData.business_goals.primary_goal) {
          businessGoals.push(onboardingData.business_goals.primary_goal);
        }
      }
      
      industryFocus = onboardingData.company_sector || 
                     (onboardingData.professional_info ? onboardingData.professional_info.company_sector : '') || 
                     '';
      companySize = onboardingData.company_size || 
                   (onboardingData.professional_info ? onboardingData.professional_info.company_size : '') || 
                   '';
      aiExperience = onboardingData.ai_experience || {};
    }
    
    console.log("Dados para personalização:", {
      goals: businessGoals,
      industry: industryFocus,
      companySize: companySize,
      aiExperience: typeof aiExperience === 'object' ? Object.keys(aiExperience).length : 'não disponível'
    });
    
    // Criar algoritmo de pontuação para as soluções
    const scoredSolutions = solutions.map(solution => {
      let score = 0;
      let matchedCourses = [];
      
      // Pontuação com base na categoria da solução
      if (Array.isArray(businessGoals)) {
        if (businessGoals.some(goal => 
            goal.toLowerCase().includes('receita') || 
            goal.toLowerCase().includes('vendas'))) {
          if (solution.category === 'revenue' || solution.category === 'Receita') {
            score += 3;
          }
        }
        
        if (businessGoals.some(goal => 
            goal.toLowerCase().includes('custo') || 
            goal.toLowerCase().includes('economia'))) {
          if (solution.category === 'optimization' || 
             solution.category === 'operational' || 
             solution.category === 'Operacional') {
            score += 3;
          }
        }
        
        if (businessGoals.some(goal => 
            goal.toLowerCase().includes('eficiência') || 
            goal.toLowerCase().includes('produtividade'))) {
          if (solution.category === 'optimization' || 
             solution.category === 'automation' || 
             solution.category === 'operational' || 
             solution.category === 'Operacional') {
            score += 2;
          }
        }
      }
      
      // Pontuação com base nas tags
      if (solution.tags && Array.isArray(solution.tags)) {
        solution.tags.forEach(tag => {
          if (industryFocus && typeof tag === 'string' && 
              tag.toLowerCase().includes(industryFocus.toLowerCase())) {
            score += 2;
          }
          
          if (Array.isArray(businessGoals)) {
            businessGoals.forEach(goal => {
              if (typeof tag === 'string' && typeof goal === 'string' &&
                  tag.toLowerCase().includes(goal.toLowerCase())) {
                score += 1;
              }
            });
          }
        });
      }
      
      // Ajustar com base na dificuldade e experiência com IA
      const aiLevel = typeof aiExperience === 'object' && aiExperience.knowledge_level 
                    ? aiExperience.knowledge_level 
                    : 'beginner';
      
      if (solution.difficulty === 'beginner' && aiLevel === 'beginner') {
        score += 2;
      } else if (solution.difficulty === 'intermediate' && aiLevel === 'intermediate') {
        score += 2;
      } else if (solution.difficulty === 'advanced' && aiLevel === 'advanced') {
        score += 2;
      } else if (solution.difficulty === 'advanced' && aiLevel === 'beginner') {
        score -= 1;
      }
      
      // Relacionar soluções com cursos disponíveis quando possível
      if (courses && courses.length > 0) {
        courses.forEach(course => {
          const modules = course.learning_modules || [];
          
          modules.forEach((module: any) => {
            const lessons = module.learning_lessons || [];
            
            // Verificar se alguma aula menciona a solução pelo título ou categoria
            const relatedLessons = lessons.filter((lesson: any) => {
              const title = lesson.title?.toLowerCase() || '';
              const desc = lesson.description?.toLowerCase() || '';
              const solutionTitle = solution.title?.toLowerCase() || '';
              const solutionCategory = typeof solution.category === 'string' ? 
                                      solution.category.toLowerCase() : '';
              
              return title.includes(solutionTitle) || 
                     desc.includes(solutionTitle) ||
                     title.includes(solutionCategory) ||
                     desc.includes(solutionCategory);
            });
            
            if (relatedLessons.length > 0) {
              matchedCourses.push({
                course_id: course.id,
                course_title: course.title,
                module_id: module.id,
                module_title: module.title,
                lessons: relatedLessons.map((l: any) => ({ 
                  id: l.id, 
                  title: l.title 
                }))
              });
              
              // Aumentar pontuação para soluções que têm conteúdo educacional disponível
              score += 1;
            }
          });
        });
      }
      
      return {
        solution,
        score,
        matchedCourses: matchedCourses.length > 0 ? matchedCourses : undefined
      };
    });
    
    // Ordenar por pontuação e separar em prioridades
    scoredSolutions.sort((a, b) => b.score - a.score);
    
    // Gerar as justificativas com base nas características
    const generateJustification = (solution: any, score: number) => {
      const justifications = [
        `Esta solução é altamente compatível com seus objetivos de negócio e pode trazer resultados significativos.`,
        `Baseado no seu perfil, esta solução pode trazer resultados rápidos e melhorar o desempenho do seu negócio.`,
        `Considerando seu setor ${industryFocus ? `de ${industryFocus}` : ''}, esta solução pode gerar diferencial competitivo.`,
        `Com base no seu nível de experiência em IA, esta implementação será adequada e trará benefícios rápidos.`,
        `Recomendamos esta solução para melhorar seus processos operacionais e otimizar resultados.`
      ];
      
      // Personalizar com base na categoria
      if (solution.category === 'revenue' || solution.category === 'Receita') {
        justifications.push(`Esta solução pode ajudar a aumentar suas receitas e melhorar o desempenho comercial.`);
      } else if (solution.category === 'optimization' || solution.category === 'operational' || solution.category === 'Operacional') {
        justifications.push(`Esta solução pode otimizar seus processos e reduzir custos operacionais.`);
      } else if (solution.category === 'automation' || solution.category === 'Automação') {
        justifications.push(`Esta solução pode automatizar tarefas repetitivas e aumentar a produtividade.`);
      } else if (solution.category === 'strategy' || solution.category === 'Estratégia') {
        justifications.push(`Esta solução estratégica pode transformar a maneira como seu negócio utiliza IA.`);
      }
      
      // Personalizar com base no tamanho da empresa
      if (companySize === 'small' || companySize === 'pequena') {
        justifications.push(`Ideal para pequenas empresas como a sua, com implementação simplificada e baixo custo.`);
      } else if (companySize === 'medium' || companySize === 'média') {
        justifications.push(`Perfeita para empresas de médio porte, equilibrando complexidade e resultados.`);
      } else if (companySize === 'large' || companySize === 'grande') {
        justifications.push(`Desenvolvida para lidar com a escala e complexidade de grandes organizações como a sua.`);
      }
      
      // Se a solução tiver cursos relacionados
      if (solution.matchedCourses && solution.matchedCourses.length > 0) {
        justifications.push(`Temos cursos específicos na plataforma para ajudar você a implementar esta solução.`);
      }
      
      // Escolher uma justificativa com base em uma fórmula derivada do score
      const justificationIndex = Math.abs((score * solution.solution.id.charCodeAt(0)) % justifications.length);
      return justifications[justificationIndex];
    };
    
    // Criar as recomendações por prioridade
    const priority1 = scoredSolutions.slice(0, Math.min(3, scoredSolutions.length))
      .map(item => ({
        solutionId: item.solution.id,
        justification: generateJustification(item, item.score),
        matchedCourses: item.matchedCourses,
        priority: 1
      }));
    
    const priority2 = scoredSolutions.slice(Math.min(3, scoredSolutions.length), Math.min(6, scoredSolutions.length))
      .map(item => ({
        solutionId: item.solution.id,
        justification: generateJustification(item, item.score),
        matchedCourses: item.matchedCourses,
        priority: 2
      }));
    
    const priority3 = scoredSolutions.slice(Math.min(6, scoredSolutions.length), Math.min(9, scoredSolutions.length))
      .map(item => ({
        solutionId: item.solution.id,
        justification: generateJustification(item, item.score),
        matchedCourses: item.matchedCourses,
        priority: 3
      }));
    
    // Criar objeto de resposta
    const recommendations: ImplementationTrail = {
      priority1,
      priority2,
      priority3
    };
    
    console.log("Recomendações geradas com sucesso:", {
      priority1Count: priority1.length,
      priority2Count: priority2.length,
      priority3Count: priority3.length,
      hasMatchedCourses: scoredSolutions.some(s => !!s.matchedCourses)
    });
    
    // Registrar a geração da trilha
    try {
      await supabaseClient
        .from('implementation_trails')
        .insert({
          user_id: userIdToUse,
          status: 'completed',
          trail_data: recommendations,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      console.log("Trilha registrada com sucesso no banco de dados");
    } catch (dbError) {
      console.error("Erro ao salvar trilha no banco de dados:", dbError);
      // Não bloquear a resposta por causa do erro de salvamento
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Erro na geração da trilha:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
