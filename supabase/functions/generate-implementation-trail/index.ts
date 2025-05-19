
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Configurar cliente Supabase 
    console.log(`Configurando cliente Supabase com URL: ${Deno.env.get('SUPABASE_URL')}`);
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: { persistSession: false },
      }
    );

    // Obter dados da requisição - CORREÇÃO: clone o body antes de lê-lo para evitar o erro 
    let requestData;
    try {
      // Clone o corpo da requisição para evitar o erro "Body already consumed"
      const clonedReq = req.clone();
      requestData = await clonedReq.json();
      console.log("Dados recebidos:", requestData);
    } catch (bodyError) {
      console.error("Erro ao processar o corpo da requisição:", bodyError);
      // Se não conseguir ler o body, usar um objeto vazio com userId obtido do JWT
      const authHeader = req.headers.get('authorization');
      let userId = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          // Verificar o JWT para extrair o userId (simplicado, em produção usar verificação adequada)
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          userId = tokenData.sub;
          console.log("UserId extraído do token:", userId);
        } catch (e) {
          console.error("Erro ao extrair userId do token:", e);
        }
      }
      
      requestData = { userId };
      console.log("Usando dados padrão:", requestData);
    }

    const userId = requestData.userId;
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "ID do usuário ausente" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Buscar soluções publicadas
    console.log("Buscando soluções publicadas");
    const { data: solutions, error: solutionsError } = await supabaseClient
      .from("solutions")
      .select("id, title, description, category, difficulty, tags, thumbnail_url")
      .eq("published", true);

    if (solutionsError) {
      console.error("Erro ao buscar soluções:", solutionsError);
      return new Response(
        JSON.stringify({ success: false, message: "Erro ao buscar soluções" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`Encontradas ${solutions.length} soluções publicadas`);

    // Buscar cursos e aulas publicados
    console.log("Buscando cursos publicados para recomendação");
    const { data: courses, error: coursesError } = await supabaseClient
      .from("learning_courses")
      .select(`
        id, 
        title, 
        description,
        cover_image_url,
        learning_modules (
          id,
          title,
          description,
          learning_lessons (
            id,
            title,
            description,
            difficulty_level,
            estimated_time_minutes,
            cover_image_url
          )
        )
      `)
      .eq("published", true);

    if (coursesError) {
      console.error("Erro ao buscar cursos:", coursesError);
      return new Response(
        JSON.stringify({ success: false, message: "Erro ao buscar cursos" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`Encontrados ${courses.length} cursos publicados para integração`);

    // Verificar se já existe uma trilha para este usuário
    const { data: existingTrail, error: trailError } = await supabaseClient
      .from("implementation_trails")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (trailError) {
      console.error("Erro ao buscar trilha existente:", trailError);
      return new Response(
        JSON.stringify({ success: false, message: "Erro ao verificar trilha existente" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Buscar dados de onboarding para personalização
    console.log(`Buscando dados de onboarding para usuário ${userId}`);
    const { data: onboardingData, error: onboardingError } = await supabaseClient
      .from("onboarding_progress")
      .select(`
        personal_info,
        professional_info,
        business_goals,
        ai_experience,
        is_completed
      `)
      .eq("user_id", userId)
      .maybeSingle();

    // Buscar perfil do usuário
    const { data: userProfile, error: profileError } = await supabaseClient
      .from("profiles")
      .select(`
        name,
        email,
        company_name,
        industry
      `)
      .eq("id", userId)
      .maybeSingle();

    if (onboardingError) {
      console.log("Erro ao buscar dados de onboarding:", onboardingError);
    }

    if (profileError) {
      console.log("Erro ao buscar perfil do usuário:", profileError);
    }

    const hasOnboardingData = !!onboardingData;
    console.log(`Dados de onboarding encontrados: ${hasOnboardingData}`);
    
    // Integrar dados do perfil e onboarding
    const userPersonalData = {
      name: userProfile?.name || onboardingData?.personal_info?.name || "",
      email: userProfile?.email || onboardingData?.personal_info?.email || "",
      company: userProfile?.company_name || onboardingData?.professional_info?.company_name || "",
      industry: userProfile?.industry || onboardingData?.professional_info?.company_sector || "",
    };

    // Extrair informações relevantes para personalização
    const personalizeData = {
      name: userPersonalData.name,
      firstName: userPersonalData.name?.split(' ')[0] || "",
      email: userPersonalData.email,
      company: userPersonalData.company,
      industry: userPersonalData.industry,
      goals: onboardingData?.business_goals?.primary_goal 
        ? [onboardingData.business_goals.primary_goal] 
        : [],
      companySize: onboardingData?.professional_info?.company_size || "",
      aiExperience: onboardingData?.ai_experience?.knowledge_level === "avançado" ? 3 :
                   onboardingData?.ai_experience?.knowledge_level === "intermediario" ? 2 : 0,
      role: onboardingData?.professional_info?.current_position || ""
    };

    console.log("Dados para personalização:", personalizeData);

    // Gerar recomendações
    // Primeiro para as soluções
    const priority1 = generatePrioritySolutions(solutions, 3, 1, personalizeData);
    const priority2 = generatePrioritySolutions(solutions, 2, 2, personalizeData);  
    const priority3 = [];  // No priority 3 solutions for now

    // Gerar recomendações de aulas (novo)
    console.log("Processando recomendações de aulas...");
    let recommendedLessons = [];
    
    // Extrair todas as aulas de todos os cursos
    const allLessons = [];
    courses.forEach(course => {
      course.learning_modules?.forEach(module => {
        module.learning_lessons?.forEach(lesson => {
          allLessons.push({
            lessonId: lesson.id,
            moduleId: module.id,
            courseId: course.id,
            title: lesson.title,
            description: lesson.description,
            difficulty_level: lesson.difficulty_level,
            estimated_time_minutes: lesson.estimated_time_minutes,
            cover_image_url: lesson.cover_image_url,
            moduleTitle: module.title,
            courseTitle: course.title
          });
        });
      });
    });
    
    console.log(`Extraídas ${allLessons.length} aulas de todos os cursos`);
    
    // Gerar recomendações baseadas em soluções
    const lessonsBySolutionMatch = generateLessonRecommendations(allLessons, priority1, priority2, personalizeData);
    
    // Adicionar recomendações baseadas em perfil
    console.log("Adicionando recomendações baseadas em perfil...");
    const lessonsByProfile = generateProfileBasedLessonRecommendations(
      allLessons, 
      personalizeData, 
      lessonsBySolutionMatch.map(l => l.lessonId)
    );
    
    // Combinar todas as recomendações de aulas
    recommendedLessons = [...lessonsBySolutionMatch, ...lessonsByProfile];
    console.log(`Geradas ${recommendedLessons.length} recomendações de aulas no total`);
    
    // Limitar a quantidade de aulas recomendadas para não sobrecarregar a UI
    if (recommendedLessons.length > 9) {
      recommendedLessons = recommendedLessons.slice(0, 9);
    }

    // Gerar recomendações de cursos
    console.log("Processando recomendações de cursos...");
    let recommendedCourses = [];
    
    if (courses && courses.length > 0) {
      // Adicionar recomendações baseadas em perfil
      console.log("Adicionando recomendações baseadas em perfil...");
      const coursesByProfile = courses.slice(0, 3).map((course, index) => ({
        courseId: course.id,
        title: course.title,
        description: course.description,
        cover_image_url: course.cover_image_url,
        justification: generatePersonalizedCourseJustification(course, personalizeData),
        priority: index + 1
      }));
      
      recommendedCourses = [...coursesByProfile];
      console.log(`Adicionadas ${coursesByProfile.length} recomendações de cursos baseadas em perfil`);
    }

    // Preparar a estrutura da trilha
    const trailData = {
      priority1,
      priority2,
      priority3,
      recommended_courses: recommendedCourses,
      recommended_lessons: recommendedLessons
    };

    console.log("Recomendações geradas com sucesso:", {
      priority1Count: priority1.length,
      priority2Count: priority2.length,
      priority3Count: priority3.length,
      coursesRecommendedCount: recommendedCourses.length,
      lessonsRecommendedCount: recommendedLessons.length
    });

    // Salvar ou atualizar a trilha no banco de dados
    if (existingTrail) {
      console.log(`Trilha existente encontrada para usuário ${userId}. Atualizando registro existente.`);
      const { error: updateError } = await supabaseClient
        .from("implementation_trails")
        .update({
          trail_data: trailData,
          updated_at: new Date().toISOString(),
          generation_attempts: existingTrail.generation_attempts + 1,
          status: "completed",
          error_message: null
        })
        .eq("id", existingTrail.id);

      if (updateError) {
        console.error("Erro ao atualizar trilha existente:", updateError);
        return new Response(
          JSON.stringify({ success: false, message: "Erro ao atualizar trilha" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      console.log("Trilha existente atualizada com sucesso");
      return new Response(
        JSON.stringify({ success: true, trail: { ...existingTrail, trail_data: trailData } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Criar nova trilha
      console.log(`Criando nova trilha para usuário ${userId}`);
      const { data: newTrail, error: createError } = await supabaseClient
        .from("implementation_trails")
        .insert({
          user_id: userId,
          trail_data: trailData,
          generation_attempts: 1,
          status: "completed"
        })
        .select()
        .single();

      if (createError) {
        console.error("Erro ao criar nova trilha:", createError);
        return new Response(
          JSON.stringify({ success: false, message: "Erro ao criar trilha" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      console.log("Nova trilha criada com sucesso");
      return new Response(
        JSON.stringify({ success: true, trail: newTrail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Erro na função Edge:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Erro interno do servidor", error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Função para gerar recomendações de soluções por prioridade com justificativas personalizadas
function generatePrioritySolutions(solutions: any[], count: number, priorityLevel: number, personalizeData: any) {
  if (!solutions || solutions.length === 0) return [];
  
  // Embaralhar soluções para simular recomendação personalizada
  const shuffled = [...solutions].sort(() => 0.5 - Math.random());
  
  // Selecionar as primeiras "count" soluções
  return shuffled.slice(0, count).map(solution => ({
    solutionId: solution.id,
    justification: generatePersonalizedJustification(solution, priorityLevel, personalizeData),
    priority: priorityLevel,
    thumbnail_url: solution.thumbnail_url
  }));
}

// Função para gerar texto de justificativa personalizada para soluções
function generatePersonalizedJustification(solution: any, priorityLevel: number, personalizeData: any): string {
  // Extrair dados do usuário para personalização
  const { firstName, company, industry, companySize, aiExperience, role } = personalizeData;
  
  // Templates de justificativa por categoria
  const categoryTemplates = {
    "Receita": [
      `${firstName ? firstName + ', esta' : 'Esta'} solução pode aumentar diretamente a receita ${company ? 'da ' + company : 'do seu negócio'}${industry ? ' no setor de ' + industry : ''}.`,
      `${firstName ? firstName + ', ' : ''}vamos impulsionar suas vendas${companySize ? ' em sua empresa de porte ' + companySize : ''} com esta implementação de retorno rápido.`,
      `${firstName ? firstName + ', identificamos' : 'Identificamos'} que aumentar receita é prioridade${role ? ' para sua função de ' + role : ''}, e esta solução entrega resultados tangíveis.`
    ],
    "Operacional": [
      `${firstName ? firstName + ', esta' : 'Esta'} solução vai otimizar processos${company ? ' na ' + company : ''}${industry ? ' do setor de ' + industry : ''}.`,
      `${firstName ? firstName + ', ' : ''}baseado no seu perfil, esta solução reduzirá custos operacionais${companySize ? ' em negócios de porte ' + companySize : ''} significativamente.`, 
      `${firstName ? firstName + ', automatize' : 'Automatize'} tarefas repetitivas${role ? ' que consomem seu tempo como ' + role : ''} com esta implementação prática.`
    ],
    "Estratégia": [
      `${firstName ? firstName + ', selecionamos' : 'Selecionamos'} esta solução estratégica considerando${industry ? ' os desafios específicos do setor de ' + industry : ' seus objetivos empresariais'}.`,
      `${firstName ? firstName + ', esta solução' : 'Esta solução'} fortalecerá a posição ${company ? 'da ' + company : 'do seu negócio'} no mercado de forma sustentável.`,
      `${firstName ? firstName + ', ' : ''}esta implementação estratégica foi escolhida${aiExperience > 1 ? ' para seu nível avançado em IA' : ' considerando seu conhecimento em IA'}.`
    ]
  };
  
  // Templates gerais por nível de prioridade
  const priorityTemplates = [
    `${firstName ? firstName + ', esta' : 'Esta'} é uma escolha de alta prioridade para você, considerando${industry ? ' sua atuação em ' + industry : ' seus objetivos'}. Recomendamos implementar primeiro.`,
    `${firstName ? firstName + ', ' : ''}baseado no seu perfil, esta solução tem potencial para trazer${companySize ? ' para uma empresa de porte ' + companySize : ''} resultados expressivos.`,
    `${firstName ? firstName + ', esta solução é' : 'Esta solução é'} complementar à sua estratégia principal, mas ainda assim valiosa${role ? ' para sua atuação como ' + role : ''}.`
  ];
  
  // Selecionar template por categoria ou prioridade
  let templates = [];
  if (solution.category && categoryTemplates[solution.category]) {
    templates = categoryTemplates[solution.category];
  } else {
    templates = priorityTemplates;
  }
  
  // Selecionar uma justificativa aleatoriamente
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

// Função para gerar justificativas personalizadas para cursos
function generatePersonalizedCourseJustification(course: any, personalizeData: any): string {
  const { firstName, industry, role, aiExperience } = personalizeData;
  
  const courseTemplates = [
    `${firstName ? firstName + ', este' : 'Este'} curso foi selecionado especificamente para complementar sua jornada de implementação.`,
    `${firstName ? firstName + ', ' : ''}com base no seu interesse${industry ? ' no setor de ' + industry : ''}, este conteúdo vai expandir seus conhecimentos.`,
    `${firstName ? firstName + ', ' : ''}recomendamos esta aula${role ? ' para apoiar seu trabalho como ' + role : ''} com conhecimentos práticos.`,
    `${firstName ? firstName + ', ' : ''}selecionamos este conteúdo${aiExperience > 1 ? ' para aprofundar seus conhecimentos avançados' : ' para fortalecer sua base de conhecimento'} em IA.`
  ];
  
  const randomIndex = Math.floor(Math.random() * courseTemplates.length);
  return courseTemplates[randomIndex];
}

// Função para gerar recomendações de aulas baseadas nas soluções recomendadas
function generateLessonRecommendations(allLessons: any[], priority1: any[], priority2: any[], personalizeData: any) {
  if (!allLessons || allLessons.length === 0) return [];
  
  // Extrair palavras-chave das soluções recomendadas
  const keywords = [];
  
  // Prioridade 1 - maior peso
  priority1.forEach(solution => {
    // Buscar a solução completa
    const solutionObj = { 
      title: solution.title || "", 
      description: solution.description || "", 
      priority: 1 
    };
    
    // Extrair palavras-chave do título e descrição
    extractKeywords(solutionObj).forEach(kw => {
      if (!keywords.includes(kw)) {
        keywords.push(kw);
      }
    });
  });
  
  // Prioridade 2 - menor peso
  priority2.forEach(solution => {
    const solutionObj = { 
      title: solution.title || "", 
      description: solution.description || "", 
      priority: 2 
    };
    
    extractKeywords(solutionObj).forEach(kw => {
      if (!keywords.includes(kw)) {
        keywords.push(kw);
      }
    });
  });
  
  console.log("Palavras-chave extraídas das soluções:", keywords);
  
  // Pontuar as aulas com base na relevância para as palavras-chave
  const scoredLessons = allLessons.map((lesson: any) => {
    let score = 0;
    
    // Texto para análise
    const lessonText = `${lesson.title || ""} ${lesson.description || ""} ${lesson.moduleTitle || ""} ${lesson.courseTitle || ""}`.toLowerCase();
    
    // Pontuar baseado na ocorrência de palavras-chave
    keywords.forEach(keyword => {
      if (lessonText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    return {
      ...lesson,
      score,
      justification: generatePersonalizedLessonJustification(lesson, personalizeData),
      priority: score > 2 ? 1 : 2
    };
  });
  
  // Ordenar por pontuação e pegar as 5 melhores
  return scoredLessons
    .filter(lesson => lesson.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// Função para gerar justificativas personalizadas para aulas
function generatePersonalizedLessonJustification(lesson: any, personalizeData: any): string {
  const { firstName, industry, role, aiExperience } = personalizeData;
  
  const lessonTemplates = [
    `${firstName ? firstName + ', esta' : 'Esta'} aula foi selecionada para complementar perfeitamente as soluções que recomendamos para você.`,
    `${firstName ? firstName + ', ' : ''}com base no seu perfil${industry ? ' no setor de ' + industry : ''}, este conteúdo vai ajudar na implementação das soluções.`,
    `${firstName ? firstName + ', ' : ''}recomendamos esta aula${role ? ' para apoiar seu trabalho como ' + role : ''} com conhecimentos práticos e aplicáveis.`,
    `${firstName ? firstName + ', ' : ''}selecionamos este conteúdo${aiExperience > 1 ? ' para aprofundar seus conhecimentos avançados' : ' para fortalecer sua base de conhecimento'} em IA.`
  ];
  
  const randomIndex = Math.floor(Math.random() * lessonTemplates.length);
  return lessonTemplates[randomIndex];
}

// Função para extrair palavras-chave de um objeto
function extractKeywords(obj: any): string[] {
  if (!obj) return [];
  
  const text = `${obj.title || ""} ${obj.description || ""}`.toLowerCase();
  
  // Lista de palavras-chave relacionadas a IA e negócios
  const keywordList = [
    "ia", "ai", "inteligência artificial", "intelligence",
    "automatização", "automation",
    "chatbot", "chat", "gpt", 
    "prompt", "prompts",
    "productividade", "productivity",
    "marketing", "vendas", "sales", 
    "atendimento", "customer", "cliente", 
    "receita", "revenue", "renda", 
    "operacional", "operational", 
    "estratégia", "strategy",
    "negócio", "business", "empresa",
    "dados", "data", "análise", "analysis",
    "processo", "process", "workflow",
    "implementação", "implementation"
  ];
  
  // Verificar quais palavras-chave estão presentes
  return keywordList.filter(keyword => text.includes(keyword));
}

// Função para gerar recomendações de aulas baseadas no perfil do usuário
function generateProfileBasedLessonRecommendations(
  allLessons: any[], 
  personalizeData: any,
  alreadyRecommendedIds: string[]
): any[] {
  // Filtrar aulas que já foram recomendadas
  const availableLessons = allLessons.filter(lesson => 
    !alreadyRecommendedIds.includes(lesson.lessonId)
  );
  
  if (!availableLessons || availableLessons.length === 0) return [];
  
  // Se não temos dados de perfil suficientes, retornar algumas aleatórias
  if (!personalizeData || (!personalizeData.goals?.length && !personalizeData.industry)) {
    return availableLessons
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(lesson => ({
        ...lesson,
        justification: "Recomendado para expandir seu conhecimento",
        priority: 2
      }));
  }
  
  // Pontuar aulas com base no perfil
  const scoredLessons = availableLessons.map(lesson => {
    let score = 0;
    const lessonText = `${lesson.title || ""} ${lesson.description || ""} ${lesson.moduleTitle || ""} ${lesson.courseTitle || ""}`.toLowerCase();
    
    // Pontuação baseada nos objetivos do usuário
    if (personalizeData.goals && personalizeData.goals.length > 0) {
      personalizeData.goals.forEach((goal: string) => {
        if (goal && lessonText.includes(goal.toLowerCase())) {
          score += 2;
        }
      });
    }
    
    // Pontuação baseada na indústria/setor
    if (personalizeData.industry && lessonText.includes(personalizeData.industry.toLowerCase())) {
      score += 1.5;
    }
    
    // Ajuste pela experiência com IA - recomendar aulas mais avançadas para usuários experientes
    if (lesson.difficulty_level) {
      if (personalizeData.aiExperience === 0 && lesson.difficulty_level === 'beginner') {
        score += 1;
      } else if (personalizeData.aiExperience === 2 && lesson.difficulty_level === 'intermediate') {
        score += 1;
      } else if (personalizeData.aiExperience === 3 && lesson.difficulty_level === 'advanced') {
        score += 1;
      }
    }
    
    return {
      ...lesson,
      score,
      justification: generatePersonalizedLessonJustification(lesson, personalizeData),
      priority: 2
    };
  });
  
  // Ordenar por pontuação e retornar as melhores
  return scoredLessons
    .filter(lesson => lesson.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
