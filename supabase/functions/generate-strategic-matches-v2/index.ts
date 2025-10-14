import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Função para determinar o tipo de match baseado em análise semântica
function determineMatchType(reasons: string[], opportunity: string, userGoal?: string): string {
  const text = `${reasons.join(' ')} ${opportunity} ${userGoal || ''}`.toLowerCase();
  
  // Análise de palavras-chave para cada categoria
  const patterns = {
    commercial_opportunity: ['cliente', 'venda', 'comprador', 'comercial', 'revenue', 'sales', 'cliente potencial', 'oportunidade comercial'],
    supplier: ['fornecedor', 'supply', 'produto', 'matéria-prima', 'insumo', 'vendor', 'fornecimento'],
    knowledge_exchange: ['conhecimento', 'mentor', 'aprendizado', 'expertise', 'consultoria', 'learning', 'experiência', 'troca de conhecimento'],
    investor: ['investimento', 'capital', 'funding', 'investor', 'aporte', 'financiamento', 'investidor'],
    strategic_partnership: ['parceria', 'colaboração', 'joint', 'aliança', 'cooperação', 'partnership', 'sinergia', 'complementar']
  };
  
  // Contar matches por categoria
  const scores: Record<string, number> = {};
  for (const [type, keywords] of Object.entries(patterns)) {
    scores[type] = keywords.filter(keyword => text.includes(keyword)).length;
  }
  
  // Retornar tipo com maior score, ou strategic_partnership como fallback
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'strategic_partnership';
  
  return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'strategic_partnership';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    console.log('🎯 [GENERATE MATCHES V2] Iniciando para usuário:', user_id);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Buscar perfil do usuário
    const { data: userProfile, error: profileError } = await supabase
      .from('networking_profiles_v2')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (profileError || !userProfile) {
      throw new Error("Perfil de networking não encontrado");
    }

    // 2. Buscar todos os outros perfis completos
    const { data: allProfiles, error: profilesError } = await supabase
      .from('networking_profiles_v2')
      .select('*')
      .neq('user_id', user_id)
      .not('profile_completed_at', 'is', null);

    if (profilesError) throw profilesError;

    console.log(`📊 Encontrados ${allProfiles?.length || 0} perfis para análise`);

    if (!allProfiles || allProfiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          matches_generated: 0,
          message: "Nenhum perfil disponível para match ainda"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Usar IA para gerar matches estratégicos
    const systemPrompt = `Você é um especialista em networking B2B. Analise o perfil do usuário e os perfis disponíveis para identificar os 10 melhores matches estratégicos.

Para cada match, considere:
- Complementaridade de propostas de valor
- Alinhamento de interesses (looking_for)
- Potencial de sinergia (keywords)
- Relevância dos desafios

Retorne APENAS um JSON válido (sem markdown) neste formato:
{
  "matches": [
    {
      "match_user_id": "uuid",
      "compatibility_score": 0.85,
      "match_reasons": ["Complementaridade de ofertas", "Mesmo segmento-alvo"],
      "connection_opportunity": "Possível parceria estratégica em tecnologia",
      "ice_breaker": "Vocês dois trabalham com inovação digital para PMEs",
      "estimated_value": "R$ 50.000/mês"
    }
  ]
}`;

    const userPrompt = `Perfil do Usuário:
- Proposta de Valor: ${userProfile.value_proposition}
- Busca por: ${userProfile.looking_for.join(', ')}
- Desafio: ${userProfile.main_challenge}
- Keywords: ${userProfile.keywords.join(', ')}

Perfis Disponíveis (${allProfiles.length} perfis):
${allProfiles.map((p: any, i: number) => `
${i+1}. ID: ${p.user_id}
   Proposta: ${p.value_proposition}
   Busca: ${p.looking_for.join(', ')}
   Keywords: ${p.keywords.join(', ')}
`).join('\n')}

Identifique os 10 melhores matches e retorne o JSON.`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ [AI ERROR]', aiResponse.status, errorText);
      throw new Error(`Erro na IA: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Resposta da IA vazia");
    }

    const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiMatches = JSON.parse(cleanContent);

    console.log(`✅ IA gerou ${aiMatches.matches.length} matches`);

    // 4. Limpar matches antigos e inserir novos
    await supabase
      .from('strategic_matches_v2')
      .delete()
      .eq('user_id', user_id);

    const matchesToInsert = aiMatches.matches.map((match: any) => {
      // Determinar tipo baseado em análise semântica
      const matchType = determineMatchType(
        match.match_reasons,
        match.connection_opportunity,
        userProfile?.primary_goal
      );
      
      return {
        user_id: user_id,
        matched_user_id: match.match_user_id,
        compatibility_score: Math.round(parseFloat(match.compatibility_score) * 100),
        match_type: matchType,
        why_connect: match.match_reasons,
        ice_breaker: match.ice_breaker,
        opportunities: [match.connection_opportunity],
        ai_analysis: {
          estimated_value: match.estimated_value,
          generated_at: new Date().toISOString(),
          model: 'gpt-4o-mini',
          detected_type: matchType
        },
        status: 'pending'
      };
    });

    // Log de diagnóstico da distribuição de tipos
    console.log('📊 [MATCH TYPES DISTRIBUTION]', {
      total: matchesToInsert.length,
      distribution: matchesToInsert.reduce((acc, m) => {
        acc[m.match_type] = (acc[m.match_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      sample: matchesToInsert.slice(0, 2).map(m => ({
        type: m.match_type,
        reason: m.why_connect[0]?.substring(0, 50) + '...'
      }))
    });

    const { data: insertedMatches, error: insertError } = await supabase
      .from('strategic_matches_v2')
      .insert(matchesToInsert)
      .select();

    if (insertError) throw insertError;

    console.log(`🎉 ${insertedMatches?.length || 0} matches inseridos com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        matches_generated: insertedMatches?.length || 0,
        message: `${insertedMatches?.length} conexões estratégicas encontradas`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('❌ [GENERATE MATCHES V2 ERROR]', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro ao gerar matches estratégicos"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
