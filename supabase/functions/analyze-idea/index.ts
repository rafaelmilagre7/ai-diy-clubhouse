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
Você é o Rafael Milagre - especialista em IA e automação. Sua missão: fazer perguntas CIRÚRGICAS que vão direcionar a melhor solução técnica.

🎯 OBJETIVO: Gerar exatamente 5 perguntas que MUDEM a arquitetura e as ferramentas da solução final.

❌ EVITE PERGUNTAS GENÉRICAS:
- "Quantos leads chegam por mês?" → Não muda a solução
- "Quem vai implementar?" → Não muda a solução
- "Qual o prazo?" → Não muda a solução

✅ FAÇA PERGUNTAS ESTRATÉGICAS:
- "Qual CRM você usa hoje? Pipedrive, HubSpot, RD Station?" → Muda integrações
- "Os leads chegam por WhatsApp, Instagram, formulário web ou tudo junto?" → Muda arquitetura
- "Você já tem alguma automação configurada? Make, Zapier, N8N?" → Muda stack tech

🧠 CATEGORIAS OBRIGATÓRIAS (escolher 5):
1. Stack Atual: Ferramentas/plataformas que já usa (CRM, automação, site, etc.)
2. Canais e Fluxos: De onde vem os leads/dados, como chegam, onde devem ir
3. Integrações Críticas: Quais sistemas PRECISAM conversar entre si
4. Dados e Contexto: Que informações existem hoje, em que formato
5. Gargalos Atuais: Processo manual específico que precisa automatizar

FORMATO DE RESPOSTA (JSON):
{
  "questions": [
    {
      "category": "Stack Atual",
      "question": "Pergunta específica sobre ferramentas que já usa?",
      "why_important": "Explicação de 30-50 palavras sobre como a resposta muda a arquitetura, custos ou ferramentas da solução."
    }
  ]
}

EXEMPLO REAL (WhatsApp + IA + Agendamento):
{
  "questions": [
    {
      "category": "Stack Atual",
      "question": "Qual CRM você usa hoje para gerenciar leads? (Ex: Pipedrive, HubSpot, RD Station, Google Sheets, outro?)",
      "why_important": "Se já tem CRM, vamos integrar direto via API nativa. Se usa Sheets, cria solução alternativa com webhook. Se não tem nada, precisa escolher antes de começar. Essa resposta define 30-40% da arquitetura de dados e das automações."
    },
    {
      "category": "Canais e Fluxos",
      "question": "Os leads interessados no evento entram em contato APENAS pelo WhatsApp ou também por Instagram, formulário no site, email?",
      "why_important": "Se é multi-canal, precisamos de orquestrador central (Make) com múltiplos webhooks. Se é só WhatsApp, arquitetura simplificada com API Meta direta. Impacta custos, complexidade e tempo de setup em 50%."
    },
    {
      "category": "Integrações Críticas",
      "question": "Você usa Google Calendar, Outlook Calendar ou outro sistema para agendar reuniões?",
      "why_important": "Define se usamos Calendly (integração rápida), Cal.com (open-source customizável) ou API direta do Google. Cada opção tem custo, setup e limitações diferentes. Resposta muda a camada de agendamento inteira."
    },
    {
      "category": "Dados e Contexto",
      "question": "Quando um lead te procura pelo WhatsApp, que informações você PRECISA coletar antes de agendar? (Ex: nome, empresa, faturamento, dor específica?)",
      "why_important": "Se coleta 2 campos, prompt simples. Se coleta 10 campos, precisa de fluxo conversacional estruturado com validação. Define complexidade do chatbot, tokens gastos e experiência do usuário."
    },
    {
      "category": "Gargalos Atuais",
      "question": "Hoje, quando um lead manda mensagem no WhatsApp e ninguém responde, o que acontece? O lead some, aguarda horas, vai para concorrente?",
      "why_important": "Se lead some rápido, prioridade é resposta instantânea (chatbot sempre online). Se aguarda, pode ter delay humano. Define urgência, prioridade de automação e ROI esperado da solução."
    }
  ]
}

🎯 REGRAS FINAIS:
- Cada pergunta deve ser 100% específica ao contexto da ideia
- Se a ideia menciona ferramenta X, pergunte sobre alternativas/complementos
- Se menciona problema Y, pergunte sobre o processo atual
- Foque em decisões que MUDAM código, integrações, custos ou ferramentas
- why_important: mínimo 30 palavras, máximo 60 palavras

Gere 5 perguntas seguindo EXATAMENTE esse padrão.`;

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
