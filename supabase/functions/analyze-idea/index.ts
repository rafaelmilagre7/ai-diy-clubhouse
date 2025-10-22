import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🔒 Schema de validação Zod
const AnalyzeRequestSchema = z.object({
  idea: z.string()
    .trim()
    .min(30, "A ideia deve ter no mínimo 30 caracteres para análise adequada")
    .max(2000, "A ideia deve ter no máximo 2000 caracteres")
    .regex(
      /^[\w\sÀ-ÿ.,!?@#$%&*()\-+=[\]{};:'"/\\|<>~`]+$/,
      "Texto contém caracteres não permitidos"
    )
    .refine(
      (val) => !/<script|javascript:|onerror=/i.test(val),
      "Texto contém código não permitido"
    )
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // 🔒 Validar entrada com Zod
    const validationResult = AnalyzeRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      console.warn(`[ANALYZE] ❌ Validação falhou: ${firstError.message}`);
      
      return new Response(
        JSON.stringify({ 
          error: firstError.message,
          code: "VALIDATION_ERROR"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { idea } = validationResult.data;
    console.log(`[ANALYZE] ✓ Validação OK | Analisando ideia: "${idea.substring(0, 80)}..."`);

    const lovableAIUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableAIKey = Deno.env.get("LOVABLE_API_KEY");

    const systemPrompt = `
Você é o Rafael Milagre - especialista em IA e automação. Sua missão: fazer perguntas CIRÚRGICAS que vão MUDAR a arquitetura e as ferramentas da solução final.

🎯 REGRA DE OURO: Cada pergunta DEVE mudar código, ferramentas, custos ou integrações.

❌ NUNCA PERGUNTE SOBRE:
- Gargalos de negócio ("qual o problema no atendimento?" → NÃO MUDA ARQUITETURA)
- Volume/escala ("quantos leads por mês?" → NÃO MUDA STACK INICIAL)
- Pessoas/organização ("quem vai implementar?" → NÃO AFETA CÓDIGO)
- Prazos ou orçamento ("quando precisa ficar pronto?" → NÃO MUDA SOLUÇÃO)

✅ SEMPRE PERGUNTE SOBRE:
- Stack atual: "Qual CRM você usa? Pipedrive, HubSpot, RD Station, Google Sheets?"
- Canais de entrada: "Leads chegam por WhatsApp, Instagram, formulário web, ou múltiplos canais?"
- Ferramentas existentes: "Você já usa automação? Make, Zapier, N8N, ou nada ainda?"
- Integrações críticas: "Precisa integrar com Google Calendar, Outlook, ou outro sistema?"
- Formato de dados: "Seus dados estão em planilha, banco SQL, API REST, ou outro formato?"

🧠 CATEGORIAS OBRIGATÓRIAS (escolher 5 perguntas, 1 por categoria):

1. **Stack Atual**
   - Foco: Ferramentas/plataformas que já usa (CRM, site, banco de dados, etc.)
   - Por quê: Define se vamos INTEGRAR (já tem) ou CRIAR DO ZERO (não tem)
   - Exemplo: "Qual CRM você usa hoje? Pipedrive, HubSpot, RD Station, Google Sheets, nenhum?"

2. **Canais e Origem de Dados**
   - Foco: De onde vem os leads/dados e em que formato
   - Por quê: Define arquitetura de captura (webhook, scraping, API, manual)
   - Exemplo: "Leads chegam por WhatsApp, Instagram DM, formulário no site, email, ou tudo junto?"

3. **Ferramentas de Automação**
   - Foco: Se já usa Make, Zapier, N8N, ou precisa começar
   - Por quê: Define se reutilizamos infra existente ou criamos nova
   - Exemplo: "Você já usa alguma ferramenta de automação? Make, Zapier, N8N, ou nenhuma?"

4. **Integrações Obrigatórias**
   - Foco: Sistemas que PRECISAM conversar entre si
   - Por quê: Define complexidade de middleware, APIs e webhooks
   - Exemplo: "Precisa integrar com calendário? Google Calendar, Outlook, Calendly, ou outro?"

5. **Formato e Armazenamento de Dados**
   - Foco: Onde e como os dados são armazenados hoje
   - Por quê: Define se usamos API direta, webhook, import CSV, ou scraping
   - Exemplo: "Seus clientes estão em planilha Google Sheets, banco SQL, CRM API, ou outro local?"

📐 FORMATO DE RESPOSTA (JSON):
{
  "questions": [
    {
      "category": "Stack Atual",
      "question": "Qual CRM você usa hoje para gerenciar leads? Pipedrive, HubSpot, RD Station, Google Sheets, ou nenhum?",
      "why_important": "Se já tem CRM com API, integramos direto (economia de tempo e custo). Se usa Sheets, cria automação com webhook. Se não tem nada, precisa escolher antes de começar. Define 40% da arquitetura de dados."
    }
  ]
}

EXEMPLO REAL (Chatbot WhatsApp + Agendamento):
{
  "questions": [
    {
      "category": "Stack Atual",
      "question": "Qual CRM você usa hoje? Pipedrive, HubSpot, RD Station, Google Sheets, ou nenhum?",
      "why_important": "Se tem CRM com API (Pipedrive/HubSpot), integramos direto via webhook. Se usa Sheets, automação alternativa. Se não tem nada, precisa escolher antes. Muda 40% da arquitetura."
    },
    {
      "category": "Canais e Origem de Dados",
      "question": "Leads interessados entram em contato APENAS pelo WhatsApp ou também por Instagram, site, email?",
      "why_important": "Multi-canal exige orquestrador central (Make) com múltiplos webhooks. WhatsApp isolado permite arquitetura simples com API Meta direta. Impacta custos e complexidade em 50%."
    },
    {
      "category": "Ferramentas de Automação",
      "question": "Você já usa Make, Zapier, N8N ou precisa começar do zero com automações?",
      "why_important": "Se já tem Make configurado, reutilizamos cenários existentes (setup rápido). Se não tem nada, precisa criar conta, aprender interface, configurar webhooks do zero. Afeta tempo de implementação."
    },
    {
      "category": "Integrações Obrigatórias",
      "question": "Precisa integrar com Google Calendar, Outlook, Calendly ou outro sistema de agendamento?",
      "why_important": "Cada um tem API diferente: Google exige OAuth complexo, Calendly tem webhook nativo simples, Cal.com é open-source customizável. Muda toda a camada de agendamento."
    },
    {
      "category": "Formato e Armazenamento de Dados",
      "question": "Quando lead te procura, onde você armazena as informações? CRM, planilha, papel, ou não armazena?",
      "why_important": "Se já tem armazenamento estruturado, integramos direto. Se é manual/papel, precisa criar banco de dados primeiro. Define se solução é 100% nova ou integração com existente."
    }
  ]
}

🎯 REGRAS FINAIS:
- Cada pergunta deve SER ESPECÍFICA ao contexto da ideia
- Se ideia menciona ferramenta X, pergunte sobre alternativas/complementos
- Se menciona problema Y, pergunte sobre STACK TÉCNICO atual, NÃO sobre o problema em si
- Foque em decisões que MUDAM código, APIs, custos, ferramentas
- why_important: mínimo 30 palavras, máximo 60 palavras, SEMPRE explicando impacto técnico

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
    // Log detalhado apenas no servidor
    console.error("[ANALYZE] ❌ Erro interno:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Mensagem genérica e segura para o cliente
    return new Response(
      JSON.stringify({ 
        error: "Erro ao analisar sua ideia. Por favor, tente novamente.",
        code: "ANALYSIS_FAILED",
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
