
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
      .select("id, title, description, category, difficulty, tags")
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

    if (onboardingError) {
      console.log("Erro ao buscar dados de onboarding:", onboardingError);
    }

    const hasOnboardingData = !!onboardingData;
    console.log(`Dados de onboarding encontrados: ${hasOnboardingData}`);

    // Extrair informações relevantes do onboarding para personalização
    const personalizeData = {
      goals: onboardingData?.business_goals?.primary_goal 
        ? [onboardingData.business_goals.primary_goal] 
        : [],
      industry: onboardingData?.professional_info?.company_sector || "",
      companySize: onboardingData?.professional_info?.company_size || "",
      aiExperience: onboardingData?.ai_experience?.knowledge_level === "avançado" ? 3 :
                   onboardingData?.ai_experience?.knowledge_level === "intermediario" ? 2 : 0
    };

    console.log("Dados para personalização:", personalizeData);

    // Gerar recomendações
    // Primeiro para as soluções
    const priority1 = generatePrioritySolutions(solutions, 3, 1);
    const priority2 = generatePrioritySolutions(solutions, 2, 2);  
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
            moduleTitle: module.title,
            courseTitle: course.title
          });
        });
      });
    });
    
    console.log(`Extraídas ${allLessons.length} aulas de todos os cursos`);
    
    // Gerar recomendações baseadas em soluções
    const lessonsBySolutionMatch = generateLessonRecommendations(allLessons, priority1, priority2);
    
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

    // Gerar recomendações de cursos (como backup)
    console.log("Processando recomendações de cursos...");
    let recommendedCourses = [];
    
    // Adicionar recomendações baseadas em perfil
    console.log("Adicionando recomendações baseadas em perfil...");
    const coursesByProfile = courses.slice(0, 2).map((course, index) => ({
      courseId: course.id,
      justification: "Recomendado para seu perfil",
      priority: index + 1
    }));
    
    recommendedCourses = [...coursesByProfile];
    console.log(`Adicionadas ${coursesByProfile.length} recomendações de cursos baseadas em perfil`);
    console.log(`Geradas ${recommendedCourses.length} recomendações de cursos no total`);

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

// Função para gerar recomendações de soluções por prioridade
function generatePrioritySolutions(solutions: any[], count: number, priorityLevel: number) {
  if (!solutions || solutions.length === 0) return [];
  
  // Embaralhar soluções para simular recomendação personalizada
  const shuffled = [...solutions].sort(() => 0.5 - Math.random());
  
  // Selecionar as primeiras "count" soluções
  return shuffled.slice(0, count).map(solution => ({
    solutionId: solution.id,
    justification: getJustificationText(solution, priorityLevel),
    priority: priorityLevel
  }));
}

// Função para gerar texto de justificativa para soluções
function getJustificationText(solution: any, priorityLevel: number): string {
  const priorityTexts = [
    "Esta solução é altamente recomendada para seu perfil e objetivos de negócio.",
    "Com base no seu perfil, esta solução pode trazer resultados significativos.",
    "Uma adição interessante para complementar sua estratégia."
  ];
  
  const categoryTexts = {
    Receita: " Pode ajudar a aumentar sua receita diretamente.",
    Operacional: " Deve melhorar seus processos internos com eficiência.",
    Estratégia: " Fortalecerá sua posição estratégica no mercado."
  };
  
  let text = priorityTexts[priorityLevel - 1] || "Recomendado para seu perfil.";
  
  // Adicionar texto específico da categoria se disponível
  if (solution.category && categoryTexts[solution.category]) {
    text += categoryTexts[solution.category];
  }
  
  return text;
}

// Função para gerar recomendações de aulas baseadas nas soluções recomendadas
function generateLessonRecommendations(allLessons: any[], priority1: any[], priority2: any[]) {
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
      justification: "Esta aula complementa perfeitamente as soluções recomendadas para você",
      priority: score > 2 ? 1 : 2
    };
  });
  
  // Ordenar por pontuação e pegar as 5 melhores
  return scoredLessons
    .filter(lesson => lesson.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
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
  profile: any,
  alreadyRecommendedIds: string[]
): any[] {
  // Filtramos aulas que já foram recomendadas
  const availableLessons = allLessons.filter(lesson => 
    !alreadyRecommendedIds.includes(lesson.lessonId)
  );
  
  if (!availableLessons || availableLessons.length === 0) return [];
  
  // Se não temos dados de perfil suficientes, retornar algumas aleatórias
  if (!profile || (!profile.goals?.length && !profile.industry)) {
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
    if (profile.goals && profile.goals.length > 0) {
      profile.goals.forEach((goal: string) => {
        if (goal && lessonText.includes(goal.toLowerCase())) {
          score += 2;
        }
      });
    }
    
    // Pontuação baseada na indústria/setor
    if (profile.industry && lessonText.includes(profile.industry.toLowerCase())) {
      score += 1.5;
    }
    
    // Ajuste pela experiência com IA - recomendar aulas mais avançadas para usuários experientes
    if (lesson.difficulty_level) {
      if (profile.aiExperience === 0 && lesson.difficulty_level === 'beginner') {
        score += 1;
      } else if (profile.aiExperience === 2 && lesson.difficulty_level === 'intermediate') {
        score += 1;
      } else if (profile.aiExperience === 3 && lesson.difficulty_level === 'advanced') {
        score += 1;
      }
    }
    
    return {
      ...lesson,
      score,
      justification: "Recomendado especificamente para seu perfil e objetivos",
      priority: 1
    };
  });
  
  // Ordenar por pontuação e retornar as melhores
  return scoredLessons
    .filter(lesson => lesson.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
