
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

    // Criar um sumário dos dados de onboarding que são relevantes para recomendações
    const userProfile = {
      businessGoals: onboardingProgress.business_goals,
      businessContext: onboardingProgress.business_data,
      aiExperience: onboardingProgress.ai_experience,
      implementationPreferences: onboardingProgress.implementation_preferences,
      professionalInfo: onboardingProgress.professional_info,
    };

    console.log("Gerando recomendações para:", JSON.stringify(userProfile));
    console.log("Soluções disponíveis:", JSON.stringify(availableSolutions));

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
            Para cada solução, inclua uma breve justificativa customizada sobre por que esta solução específica se encaixa no perfil do usuário.`
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
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Resposta inválida da OpenAI API");
    }

    const assistantResponse = data.choices[0].message.content;
    console.log("Resposta da OpenAI:", assistantResponse);
    
    // Extrair o JSON da resposta do assistente
    let recommendations;
    try {
      recommendations = JSON.parse(assistantResponse);
    } catch (error) {
      // Se não for possível extrair JSON diretamente, tentar remover texto ao redor
      const jsonMatch = assistantResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Não foi possível extrair recomendações no formato JSON");
      }
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Erro ao gerar trilha de implementação:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
