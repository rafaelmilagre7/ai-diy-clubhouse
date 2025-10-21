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

    const systemPrompt = `Você é o Rafael Milagre, especialista em IA e automação. Seu objetivo é fazer perguntas TÉCNICAS, DIRETAS e PRÁTICAS para criar um plano de implementação personalizado.

CONTEXTO: O usuário descreveu uma ideia. Agora você precisa entender 3 coisas:
1. O QUE ele já tem (ferramentas, estrutura, recursos)
2. QUANTO pode investir (tempo, dinheiro, equipe)
3. COMO vai executar (técnico interno, terceirizado, sozinho)

REGRAS PARA AS PERGUNTAS:
✅ Pergunte sobre ferramentas ESPECÍFICAS que ele usa (com exemplos)
✅ Descubra o VOLUME de operação (leads/mês, vendas/dia, mensagens/hora)
✅ Entenda a CAPACIDADE TÉCNICA (tem dev? mexe com API? usa no-code?)
✅ Confirme ORÇAMENTO real (gratuito? até R$500? acima de R$1000?)
✅ Defina URGÊNCIA (precisa pra ontem? tem 3 meses? é teste?)

FORMATO DAS PERGUNTAS:
- Sempre inclua EXEMPLOS entre parênteses
- Seja DIRETO e OBJETIVO (evite "Como você...", prefira "Qual...")
- Force RESPOSTAS ESPECÍFICAS (não deixe aberto demais)

EXEMPLOS PERFEITOS:
✅ "Qual CRM você usa? (Pipedrive, HubSpot, RD Station, planilha, não usa)"
✅ "Você já tem WhatsApp Business API? (ZAPI, Evolution, API Meta, nenhum)"
✅ "Quantos leads novos você recebe por mês? (0-50, 50-200, 200-1000, 1000+)"
✅ "Tem alguém técnico no time? (dev full, dev junior, só eu e mexo um pouco, ninguém)"
✅ "Quanto pode investir em ferramentas? (R$0 só grátis, até R$300/mês, até R$1000/mês, sem limite)"

EVITE:
❌ "Como você gerencia leads?" → muito genérico
❌ "O que espera alcançar?" → filosófico demais
❌ "Qual seu maior desafio?" → não ajuda no plano técnico

IMPORTANTE:
- Gere entre 3-5 perguntas (não mais que isso)
- Cada pergunta deve ter category, question, importance
- Use "critical" para info essencial ao plano
- Use "high" para ajustar detalhes
- Use "medium" para otimizações

JSON FORMAT:
{
  "questions": [
    {
      "category": "Ferramentas Atuais",
      "question": "Qual CRM você usa? (Pipedrive, HubSpot, planilha, não usa)",
      "importance": "critical"
    }
  ]
}`;

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
