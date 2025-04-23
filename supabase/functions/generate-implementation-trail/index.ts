
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    console.log("Iniciando geração de trilha personalizada");
    
    // Configurar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    );
    
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
      console.warn("Perfil incompleto:", user.id);
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

    // Usar OpenAI para recomendações personalizadas
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error("OpenAI API Key não configurada");
      throw new Error("OpenAI API Key não configurada");
    }

    // Formatar dados do perfil para o prompt
    const profileSummary = {
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
    const recommendations = JSON.parse(openaiData.choices[0].message.content);

    // Salvar recomendações
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
