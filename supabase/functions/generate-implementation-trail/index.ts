
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

    if (!onboardingProgress || !availableSolutions) {
      throw new Error("Dados de onboarding ou soluções disponíveis não fornecidos");
    }

    // Validar soluções disponíveis
    if (!Array.isArray(availableSolutions) || availableSolutions.length === 0) {
      throw new Error("Lista de soluções disponíveis vazia ou inválida");
    }

    // Criar um sumário dos dados de onboarding que são relevantes para recomendações
    const userProfile = {
      businessGoals: onboardingProgress.business_goals,
      businessContext: onboardingProgress.business_data,
      aiExperience: onboardingProgress.ai_experience,
      implementationPreferences: onboardingProgress.implementation_preferences,
      professionalInfo: onboardingProgress.professional_info,
    };

    console.log("Gerando recomendações para:", JSON.stringify(userProfile));
    console.log("Soluções disponíveis:", JSON.stringify(availableSolutions.slice(0, 3))); // Log das primeiras 3 soluções

    // Definir um timeout para a chamada da API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 segundos de timeout

    try {
      // Chamar a OpenAI API para gerar recomendações
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em implementação de IA em negócios. Sua tarefa é analisar o perfil do usuário e criar uma trilha personalizada de implementação baseada nas soluções disponíveis. 
              Priorize as soluções com base nas necessidades e objetivos do negócio do usuário, nível de conhecimento em IA, desafios e metas.
              Organize em três níveis de prioridade: 1 (alta prioridade/começar aqui), 2 (prioridade média), 3 (pode ser implementado depois).
              Para cada solução, inclua uma breve justificativa customizada sobre por que esta solução específica se encaixa no perfil do usuário.
              IMPORTANTE: Sua resposta DEVE ser em formato JSON válido sem nenhum texto adicional.`
            },
            {
              role: 'user',
              content: `Perfil do usuário: ${JSON.stringify(userProfile)}
              
              Soluções disponíveis: ${JSON.stringify(availableSolutions.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description, 
                category: s.category,
                difficulty: s.difficulty,
                tags: s.tags || []
              })))}
              
              Crie uma trilha de implementação com estas soluções organizadas por prioridade (1, 2 e 3) com justificativas customizadas.
              Responda APENAS em formato JSON, seguindo esta estrutura:
              {
                "priority1": [
                  { "solutionId": "id-da-solucao", "justification": "Justificativa específica para o perfil" }
                ],
                "priority2": [...],
                "priority3": [...]
              }`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Resposta inválida da OpenAI API:", data);
        throw new Error("Resposta inválida da OpenAI API");
      }

      const assistantResponse = data.choices[0].message.content;
      console.log("Resposta da OpenAI (primeiros 100 caracteres):", assistantResponse.substring(0, 100));
      
      // Extrair o JSON da resposta do assistente
      let recommendations;
      try {
        recommendations = JSON.parse(assistantResponse);
      } catch (error) {
        // Se não for possível extrair JSON diretamente, tentar remover texto ao redor
        console.error("Erro ao parsear resposta:", error);
        const jsonMatch = assistantResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Não foi possível extrair recomendações no formato JSON");
        }
      }

      // Verificar se o JSON tem a estrutura esperada
      if (!recommendations.priority1 || !Array.isArray(recommendations.priority1)) {
        throw new Error("Formato de recomendações inválido: priority1 ausente ou não é um array");
      }

      // Validar que temos pelo menos uma recomendação
      const totalRecommendations = 
        (Array.isArray(recommendations.priority1) ? recommendations.priority1.length : 0) +
        (Array.isArray(recommendations.priority2) ? recommendations.priority2.length : 0) +
        (Array.isArray(recommendations.priority3) ? recommendations.priority3.length : 0);
        
      if (totalRecommendations === 0) {
        throw new Error("Nenhuma recomendação foi gerada");
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
