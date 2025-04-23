
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
      requestData = { onboardingData: {} }; 
    }
    
    // Obter o token de autenticação do cabeçalho
    const authHeader = req.headers.get('Authorization');
    console.log("Cabeçalho de autenticação presente:", !!authHeader);
    
    // Verificar variáveis de ambiente
    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_ANON_KEY')) {
      console.error("Variáveis de ambiente do Supabase não estão configuradas");
      return new Response(
        JSON.stringify({ 
          error: 'Configuração do servidor incompleta - Variáveis de ambiente ausentes'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Configurar cliente Supabase
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
    
    // Verificar se perfil foi encontrado
    if (!profileData) {
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

    console.log("Perfil de implementação encontrado:", profileData);
    
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
    
    // Usar OpenAI para recomendações personalizadas se disponível
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiApiKey) {
      try {
        console.log("OpenAI API Key encontrada, gerando recomendações com IA");
        
        // Formatar dados do perfil para o prompt
        const profileSummary = {
          nome: profileData.name || "Usuário",
          empresa: profileData.company_name || "Empresa não especificada",
          setor: profileData.company_sector || "Setor não especificado",
          tamanho: profileData.company_size || "Tamanho não especificado", 
          cargo: profileData.current_position || "Cargo não especificado",
          objetivoPrincipal: profileData.primary_goal || "Não especificado",
          nivelConhecimentoIA: typeof profileData.ai_knowledge_level === 'number' ? 
                               profileData.ai_knowledge_level : 1
        };
        
        // Formatar dados das soluções para o prompt
        const solutionsSummary = solutions.map(s => ({
          id: s.id,
          titulo: s.title,
          descricao: s.description,
          categoria: s.category,
          dificuldade: s.difficulty,
          tags: s.tags || []
        }));
        
        // Criar prompt detalhado para a OpenAI com instruções claras
        const prompt = `
        Você é um sistema especializado em matchmaking entre perfis empresariais e soluções de IA.
        
        ## Perfil do usuário:
        ${JSON.stringify(profileSummary, null, 2)}
        
        ## Soluções disponíveis:
        ${JSON.stringify(solutionsSummary, null, 2)}
        
        Sua tarefa é analisar o perfil do usuário e as soluções disponíveis para recomendar as melhores opções organizadas em três níveis de prioridade:
        
        1. Prioridade 1 (Alta): Soluções altamente relevantes com base no setor, cargo, objetivos e nível de conhecimento em IA (max. 3)
        2. Prioridade 2 (Média): Soluções importantes, mas que podem ser implementadas depois (max. 3)
        3. Prioridade 3 (Baixa): Soluções complementares para exploração futura (max. 3)
        
        Para cada solução recomendada, forneça uma justificativa personalizada e específica explicando por que essa solução é relevante para este usuário em particular.
        
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
        
        // Fazer requisição para OpenAI com modelo mais recente e preciso
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
            temperature: 0.5,
            max_tokens: 2000
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
          
          // Tentar extrair JSON da resposta usando regex
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
    
    // Algoritmo de fallback para quando OpenAI falha ou não está disponível
    console.log("Usando algoritmo interno para gerar recomendações");
    
    // Definir variáveis que serão usadas para personalização
    const primaryGoal = profileData.primary_goal || '';
    const businessChallenges = profileData.business_challenges || [];
    const industryFocus = profileData.company_sector || '';
    const aiExperience = profileData.ai_knowledge_level || 1;
    const companySize = profileData.company_size || '';
    
    console.log("Gerando recomendações com algoritmo interno baseado nos dados:", {
      primaryGoal,
      businessChallenges,
      industry: industryFocus,
      aiExperience,
      companySize,
    });
    
    // Criar algoritmo de pontuação para as soluções
    const scoredSolutions = solutions.map(solution => {
      let score = 0;
      
      // Pontuação com base na categoria da solução
      if ((primaryGoal === 'Aumentar Receita' || businessChallenges.includes('Aumentar Receita')) && 
          solution.category === 'revenue') {
        score += 3;
      }
      
      if ((primaryGoal === 'Otimizar Operações' || businessChallenges.includes('Otimizar Operações')) && 
          (solution.category === 'operational' || solution.category === 'optimization')) {
        score += 3;
      }
      
      if ((primaryGoal === 'Gestão Estratégica' || businessChallenges.includes('Melhorar Decisão')) && 
          solution.category === 'strategy') {
        score += 3;
      }
      
      // Pontuação com base nas tags
      if (solution.tags && Array.isArray(solution.tags)) {
        solution.tags.forEach(tag => {
          if (industryFocus && tag.toLowerCase().includes(industryFocus.toLowerCase())) {
            score += 2;
          }
          
          if (primaryGoal && tag.toLowerCase().includes(primaryGoal.toLowerCase())) {
            score += 2;
          }
          
          businessChallenges.forEach(challenge => {
            if (tag.toLowerCase().includes(challenge.toLowerCase())) {
              score += 1;
            }
          });
        });
      }
      
      // Ajustar com base na dificuldade e experiência com IA
      const aiLevel = typeof aiExperience === 'number' ? aiExperience : 1;
      
      if (solution.difficulty === 'beginner' && aiLevel <= 2) {
        score += 2;
      } else if (solution.difficulty === 'intermediate' && aiLevel >= 2 && aiLevel <= 3) {
        score += 2;
      } else if (solution.difficulty === 'advanced' && aiLevel >= 3) {
        score += 2;
      } else if (solution.difficulty === 'advanced' && aiLevel <= 1) {
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
      let justification = "";
      
      // Justificativa baseada na categoria
      if (solution.category === 'revenue') {
        justification = `Esta solução de ${solution.title} foi selecionada porque você indicou interesse em aumentar receita. Ela pode ajudar sua empresa a identificar novas oportunidades de negócio.`;
      } else if (solution.category === 'operational' || solution.category === 'optimization') {
        justification = `Recomendamos ${solution.title} para otimizar seus processos operacionais, reduzir custos e aumentar eficiência.`;
      } else if (solution.category === 'strategy') {
        justification = `Baseado no seu perfil de ${profileData.current_position || 'gestor'} em uma empresa de ${industryFocus}, esta solução estratégica pode ajudar na tomada de decisões.`;
      } else {
        justification = `Considerando seu objetivo de "${primaryGoal}", esta solução pode trazer resultados significativos para sua empresa.`;
      }
      
      // Adicionar personalização baseada em nível de IA
      if (typeof aiExperience === 'number') {
        if (aiExperience <= 1 && solution.difficulty === 'beginner') {
          justification += " É uma solução de fácil implementação, ideal para quem está começando com IA.";
        } else if (aiExperience >= 3 && solution.difficulty === 'advanced') {
          justification += " Como você tem experiência avançada em IA, esta solução aproveitará suas habilidades existentes.";
        }
      }
      
      return justification;
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
      
      // Criar algumas recomendações simples como fallback
      const fallbackRecommendations: ImplementationTrail = {
        priority1: solutions.slice(0, 3).map(s => ({
          solutionId: s.id,
          justification: `Esta solução "${s.title}" foi selecionada como opção padrão para seu perfil de ${profileData.current_position || 'profissional'} em ${profileData.company_name || 'sua empresa'}.`
        })),
        priority2: solutions.slice(3, 6).map(s => ({
          solutionId: s.id,
          justification: `A solução "${s.title}" complementa seu conjunto de ferramentas de IA e pode trazer benefícios adicionais.`
        })),
        priority3: solutions.slice(6, 9).map(s => ({
          solutionId: s.id,
          justification: `Recomendamos explorar "${s.title}" para expandir suas capacidades em ${s.category}.`
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
          message: "Recomendações padrão geradas com sucesso"
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
