
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

interface ImplementationRecommendation {
  solutionId: string;
  justification: string;
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
    // Log para debug
    console.log("Iniciando edge function generate-implementation-trail");
    
    // Obter dados da requisição
    let requestData;
    try {
      requestData = await req.json();
      console.log("Dados recebidos:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("Erro ao parsear dados da requisição:", parseError);
      requestData = { onboardingData: {} }; // Fallback para objeto vazio
    }
    
    const { onboardingData } = requestData;
    
    // Obter o token de autenticação do cabeçalho
    const authHeader = req.headers.get('Authorization');
    console.log("Cabeçalho de autenticação presente:", !!authHeader);
    
    // Verificar se as variáveis de ambiente estão definidas
    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_ANON_KEY')) {
      console.error("Variáveis de ambiente do Supabase não estão configuradas");
      return new Response(
        JSON.stringify({ 
          error: 'Configuração do servidor incompleta - Variáveis de ambiente ausentes',
          details: 'SUPABASE_URL ou SUPABASE_ANON_KEY não estão definidos'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Configurar cliente Supabase com a URL e chave anônima
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { 
            Authorization: authHeader || '',
          },
        },
      }
    );
    
    // Verificar autenticação do usuário
    console.log("Verificando autenticação do usuário");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Usuário não autenticado ou sessão expirada',
          details: authError 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log("Usuário autenticado:", user.id);
    
    // Obter dados das soluções disponíveis
    console.log("Buscando soluções publicadas");
    const { data: solutions, error: solutionsError } = await supabaseClient
      .from('solutions')
      .select('*')
      .eq('published', true);
    
    if (solutionsError) {
      console.error(`Erro ao buscar soluções: ${solutionsError.message}`, solutionsError);
      throw new Error(`Erro ao buscar soluções: ${solutionsError.message}`);
    }
    
    if (!solutions || solutions.length === 0) {
      console.warn('Nenhuma solução disponível para recomendação');
      return new Response(
        JSON.stringify({ 
          error: 'Nenhuma solução disponível para recomendação',
          recommendations: {
            priority1: [],
            priority2: [],
            priority3: []
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Encontradas ${solutions.length} soluções publicadas`);
    
    // Buscar dados de perfil de implementação do usuário
    console.log("Buscando perfil de implementação do usuário:", user.id);
    const { data: profileData, error: profileError } = await supabaseClient
      .from('implementation_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (profileError && !profileError.message.includes('Results contain 0 rows')) {
      console.error('Erro ao buscar perfil de implementação:', profileError);
    }
    
    // Log para verificar se encontrou perfil
    if (profileData) {
      console.log("Perfil de implementação encontrado");
    } else {
      console.warn("Perfil de implementação não encontrado para o usuário:", user.id);
    }
    
    // Definir variáveis que serão usadas para personalização
    let businessGoals = [];
    let industryFocus = '';
    let aiExperience = 0;
    let companySize = '';
    
    // Extrair informações do perfil para melhorar as recomendações
    if (profileData) {
      businessGoals = profileData.business_challenges || [];
      industryFocus = profileData.company_sector || '';
      aiExperience = profileData.ai_knowledge_level || 0;
      companySize = profileData.company_size || '';
    }
    
    console.log("Gerando recomendações com base nos dados:", {
      hasProfileData: !!profileData,
      goals: businessGoals,
      industry: industryFocus,
      aiExperience: aiExperience,
      companySize: companySize,
    });
    
    // Criar algoritmo simples de pontuação para as soluções
    const scoredSolutions = solutions.map(solution => {
      let score = 0;
      
      // Pontuação com base na categoria da solução
      if (businessGoals.includes('Aumentar Receita') && solution.category === 'revenue') {
        score += 3;
      }
      
      if (businessGoals.includes('Reduzir Custos') && solution.category === 'optimization') {
        score += 3;
      }
      
      if (businessGoals.includes('Otimizar Operações') && 
          (solution.category === 'optimization' || solution.category === 'automation')) {
        score += 2;
      }
      
      // Pontuação com base nas tags
      if (solution.tags && Array.isArray(solution.tags)) {
        solution.tags.forEach(tag => {
          if (industryFocus && tag.toLowerCase().includes(industryFocus.toLowerCase())) {
            score += 2;
          }
          
          businessGoals.forEach(goal => {
            if (tag.toLowerCase().includes(goal.toLowerCase())) {
              score += 1;
            }
          });
        });
      }
      
      // Ajustar com base na dificuldade e experiência com IA
      let aiLevel = 'beginner';
      
      if (aiExperience >= 4) {
        aiLevel = 'advanced';
      } else if (aiExperience >= 2) {
        aiLevel = 'intermediate';
      }
      
      if (solution.difficulty === 'beginner' && aiLevel === 'beginner') {
        score += 2;
      } else if (solution.difficulty === 'intermediate' && aiLevel === 'intermediate') {
        score += 2;
      } else if (solution.difficulty === 'advanced' && aiLevel === 'advanced') {
        score += 2;
      } else if (solution.difficulty === 'advanced' && aiLevel === 'beginner') {
        score -= 1;
      }
      
      return {
        solution,
        score
      };
    });
    
    // Ordenar por pontuação e separar em prioridades
    scoredSolutions.sort((a, b) => b.score - a.score);
    
    // Gerar as justificativas com base nas características
    const generateJustification = (solution: any, score: number) => {
      const justifications = [
        `Esta solução é altamente compatível com seus objetivos de negócio.`,
        `Baseado no seu perfil, esta solução pode trazer resultados rápidos.`,
        `Considerando seu setor, esta solução pode gerar diferencial competitivo.`,
        `Com base no seu nível de experiência em IA, esta implementação será adequada.`,
        `Recomendamos esta solução para melhorar seus processos operacionais.`
      ];
      
      // Personalizar com base na categoria
      if (solution.category === 'revenue') {
        justifications.push(`Esta solução pode ajudar a aumentar suas receitas.`);
      } else if (solution.category === 'optimization') {
        justifications.push(`Esta solução pode otimizar seus processos e reduzir custos.`);
      } else if (solution.category === 'automation') {
        justifications.push(`Esta solução pode automatizar tarefas repetitivas.`);
      }
      
      // Escolher uma justificativa com base em um índice derivado do score
      const index = Math.abs(score) % justifications.length;
      return justifications[index];
    };
    
    // Criar as recomendações por prioridade
    const priority1 = scoredSolutions.slice(0, Math.min(3, scoredSolutions.length))
      .map(item => ({
        solutionId: item.solution.id,
        justification: generateJustification(item.solution, item.score)
      }));
    
    const priority2 = scoredSolutions.slice(Math.min(3, scoredSolutions.length), Math.min(6, scoredSolutions.length))
      .map(item => ({
        solutionId: item.solution.id,
        justification: generateJustification(item.solution, item.score)
      }));
    
    const priority3 = scoredSolutions.slice(Math.min(6, scoredSolutions.length), Math.min(9, scoredSolutions.length))
      .map(item => ({
        solutionId: item.solution.id,
        justification: generateJustification(item.solution, item.score)
      }));
    
    // Criar objeto de resposta
    const recommendations: ImplementationTrail = {
      priority1,
      priority2,
      priority3
    };
    
    // Verificar se a trilha tem conteúdo
    if (priority1.length === 0 && priority2.length === 0 && priority3.length === 0) {
      console.warn("Não foi possível gerar recomendações de qualidade. Usando fallback.");
      
      // Criar algumas recomendações mock como fallback
      const fallbackRecommendations: ImplementationTrail = {
        priority1: solutions.slice(0, 3).map(s => ({
          solutionId: s.id,
          justification: "Esta solução foi selecionada como opção padrão com base no seu perfil."
        })),
        priority2: solutions.slice(3, 6).map(s => ({
          solutionId: s.id,
          justification: "Esta solução complementa seu conjunto de ferramentas de IA."
        })),
        priority3: solutions.slice(6, 9).map(s => ({
          solutionId: s.id,
          justification: "Esta solução pode ser explorada para expandir suas capacidades."
        }))
      };
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          recommendations: fallbackRecommendations,
          warning: "Usando recomendações padrão devido à falta de correspondências precisas"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Recomendações geradas com sucesso:", {
      priority1Count: priority1.length,
      priority2Count: priority2.length,
      priority3Count: priority3.length
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Erro na geração da trilha:', error);
    
    // Fornecer informações detalhadas de erro para facilitar o debug
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString(),
        suggestion: "Verifique se o perfil de implementação está completo e tente novamente"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
