import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
  id: string;
  name: string;
  company_name: string;
  industry: string;
  current_position: string;
  onboarding_data?: any;
}

interface MatchAnalysis {
  compatibility_score: number;
  match_reason: string;
  strengths: string[];
  opportunities: string[];
  recommended_approach: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error('user_id é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Gerando matches para usuário: ${user_id}`);

    // Buscar dados do usuário atual
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select(`
        id, name, company_name, industry, current_position,
        onboarding_final (
          business_info, ai_experience, goals_info, 
          company_sector, main_goal, ai_knowledge_level
        )
      `)
      .eq('id', user_id)
      .single();

    if (userError || !currentUser) {
      throw new Error(`Usuário não encontrado: ${userError?.message}`);
    }

    // Buscar outros usuários para matching (excluindo o atual)
    const { data: potentialMatches, error: matchesError } = await supabase
      .from('profiles')
      .select(`
        id, name, company_name, industry, current_position,
        onboarding_final (
          business_info, ai_experience, goals_info,
          company_sector, main_goal, ai_knowledge_level
        )
      `)
      .neq('id', user_id)
      .not('name', 'is', null)
      .limit(20);

    if (matchesError) {
      throw new Error(`Erro ao buscar potenciais matches: ${matchesError.message}`);
    }

    const matches = [];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Limpar matches existentes do mês atual
    await supabase
      .from('network_matches')
      .delete()
      .eq('user_id', user_id)
      .eq('month_year', currentMonth);

    // Analisar cada potencial match com IA
    for (const match of potentialMatches || []) {
      try {
        const analysis = await analyzeMatchWithAI(currentUser, match, openaiKey);
        
        if (analysis.compatibility_score >= 60) {
          // Inserir match na base de dados
          const { error: insertError } = await supabase
            .from('network_matches')
            .insert({
              user_id: user_id,
              matched_user_id: match.id,
              match_type: determineMatchType(analysis),
              compatibility_score: analysis.compatibility_score,
              match_reason: analysis.match_reason,
              ai_analysis: {
                strengths: analysis.strengths,
                opportunities: analysis.opportunities,
                recommended_approach: analysis.recommended_approach
              },
              month_year: currentMonth,
              status: 'pending'
            });

          if (!insertError) {
            matches.push({
              user: match,
              analysis: analysis
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao analisar match com ${match.name}:`, error);
      }
    }

    console.log(`Gerados ${matches.length} matches para ${currentUser.name}`);

    return new Response(JSON.stringify({
      success: true,
      matches_generated: matches.length,
      user_name: currentUser.name,
      matches: matches.slice(0, 5) // Retornar apenas os 5 melhores
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-ai-matches:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeMatchWithAI(currentUser: any, potentialMatch: any, openaiKey: string): Promise<MatchAnalysis> {
  const prompt = `
Você é um especialista em networking empresarial e matching de negócios. Analise a compatibilidade entre estes dois perfis:

USUÁRIO ATUAL:
- Nome: ${currentUser.name}
- Empresa: ${currentUser.company_name || 'Não informado'}
- Setor: ${currentUser.industry || currentUser.onboarding_final?.[0]?.company_sector || 'Não informado'}
- Posição: ${currentUser.current_position || 'Não informado'}
- Objetivo principal: ${currentUser.onboarding_final?.[0]?.main_goal || 'Não informado'}
- Nível de conhecimento em IA: ${currentUser.onboarding_final?.[0]?.ai_knowledge_level || 'Não informado'}

POTENCIAL MATCH:
- Nome: ${potentialMatch.name}
- Empresa: ${potentialMatch.company_name || 'Não informado'}
- Setor: ${potentialMatch.industry || potentialMatch.onboarding_final?.[0]?.company_sector || 'Não informado'}
- Posição: ${potentialMatch.current_position || 'Não informado'}
- Objetivo principal: ${potentialMatch.onboarding_final?.[0]?.main_goal || 'Não informado'}
- Nível de conhecimento em IA: ${potentialMatch.onboarding_final?.[0]?.ai_knowledge_level || 'Não informado'}

Retorne APENAS um JSON válido no seguinte formato:
{
  "compatibility_score": number (0-100),
  "match_reason": "string explicando em 1-2 frases por que são compatíveis",
  "strengths": ["força 1", "força 2", "força 3"],
  "opportunities": ["oportunidade 1", "oportunidade 2"],
  "recommended_approach": "string com sugestão de como iniciar contato"
}

Considere:
- Complementaridade de setores e expertises
- Oportunidades de colaboração e parcerias
- Potencial de troca de conhecimentos
- Sinergia entre objetivos de negócio
- Compatibilidade de níveis profissionais
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em networking empresarial. Responda sempre com JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro na API OpenAI: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const analysis = JSON.parse(content);
    return analysis;
  } catch (parseError) {
    console.error('Erro ao fazer parse da resposta da IA:', content);
    throw new Error('Resposta inválida da IA');
  }
}

function determineMatchType(analysis: MatchAnalysis): string {
  if (analysis.compatibility_score >= 85) return 'strategic_partner';
  if (analysis.compatibility_score >= 75) return 'collaboration';
  if (analysis.compatibility_score >= 65) return 'knowledge_exchange';
  return 'networking';
}