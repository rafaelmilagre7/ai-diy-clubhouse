
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const { onboardingProgress, availableSolutions } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API Key não está configurada");
    }

    if (!onboardingProgress) {
      throw new Error("Dados de onboarding não fornecidos");
    }

    if (!availableSolutions || !Array.isArray(availableSolutions) || availableSolutions.length === 0) {
      throw new Error("Lista de soluções disponíveis vazia ou inválida");
    }

    // Simplificação: usar um modelo mais simples para recomendações
    // e com timeout reduzido para evitar problemas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // reduzido para 15 segundos
    
    try {
      // Chamar a OpenAI API para gerar recomendações com prompt simplificado
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Usando modelo mais rápido
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em implementação de IA em negócios. Crie uma trilha personalizada organizada em três níveis de prioridade (1, 2, 3) com uma breve justificativa para cada solução.`
            },
            {
              role: 'user',
              content: `Perfil do usuário: ${JSON.stringify(onboardingProgress)}
              
              Soluções disponíveis: ${JSON.stringify(availableSolutions.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description, 
                category: s.category,
              })))}
              
              Crie uma trilha de implementação com as soluções organizadas por prioridade (1, 2 e 3).
              Responda APENAS em formato JSON:
              {
                "priority1": [
                  { "solutionId": "id-da-solucao", "justification": "Justificativa específica" }
                ],
                "priority2": [...],
                "priority3": [...]
              }`
            }
          ],
          temperature: 0.5,
          max_tokens: 1500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Resposta inválida da OpenAI API");
      }

      // Extrair e validar as recomendações
      let recommendations;
      try {
        recommendations = JSON.parse(data.choices[0].message.content);
        
        // Validação básica da estrutura
        if (!recommendations.priority1 || !Array.isArray(recommendations.priority1)) {
          throw new Error("Formato de recomendações inválido");
        }
        
        // Garantir que temos pelo menos uma recomendação
        const totalRecommendations = 
          (recommendations.priority1?.length || 0) +
          (recommendations.priority2?.length || 0) +
          (recommendations.priority3?.length || 0);
          
        if (totalRecommendations === 0) {
          throw new Error("Nenhuma recomendação foi gerada");
        }
        
        // Normalizar a estrutura para garantir consistência
        recommendations = {
          priority1: Array.isArray(recommendations.priority1) ? recommendations.priority1 : [],
          priority2: Array.isArray(recommendations.priority2) ? recommendations.priority2 : [],
          priority3: Array.isArray(recommendations.priority3) ? recommendations.priority3 : []
        };
        
      } catch (parseError) {
        console.error("Erro ao analisar resposta:", parseError);
        throw new Error("Não foi possível processar as recomendações");
      }

      return new Response(JSON.stringify({ recommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error("Tempo limite excedido ao chamar a API OpenAI");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Erro ao gerar trilha de implementação:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
