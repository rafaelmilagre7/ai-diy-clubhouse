import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { value_proposition, looking_for, main_challenge, keywords } = await req.json();

    console.log('📊 [ANALYZE PROFILE] Analisando perfil:', {
      value_proposition_length: value_proposition?.length,
      looking_for_count: looking_for?.length,
      keywords_count: keywords?.length
    });

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Montar prompt para análise da IA
    const systemPrompt = `Você é um especialista em networking B2B e análise de perfis profissionais.
Sua tarefa é analisar o perfil profissional fornecido e gerar insights estratégicos.

Analise com base em:
1. Proposta de valor da empresa
2. Tipos de conexões buscadas
3. Desafio principal atual
4. Palavras-chave profissionais

Retorne APENAS um JSON válido (sem markdown) com esta estrutura:
{
  "business_type": "categoria do negócio",
  "target_audience": "público-alvo identificado",
  "value_keywords": ["palavra1", "palavra2", "palavra3"],
  "networking_style": "estilo de networking (ex: Strategic connector, Relationship builder)",
  "ideal_matches": ["perfil1", "perfil2"],
  "networking_score": número entre 0-100 baseado na completude e clareza do perfil,
  "profile_quality": "low" | "medium" | "high",
  "recommendations": ["dica1", "dica2"]
}`;

    const userPrompt = `Analise este perfil profissional:

Proposta de Valor: "${value_proposition}"
Busca por: ${looking_for.join(', ')}
Desafio Principal: ${main_challenge}
Palavras-chave: ${keywords.join(', ')}

Forneça uma análise estruturada em JSON.`;

    // Chamar Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ [AI ERROR]', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Limite de requisições excedido. Tente novamente em alguns minutos.");
      }
      if (aiResponse.status === 402) {
        throw new Error("Créditos insuficientes. Adicione créditos ao seu workspace.");
      }
      
      throw new Error(`Erro na IA: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Resposta da IA vazia");
    }

    // Parse do JSON retornado pela IA
    let aiPersona;
    try {
      // Limpar markdown se existir
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiPersona = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ [PARSE ERROR]', parseError);
      console.error('AI Content:', aiContent);
      throw new Error("Erro ao processar resposta da IA");
    }

    console.log('✅ [ANALYZE COMPLETE] Score:', aiPersona.networking_score);

    return new Response(
      JSON.stringify({
        success: true,
        ai_persona: aiPersona,
        networking_score: aiPersona.networking_score || 75,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('❌ [ANALYZE PROFILE ERROR]', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erro ao analisar perfil"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
