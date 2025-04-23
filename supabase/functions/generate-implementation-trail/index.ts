
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Iniciando geração de trilha personalizada", new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extrair e validar o token JWT do cabeçalho Authorization
    const authHeader = req.headers.get('Authorization');
    console.log("Cabeçalho Authorization recebido:", authHeader ? "Presente" : "Ausente");
    
    if (!authHeader) {
      console.error("Erro de autenticação: Cabeçalho Authorization não encontrado");
      return new Response(
        JSON.stringify({ 
          error: 'Não autorizado', 
          message: 'Usuário não autenticado',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Erro de configuração: Variáveis de ambiente do Supabase não definidas");
      throw new Error('Configuração do Supabase incompleta');
    }

    // Extrair o token JWT do cabeçalho (removendo "Bearer " se presente)
    const token = authHeader.replace(/^Bearer\s/, '');
    console.log("Token JWT extraído do cabeçalho", token ? token.substring(0, 15) + "..." : "Vazio");

    // Usar a service_role key para operações administrativas
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    
    // Decodificar o token JWT para obter o user_id
    let userId = null;
    try {
      // Verificar o JWT para obter o usuário
      console.log("Verificando token JWT...");
      const { data: { user }, error: verifyError } = await adminClient.auth.getUser(token);
      
      if (verifyError) {
        console.error("Erro ao verificar token JWT:", verifyError);
        return new Response(
          JSON.stringify({ 
            error: 'Erro de autenticação', 
            message: 'Token inválido ou expirado',
            details: verifyError,
            timestamp: new Date().toISOString()
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (!user) {
        console.error("Usuário não encontrado no token");
        return new Response(
          JSON.stringify({ 
            error: 'Erro de autenticação', 
            message: 'Usuário não encontrado no token',
            timestamp: new Date().toISOString()
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      userId = user.id;
      console.log("Usuário autenticado com ID:", userId);
    } catch (jwtError) {
      console.error("Erro ao decodificar JWT:", jwtError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro de autenticação', 
          message: 'Falha ao processar token de autenticação',
          details: jwtError.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Verificar perfil de implementação usando o ID do usuário extraído do token
    console.log("Verificando perfil de implementação para usuário:", userId);
    const { data: profileData, error: profileError } = await adminClient
      .from('implementation_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      console.error("Erro ao buscar perfil de implementação:", profileError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao buscar perfil', 
          message: 'Não foi possível encontrar seu perfil de implementação',
          details: profileError.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!profileData || !profileData.is_completed) {
      console.warn("Perfil de implementação incompleto para usuário:", userId);
      return new Response(
        JSON.stringify({ 
          error: 'Perfil incompleto', 
          message: 'Complete seu perfil de implementação para gerar recomendações.',
          details: {
            profileFound: !!profileData,
            isCompleted: profileData?.is_completed || false,
            profileId: profileData?.id || null
          },
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Buscar soluções disponíveis
    console.log("Buscando soluções disponíveis...");
    const { data: solutions, error: solutionsError } = await adminClient
      .from('solutions')
      .select('*')
      .eq('published', true);
    
    if (solutionsError) {
      console.error("Erro ao buscar soluções:", solutionsError);
      throw new Error(`Erro ao buscar soluções: ${solutionsError.message}`);
    }
    
    if (!solutions || solutions.length === 0) {
      console.warn("Nenhuma solução disponível encontrada");
      return new Response(
        JSON.stringify({ 
          error: 'Sem soluções disponíveis',
          recommendations: {
            priority1: [],
            priority2: [],
            priority3: []
          },
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Total de soluções encontradas:", solutions.length);

    // Método para criar recomendações quando a OpenAI não estiver disponível ou falhar
    const createFallbackRecommendations = () => {
      console.log("Utilizando método de fallback para recomendações");
      
      // Função para calcular relevância básica de uma solução para o perfil do usuário
      const calculateRelevance = (solution, profile) => {
        let score = 0;
        
        // Priorizar soluções com base no nível de conhecimento em IA
        const aiLevel = profile.ai_knowledge_level || 1;
        if (solution.difficulty === 'beginner' && aiLevel <= 2) score += 3;
        if (solution.difficulty === 'intermediate' && aiLevel >= 2 && aiLevel <= 3) score += 3;
        if (solution.difficulty === 'advanced' && aiLevel >= 3) score += 3;
        
        // Priorizar baseado no setor da empresa se as tags contiverem o setor
        if (profile.company_sector && solution.tags && 
            solution.tags.some(tag => tag.toLowerCase().includes(profile.company_sector.toLowerCase()))) {
          score += 2;
        }
        
        // Priorizar baseado no objetivo principal
        if (profile.primary_goal && solution.description && 
            solution.description.toLowerCase().includes(profile.primary_goal.toLowerCase())) {
          score += 2;
        }
        
        return score;
      };
      
      // Calcular relevância para cada solução
      const scoredSolutions = solutions.map(solution => ({
        solution,
        score: calculateRelevance(solution, profileData)
      }));
      
      // Ordenar por relevância
      scoredSolutions.sort((a, b) => b.score - a.score);
      
      // Dividir em grupos de prioridade
      const highPriority = scoredSolutions.slice(0, 3).map(item => ({
        solutionId: item.solution.id,
        justification: `Altamente recomendado para seu perfil. ${item.solution.title} combina com seu nível de conhecimento em IA e objetivos de negócio.`
      }));
      
      const mediumPriority = scoredSolutions.slice(3, 6).map(item => ({
        solutionId: item.solution.id,
        justification: `Recomendação complementar para seu perfil. ${item.solution.title} pode trazer benefícios adicionais para seu negócio.`
      }));
      
      const lowPriority = scoredSolutions.slice(6, 9).map(item => ({
        solutionId: item.solution.id,
        justification: `Sugestão adicional para exploração futura. ${item.solution.title} pode ser interessante para expandir seus conhecimentos.`
      }));
      
      return {
        priority1: highPriority,
        priority2: mediumPriority,
        priority3: lowPriority
      };
    };

    // Usar OpenAI para recomendações personalizadas
    let recommendations;
    try {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      
      if (!openaiApiKey) {
        console.warn("OpenAI API Key não configurada, usando método de fallback");
        recommendations = createFallbackRecommendations();
      } else {
        // Formatar dados do perfil para o prompt
        const profileSummary = {
          empresa: profileData.company_name || "Empresa não especificada",
          setor: profileData.company_sector || "Setor não especificado",
          tamanho: profileData.company_size || "Tamanho não especificado", 
          cargo: profileData.current_position || "Cargo não especificado",
          objetivoPrincipal: profileData.primary_goal || "Não especificado",
          nivelConhecimentoIA: typeof profileData.ai_knowledge_level === 'number' ? 
                              profileData.ai_knowledge_level : 1,
          desafiosNegocio: profileData.business_challenges || []
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
        
        const prompt = `
          Você é um especialista em matchmaking entre perfis empresariais e soluções de IA.
          
          Analise o perfil do usuário e as soluções disponíveis para recomendar as melhores opções organizadas em três níveis de prioridade.
          
          Perfil do usuário:
          ${JSON.stringify(profileSummary, null, 2)}
          
          Soluções disponíveis:
          ${JSON.stringify(solutionsSummary, null, 2)}
          
          Com base no perfil acima, organize as soluções em:
          
          1. Prioridade 1 (Alta): Soluções altamente relevantes com base no setor, cargo, objetivos e nível de conhecimento em IA (max. 3)
          2. Prioridade 2 (Média): Soluções importantes, mas que podem ser implementadas depois (max. 3)
          3. Prioridade 3 (Baixa): Soluções complementares para exploração futura (max. 3)
          
          Para cada solução recomendada, forneça uma justificativa personalizada explicando por que essa solução é relevante para este usuário em particular.
          
          Retorne APENAS um objeto JSON com o seguinte formato, sem texto adicional:
          
          {
            "priority1": [
              {
                "solutionId": "id-da-solução",
                "justification": "Justificativa personalizada"
              }
            ],
            "priority2": [...],
            "priority3": [...]
          }
        `;

        console.log("Enviando prompt para OpenAI");
        
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
        const openaiContent = openaiData.choices[0].message.content;
        console.log("Resposta da OpenAI recebida");
        
        try {
          recommendations = JSON.parse(openaiContent);
          console.log("Recomendações processadas com sucesso da resposta OpenAI");
        } catch (parseError) {
          console.error("Erro ao parsear resposta da OpenAI:", parseError);
          console.log("Conteúdo recebido:", openaiContent);
          throw new Error("Resposta da OpenAI não é um JSON válido");
        }
      }
    } catch (aiError) {
      console.error("Erro ao gerar recomendações com IA:", aiError);
      console.log("Usando mecanismo de fallback devido a erro na IA");
      recommendations = createFallbackRecommendations();
    }

    // Verificar formato das recomendações
    if (!recommendations || 
        !recommendations.priority1 || 
        !recommendations.priority2 || 
        !recommendations.priority3) {
      console.error("Formato de recomendações inválido:", recommendations);
      recommendations = createFallbackRecommendations();
    }

    // Verificar se as recomendações contêm IDs de solução válidos
    const validateRecommendations = (recs) => {
      const solutionIds = solutions.map(s => s.id);
      
      // Função para filtrar recomendações válidas
      const filterValid = (recsList) => {
        return recsList.filter(rec => {
          if (!rec.solutionId || !solutionIds.includes(rec.solutionId)) {
            console.warn(`Removendo recomendação com ID inválido: ${rec.solutionId}`);
            return false;
          }
          return true;
        });
      };
      
      return {
        priority1: filterValid(recs.priority1),
        priority2: filterValid(recs.priority2),
        priority3: filterValid(recs.priority3)
      };
    };
    
    // Aplicar validação e garantir que há pelo menos uma recomendação
    recommendations = validateRecommendations(recommendations);
    
    // Se não houver recomendações válidas, usar fallback
    if (recommendations.priority1.length === 0 && 
        recommendations.priority2.length === 0 && 
        recommendations.priority3.length === 0) {
      console.warn("Nenhuma recomendação válida, usando fallback");
      recommendations = createFallbackRecommendations();
    }

    // Salvar recomendações
    try {
      console.log("Salvando recomendações na tabela implementation_trails");
      const { error: saveError } = await adminClient
        .from("implementation_trails")
        .upsert({
          user_id: userId,
          trail_data: recommendations,
          status: "completed",
          updated_at: new Date().toISOString()
        });

      if (saveError) {
        console.error("Erro ao salvar trilha:", saveError);
        throw new Error(`Erro ao salvar trilha: ${saveError.message}`);
      }
      
      console.log("Trilha salva com sucesso", new Date().toISOString());
    } catch (dbError) {
      console.error("Erro ao persistir dados no Supabase:", dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na geração da trilha:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        suggestion: "Verifique seu perfil de implementação e tente novamente",
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
