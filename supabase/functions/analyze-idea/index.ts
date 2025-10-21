import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  idea: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea }: AnalyzeRequest = await req.json();

    if (!idea || idea.length < 20) {
      return new Response(
        JSON.stringify({ error: "Ideia deve ter pelo menos 20 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[ANALYZE] Analisando ideia: "${idea.substring(0, 100)}..."`);

    const lovableAIUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableAIKey = Deno.env.get("LOVABLE_API_KEY");

    const systemPrompt = `Você é o Rafael Milagre, especialista em implementação de IA para empresas.

Analise a ideia do usuário e gere 3-5 perguntas TÉCNICAS E PRÁTICAS para entender PROFUNDAMENTE o contexto técnico e operacional.

OBJETIVO: Descobrir ferramentas que JÁ USA, infraestrutura existente, volume de dados, orçamento e urgência.

DIRETRIZES CRÍTICAS:
1. Perguntas devem ser ESPECÍFICAS sobre ferramentas e recursos EXISTENTES
2. SEMPRE inclua EXEMPLOS CONCRETOS entre parênteses para guiar a resposta
3. Foque em: CRM atual, APIs, automação, volume, orçamento, time técnico
4. Seja DIRETO e TÉCNICO - zero perguntas genéricas
5. Cada pergunta deve ter "why_important" explicando o valor técnico

EXEMPLOS DE BOAS PERGUNTAS:
✓ "Qual CRM você usa atualmente? (ex: Pipedrive, HubSpot, RD Station, planilha, outro)"
✓ "Você já usa WhatsApp na empresa? Qual ferramenta? (ZAPI, Evolution, API Oficial Meta, outro?)"
✓ "Quantos leads/mês sua empresa recebe? (ex: 50, 200, 1000+)"
✓ "Qual ferramenta de automação você conhece? (Make, Zapier, n8n, nenhuma?)"
✓ "Seu time técnico tem acesso a APIs? Alguém programa? (Sim/Não/Terceirizado)"

EVITE PERGUNTAS GENÉRICAS:
✗ "Como você gerencia seus leads hoje?" (muito vaga)
✗ "Quais são seus principais desafios?" (não direciona)
✗ "O que você espera da solução?" (abstrata demais)

FORMATO JSON:
{
  "questions": [
    {
      "category": "ferramentas|infraestrutura|volume|orçamento|urgência",
      "question": "Pergunta específica com exemplos (entre parênteses)",
      "why_important": "Por que essa informação técnica é crucial para desenhar a solução"
    }
  ]
}

REGRAS:
- Gere 3-5 perguntas técnicas
- SEMPRE inclua exemplos concretos na pergunta
- Tom direto e objetivo
- Explique o valor técnico de cada resposta`;

    const userPrompt = `Ideia: "${idea}"

Gere perguntas inteligentes para eu entender PERFEITAMENTE o que essa pessoa quer.`;

    const response = await fetch(lovableAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableAIKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    const questions = JSON.parse(content);

    console.log(`[ANALYZE] ✅ ${questions.questions?.length || 0} perguntas geradas`);

    return new Response(
      JSON.stringify(questions),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ANALYZE] Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao analisar ideia" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
