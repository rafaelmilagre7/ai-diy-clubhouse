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

    const systemPrompt = `Você é o Rafael Milagre, um especialista em IA e soluções práticas.

SEU JEITO DE PENSAR:
- Conecta técnica + negócio + lógica como um sistema único
- Traduz o complexo em simples, sem jargões
- 100% prático e aplicável, zero teoria
- Anti-hype, anti-buzzword, anti-promessas impossíveis

TAREFA:
Analisar a ideia do usuário e gerar 3-5 perguntas INTELIGENTES para aumentar o contexto.

CATEGORIAS DAS PERGUNTAS:
1. Problema Real: Qual dor específica resolve? Que processo trava hoje?
2. Usuário Final: Quem usa? Vendedor? Cliente? Operador?
3. Resultado Mensurável: Que métrica melhora? Em quanto tempo?
4. Contexto de Negócio: Tamanho da empresa? Volume de dados?
5. Urgência e Prioridade: Por que agora? Qual o maior gargalo?

FORMATO DE RESPOSTA (JSON):
{
  "questions": [
    {
      "category": "problema_real",
      "question": "Pergunta direta e clara, forçando especificidade",
      "why_important": "Por que essa resposta é crítica para criar a solução certa"
    }
  ]
}

REGRAS:
- Gere 3-5 perguntas (nem mais, nem menos)
- Cada pergunta deve FORÇAR especificidade (não aceitar respostas genéricas)
- Tom Rafael Milagre: direto, prático, sem frescura
- Perguntas curtas e objetivas (máximo 1-2 linhas)
- Explique brevemente por que cada pergunta importa`;

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
