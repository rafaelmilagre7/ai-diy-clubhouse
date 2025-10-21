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

    const systemPrompt = `
Você é um consultor técnico experiente que ajuda empreendedores a refinar suas ideias.

Sua tarefa: Gerar exatamente 5 perguntas TÉCNICAS para entender melhor a ideia do usuário.

REGRAS CRÍTICAS:
1. Perguntas OBJETIVAS e ESPECÍFICAS sobre a implementação técnica
2. Foque em: infraestrutura atual, orçamento, prazo, equipe técnica, integrações necessárias
3. NÃO pergunte sobre conceitos vagos ou ideias abstratas
4. Cada pergunta DEVE ter um campo "why_important" com NO MÍNIMO 25 PALAVRAS explicando o impacto técnico e estratégico da resposta

CATEGORIAS OBRIGATÓRIAS (escolher 5 das opções):
- Recursos Existentes: O que o cliente JÁ TEM (sistemas, sites, ferramentas)
- Investimento: Quanto está disposto a investir (setup inicial + mensal)
- Prazo: Quando precisa estar funcionando
- Equipe: Quem vai operar/manter a solução
- Integrações: Quais sistemas precisam se conectar
- Volume: Quantos usuários/transações/dados por mês

FORMATO DE RESPOSTA (JSON):
{
  "questions": [
    {
      "category": "Categoria da pergunta",
      "question": "Pergunta objetiva e técnica?",
      "why_important": "Explicação detalhada de no mínimo 25 palavras sobre por que essa resposta é crucial para definir arquitetura, custos, ferramentas ou viabilidade da solução."
    }
  ]
}

EXEMPLO COMPLETO:
{
  "questions": [
    {
      "category": "Recursos Existentes",
      "question": "Você já tem um site ou sistema de gestão? Se sim, qual a plataforma (WordPress, sistema proprietário, etc.)?",
      "why_important": "Saber a infraestrutura atual determina se precisamos criar APIs de integração, migrar dados existentes ou construir do zero. Isso impacta diretamente no custo de desenvolvimento e no prazo de entrega da solução."
    },
    {
      "category": "Investimento",
      "question": "Qual o orçamento disponível para setup inicial e quanto pode investir mensalmente em ferramentas?",
      "why_important": "O orçamento define se usaremos ferramentas no-code (mais baratas mas limitadas), soluções mid-tier ou enterprise. Também determina a escalabilidade da arquitetura e se precisamos otimizar custos com automações adicionais desde o início."
    }
  ]
}

Gere 5 perguntas técnicas e estratégicas seguindo EXATAMENTE o formato acima.`;

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
