
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    
    if (profileError) {
      console.error('Erro ao buscar perfil de implementação:', profileError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao buscar perfil de implementação',
          details: profileError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Log para verificar se encontrou perfil
    if (profileData) {
      console.log("Perfil de implementação encontrado:", profileData);
    } else {
      console.warn("Perfil de implementação não encontrado para o usuário:", user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Perfil de implementação não encontrado',
          message: 'É necessário preencher o perfil de implementação para gerar recomendações.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar se o perfil está completo
    if (!profileData.is_completed) {
      console.warn("Perfil de implementação incompleto para o usuário:", user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Perfil de implementação incompleto',
          message: 'É necessário completar o perfil de implementação para gerar recomendações.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Se temos uma OpenAI API key, vamos usá-la para gerar recomendações inteligentes
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiApiKey) {
      try {
        console.log("OpenAI API Key encontrada, gerando recomendações com IA");
        
        // Formatar dados do perfil e das soluções para o prompt
        const profileSummary = {
          nome: profileData.name,
          empresa: profileData.company_name,
          setor: profileData.company_sector,
          tamanho: profileData.company_size,
          cargo: profileData.current_position,
          objetivos: profileData.business_challenges || [],
          nivelConhecimentoIA: profileData.ai_knowledge_level || 1
        };
        
        const solutionsSummary = solutions.map(s => ({
          id: s.id,
          titulo: s.title,
          descricao: s.description,
          categoria: s.category,
          dificuldade: s.difficulty,
          tags: s.tags || []
        }));
        
        // Criar prompt para a OpenAI
        const prompt = `
        Você é um sistema de recomendação para soluções de IA.
        
        ## Informações do perfil do usuário:
        ${JSON.stringify(profileSummary, null, 2)}
        
        ## Desafios e objetivos de negócio do usuário:
        ${profileData.business_challenges ? profileData.business_challenges.join(", ") : "Informação não disponível"}
        
        ## Nível de conhecimento em IA (1-4):
        ${profileData.ai_knowledge_level || "Informação não disponível"}
        
        ## Soluções disponíveis:
        ${JSON.stringify(solutionsSummary, null, 2)}
        
        Por favor, analise o perfil do usuário e as soluções disponíveis. Recomende as soluções mais adequadas, organizadas em três níveis de prioridade:
        
        1. Prioridade 1: Soluções altamente relevantes e recomendadas para implementação imediata (máximo de 3)
        2. Prioridade 2: Soluções importantes mas que podem ser implementadas em um segundo momento (máximo de 3)
        3. Prioridade 3: Soluções complementares para exploração futura (máximo de 3)
        
        Para cada solução recomendada, forneça uma breve justificativa de por que essa solução é relevante para o perfil e objetivos do usuário.
        
        Retorne APENAS um objeto JSON com o seguinte formato, sem texto adicional:
        
        {
          "priority1": [
            {
              "solutionId": "id-da-solução",
              "justification": "Justificativa personalizada"
            }
          ],
          "priority2": [
            {
              "solutionId": "id-da-solução",
              "justification": "Justificativa personalizada"
            }
          ],
          "priority3": [
            {
              "solutionId": "id-da-solução",
              "justification": "Justificativa personalizada"
            }
          ]
        }
        `;
        
        console.log("Enviando prompt para OpenAI");
        
        // Fazer requisição para OpenAI
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Você é um assistente especializado em matchmaking entre perfis empresariais e soluções de IA. Responda apenas com JSON válido conforme solicitado.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })
        });
        
        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json();
          console.error("Erro na resposta da OpenAI:", errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const openaiData = await openaiResponse.json();
        console.log("Resposta da OpenAI recebida");
        
        if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
          throw new Error("Formato de resposta da OpenAI inválido");
        }
        
        // Extrair recomendações da resposta
        const aiContent = openaiData.choices[0].message.content;
        console.log("Resposta da OpenAI:", aiContent);
        
        let recommendations;
        try {
          // Tentar parsear a resposta como JSON
          recommendations = JSON.parse(aiContent);
          console.log("Recomendações parseadas com sucesso:", recommendations);
        } catch (jsonError) {
          console.error("Erro ao parsear recomendações da OpenAI:", jsonError);
          
          // Tentar extrair JSON da resposta usando regex se o parsing falhar
          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              recommendations = JSON.parse(jsonMatch[0]);
              console.log("Recomendações extraídas com regex:", recommendations);
            } catch (regexError) {
              console.error("Falha ao extrair JSON com regex:", regexError);
              throw new Error("Não foi possível processar a resposta da IA");
            }
          } else {
            throw new Error("Formato de resposta da IA inválido");
          }
        }
        
        // Validar estrutura das recomendações
        if (!recommendations.priority1 || !recommendations.priority2 || !recommendations.priority3) {
          console.error("Estrutura de recomendações inválida:", recommendations);
          throw new Error("Estrutura de recomendações inválida");
        }
        
        // Salvar as recomendações no banco de dados
        const { error: saveError } = await supabaseClient
          .from("implementation_trails")
          .upsert({
            user_id: user.id,
            trail_data: recommendations,
            status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);
        
        if (saveError) {
          console.error("Erro ao salvar trilha:", saveError);
          throw new Error(`Erro ao salvar trilha: ${saveError.message}`);
        }
        
        console.log("Trilha salva com sucesso usando IA");
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            recommendations,
            source: "openai" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (openaiError) {
        console.error("Erro ao processar com OpenAI:", openaiError);
        // Continuar com algoritmo de fallback se falhar
      }
    }
    
    // Definir variáveis que serão usadas para personalização
    let businessGoals = profileData.business_challenges || [];
    let industryFocus = profileData.company_sector || '';
    let aiExperience = profileData.ai_knowledge_level || 1;
    let companySize = profileData.company_size || '';
    
    console.log("Gerando recomendações com algoritmo interno baseado nos dados:", {
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
        `Considerando seu setor ${industryFocus}, esta solução pode gerar diferencial competitivo.`,
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
      
      // Salvar as recomendações de fallback
      const { error: saveError } = await supabaseClient
        .from("implementation_trails")
        .upsert({
          user_id: user.id,
          trail_data: fallbackRecommendations,
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
      
      if (saveError) {
        console.error("Erro ao salvar trilha fallback:", saveError);
        throw new Error(`Erro ao salvar trilha: ${saveError.message}`);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          recommendations: fallbackRecommendations,
          warning: "Usando recomendações padrão devido à falta de correspondências precisas"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Salvar as recomendações no banco de dados
    const { error: saveError } = await supabaseClient
      .from("implementation_trails")
      .upsert({
        user_id: user.id,
        trail_data: recommendations,
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);
    
    if (saveError) {
      console.error("Erro ao salvar trilha:", saveError);
      throw new Error(`Erro ao salvar trilha: ${saveError.message}`);
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
