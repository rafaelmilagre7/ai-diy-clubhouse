import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    console.log('🎯 [GENERATE MATCHES V2] Iniciando para usuário:', user_id);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar perfil enriquecido do usuário
    const { data: userProfile, error: userError } = await supabase
      .from('networking_profiles_v2')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError || !userProfile) {
      throw new Error('Perfil de networking não encontrado. Complete o onboarding primeiro.');
    }

    // Buscar dados básicos do usuário
    const { data: userBasicData } = await supabase
      .from('profiles')
      .select('name, company_name, industry, current_position')
      .eq('id', user_id)
      .single();

    // Buscar candidatos potenciais (excluindo próprio usuário)
    const { data: candidates, error: candidatesError } = await supabase
      .from('networking_profiles_v2')
      .select(`
        *,
        profiles!inner(
          id,
          name,
          company_name,
          industry,
          current_position,
          avatar_url
        )
      `)
      .neq('user_id', user_id)
      .limit(50);

    if (candidatesError) throw candidatesError;

    console.log(`🔍 [CANDIDATES] Encontrados ${candidates?.length || 0} candidatos`);

    if (!candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          matches_generated: 0,
          message: 'Nenhum candidato disponível no momento'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calcular scores e gerar insights com IA
    const matchesWithScores = await Promise.all(
      candidates.slice(0, 20).map(async (candidate) => {
        // Calcular score básico (algoritmo multi-dimensional)
        let score = 50;

        // 1. Objetivos Complementares (35 pontos)
        const lookingForMatch = userProfile.looking_for.some((type: string) => 
          candidate.looking_for.includes(type)
        );
        if (lookingForMatch) score += 35;

        // 2. Sinergia de Indústria (25 pontos)
        const candidateProfile = candidate.profiles;
        if (candidateProfile.industry === userBasicData?.industry) {
          score += 15;
        }

        // 3. Keywords Match (20 pontos)
        const keywordMatches = userProfile.keywords.filter((k: string) => 
          candidate.keywords.includes(k)
        ).length;
        score += Math.min(keywordMatches * 7, 20);

        // 4. Desafios Alinhados (20 pontos)
        if (userProfile.main_challenge === candidate.main_challenge) {
          score += 20;
        }

        // Limitar score a 100
        score = Math.min(score, 100);

        // Gerar insights com IA apenas para matches com score > 75
        if (score > 75 && LOVABLE_API_KEY) {
          try {
            const aiPrompt = `Analise esta oportunidade de networking B2B:

USUÁRIO 1:
- Nome: ${userBasicData?.name}
- Empresa: ${userBasicData?.company_name}
- Proposta: ${userProfile.value_proposition}
- Busca: ${userProfile.looking_for.join(', ')}
- Desafio: ${userProfile.main_challenge}

USUÁRIO 2:
- Nome: ${candidateProfile.name}
- Empresa: ${candidateProfile.company_name}
- Proposta: ${candidate.value_proposition}
- Busca: ${candidate.looking_for.join(', ')}
- Desafio: ${candidate.main_challenge}

Gere insights em JSON (sem markdown):
{
  "match_type": "commercial_opportunity" | "strategic_partnership" | "knowledge_exchange" | "supplier" | "investor",
  "why_connect": "razão estratégica em 1 frase",
  "ice_breaker": "mensagem inicial personalizada (máx 150 chars)",
  "opportunities": ["oportunidade1", "oportunidade2"],
  "estimated_value": "R$50k-200k/ano" ou null
}`;

            const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [{ role: "user", content: aiPrompt }],
                temperature: 0.8,
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const aiContent = aiData.choices?.[0]?.message?.content;
              const cleanContent = aiContent?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              const aiInsights = JSON.parse(cleanContent);

              return {
                user_id,
                matched_user_id: candidate.user_id,
                compatibility_score: score,
                ...aiInsights,
                ai_analysis: aiInsights,
                status: 'pending',
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              };
            }
          } catch (aiError) {
            console.error('⚠️ [AI INSIGHT ERROR]', aiError);
          }
        }

        // Fallback sem IA
        return {
          user_id,
          matched_user_id: candidate.user_id,
          compatibility_score: score,
          match_type: 'strategic_partnership',
          why_connect: `Potencial sinergia entre ${userBasicData?.company_name} e ${candidateProfile.company_name}`,
          ice_breaker: `Olá ${candidateProfile.name}, vi que você trabalha com ${candidateProfile.industry}. Podemos conversar sobre oportunidades?`,
          opportunities: ['Troca de experiências', 'Potencial parceria'],
          ai_analysis: {},
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
      })
    );

    // Filtrar apenas matches com score > 75 e ordenar
    const qualityMatches = matchesWithScores
      .filter(m => m.compatibility_score > 75)
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, 15); // Top 15 matches

    console.log(`✅ [QUALITY MATCHES] ${qualityMatches.length} matches com score > 75`);

    // Salvar matches no banco
    if (qualityMatches.length > 0) {
      const { error: insertError } = await supabase
        .from('strategic_matches_v2')
        .upsert(qualityMatches, { 
          onConflict: 'user_id,matched_user_id',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error('❌ [INSERT ERROR]', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches_count: qualityMatches.length,
        message: `${qualityMatches.length} conexões estratégicas encontradas!`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('❌ [GENERATE MATCHES V2 ERROR]', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erro ao gerar matches"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
