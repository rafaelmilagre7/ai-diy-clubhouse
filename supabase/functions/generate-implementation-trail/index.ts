
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Iniciando geração de trilha personalizada");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extrair token de autorização do header da requisição
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Cabeçalho de autorização ausente');
      return new Response(
        JSON.stringify({ 
          error: 'Usuário não autenticado',
          details: 'Cabeçalho de autorização ausente' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log("Authorization header presente:", authHeader ? "Sim" : "Não");

    // Configurar cliente Supabase com o token de autorização
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Configuração do Supabase ausente:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
      throw new Error('Configuração do Supabase incompleta');
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });
    
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Usuário não autenticado',
          details: authError 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log("Usuário autenticado:", user.id);
    
    // Buscar perfil de implementação
    const { data: profileData, error: profileError } = await supabaseClient
      .from('implementation_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
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
    
    if (!profileData || !profileData.is_completed) {
      console.warn("Perfil incompleto para usuário:", user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Perfil de implementação incompleto',
          message: 'Complete seu perfil de implementação para gerar recomendações.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Buscar soluções disponíveis
    const { data: solutions, error: solutionsError } = await supabaseClient
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
          error: 'Nenhuma solução disponível',
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

    console.log("Soluções encontradas:", solutions.length);

    // Método para criar recomendações quando a OpenAI não estiver disponível
    const createFallbackRecommendations = () => {
      console.log("Utilizando método de fallback para recomendações");
      // Dividir soluções em 3 grupos
      const totalSolutions = solutions.length;
      const solutionsPerGroup = Math.ceil(totalSolutions / 3);
      
      // Criar recomendações simples baseadas nas categorias
      return {
        priority1: solutions.slice(0, solutionsPerGroup).map(s => ({
          solutionId: s.id,
          justification: `Recomendado com base no seu perfil e objetivos de negócio. ${s.description}`
        })),
        priority2: solutions.slice(solutionsPerGroup, solutionsPerGroup * 2).map(s => ({
          solutionId: s.id,
          justification: `Esta solução complementa seu perfil profissional. ${s.description}`
        })),
        priority3: solutions.slice(solutionsPerGroup * 2).map(s => ({
          solutionId: s.id,
          justification: `Solução adicional que pode ser interessante explorar. ${s.description}`
        }))
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
        console.log("Resposta da OpenAI recebida:", openaiContent.substring(0, 100) + "...");
        
        try {
          recommendations = JSON.parse(openaiContent);
        } catch (parseError) {
          console.error("Erro ao parsear resposta da OpenAI:", parseError);
          console.log("Conteúdo recebido:", openaiContent);
          throw new Error("Resposta da OpenAI não é um JSON válido");
        }
      }
    } catch (aiError) {
      console.error("Erro ao gerar recomendações com IA:", aiError);
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

    // Salvar recomendações
    try {
      console.log("Salvando recomendações na tabela implementation_trails");
      const { error: saveError } = await supabaseClient
        .from("implementation_trails")
        .upsert({
          user_id: user.id,
          trail_data: recommendations,
          status: "completed",
          updated_at: new Date().toISOString()
        });

      if (saveError) {
        console.error("Erro ao salvar trilha:", saveError);
        throw new Error(`Erro ao salvar trilha: ${saveError.message}`);
      }
    } catch (dbError) {
      console.error("Erro ao persistir dados no Supabase:", dbError);
      throw dbError;
    }

    console.log("Trilha gerada e salva com sucesso");

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na geração da trilha:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        suggestion: "Verifique seu perfil de implementação e tente novamente"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
