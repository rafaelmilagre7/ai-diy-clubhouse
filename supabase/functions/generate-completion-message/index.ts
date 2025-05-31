
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OnboardingData {
  personal_info: {
    name?: string;
    company_name?: string;
  };
  business_info: {
    company_sector?: string;
    current_position?: string;
  };
  goals_info: {
    primary_goal?: string;
  };
  ai_experience: {
    ai_knowledge_level?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { onboarding_data } = await req.json();

    console.log('Gerando mensagem personalizada para:', onboarding_data);

    if (!openAIApiKey) {
      console.log('OpenAI API key não configurada, usando mensagem padrão');
      return new Response(JSON.stringify({
        success: true,
        message: 'Parabéns por concluir seu onboarding! Sua jornada de implementação de IA está prestes a começar.',
        personalized: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = onboarding_data as OnboardingData;
    const name = data?.personal_info?.name || 'empreendedor';
    const company = data?.personal_info?.company_name || data?.business_info?.company_name || 'sua empresa';
    const sector = data?.business_info?.company_sector || 'seu setor';
    const goal = data?.goals_info?.primary_goal || 'implementar IA';
    const aiLevel = data?.ai_experience?.ai_knowledge_level || 'iniciante';

    const prompt = `Crie uma mensagem personalizada e motivadora de parabéns para ${name} que acabou de concluir o onboarding do Viver de IA Club. 

Contexto:
- Nome: ${name}
- Empresa: ${company}
- Setor: ${sector}
- Objetivo principal: ${goal}
- Nível de conhecimento em IA: ${aiLevel}

A mensagem deve:
- Ser calorosa e celebratória
- Mencionar o nome da pessoa
- Referenciar seu objetivo ou setor quando relevante
- Ser motivadora para a jornada de implementação de IA
- Ter entre 2-3 frases
- Ser em português brasileiro
- Usar tom profissional mas amigável

Não mencione especificamente "Trilha de Implementação" ou "Networking" pois haverá botões separados para isso.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente especializado em criar mensagens personalizadas e motivadoras para profissionais que estão começando sua jornada com inteligência artificial.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const personalizedMessage = aiResponse.choices[0].message.content;

    console.log('Mensagem personalizada gerada:', personalizedMessage);

    return new Response(JSON.stringify({
      success: true,
      message: personalizedMessage,
      personalized: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao gerar mensagem personalizada:', error);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Parabéns por concluir seu onboarding! Sua jornada de implementação de IA está prestes a começar.',
      personalized: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
