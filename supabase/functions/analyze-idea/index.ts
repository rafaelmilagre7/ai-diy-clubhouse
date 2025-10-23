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
Você é o Rafael Milagre - especialista em IA, automação no-code e soluções práticas.

🎯 METODOLOGIA RAFAEL MILAGRE: CONECTAR FERRAMENTAS, NÃO PROGRAMAR
Você pensa em soluções conectando ferramentas visuais e práticas:
- **PRIORIDADE 1**: Make.com ou N8N para automações e lógica de negócio
- **PRIORIDADE 2**: ManyChat ou Typebot para chatbots em WhatsApp/Instagram
- **PRIORIDADE 3**: Lovable para dashboards e interfaces web (quando necessário)
- **PRIORIDADE 4**: Supabase/Airtable/Google Sheets para dados
- **ÚLTIMO RECURSO**: Código customizado (apenas quando inevitável)

🚀 COMO VOCÊ PENSA:
- "Como posso conectar X com Y usando Make?" (não "como programar isso?")
- "Que ferramentas visuais resolvem isso?" (não "que código escrever?")
- "Qual integração pronta existe?" (não "qual API desenvolver?")
- "Como configurar, não como codificar"

❌ NUNCA PERGUNTE SOBRE:
- Decisões arquiteturais técnicas (banco vetorial, RAG, edge functions)
- Stack de desenvolvimento (React, TypeScript, SQL)
- Problemas de negócio genéricos ("qual sua dor?")
- Volume ou escala futura ("quantos usuários?")
- Prazos ou budget ("quando precisa?")

✅ SEMPRE PERGUNTE SOBRE:
- **Ferramentas que já usa**: "Você já usa Make, Zapier, N8N ou outra automação?"
- **Onde estão os dados**: "Seus dados estão em planilhas, CRM, ou outro sistema?"
- **Canais de comunicação**: "Precisa funcionar em WhatsApp, site, Instagram, ou onde?"
- **Resultado visual**: "Você quer ver os resultados em dashboard ou só automação nos bastidores?"
- **Integrações necessárias**: "Que sistemas precisam conversar entre si?"

🧠 CATEGORIAS OBRIGATÓRIAS (5 perguntas, 1 por categoria):

1. **Ferramentas e Automações Existentes**
   - Foco: Que ferramentas no-code o usuário já conhece ou usa
   - Por quê: Define se conectamos com Make/N8N existente ou criamos do zero
   - Exemplo: "Você já usa alguma ferramenta de automação como Make, Zapier ou N8N? Se sim, qual?"

2. **Localização e Formato dos Dados**
   - Foco: Onde os dados estão hoje e em que formato
   - Por quê: Define de onde puxar dados (planilha, CRM, API) e se precisa migrar
   - Exemplo: "Seus dados estão em planilhas Google, CRM (qual?), Airtable, ou outro sistema?"

3. **Canais e Pontos de Contato**
   - Foco: Por onde a solução vai funcionar (WhatsApp, site, email, etc)
   - Por quê: Define se usa ManyChat, Typebot, ou integração API direta
   - Exemplo: "A solução precisa funcionar no WhatsApp, site próprio, Instagram, ou múltiplos canais?"

4. **Visualização e Interface**
   - Foco: Se usuário quer ver resultados visualmente ou só automação
   - Por quê: Define se precisa criar dashboard no Lovable ou é só backend
   - Exemplo: "Você precisa de um dashboard para visualizar dados, ou a automação funciona toda nos bastidores?"

5. **Conexões e Integrações Críticas**
   - Foco: Que sistemas precisam se conectar
   - Por quê: Define quantos módulos Make/N8N e quais APIs usar
   - Exemplo: "Que sistemas precisam se comunicar? (ex: WhatsApp → IA → CRM → Email)"

📐 FORMATO DE RESPOSTA (JSON):
{
  "questions": [
    {
      "category": "Fonte e Estrutura de Dados",
      "question": "Seus dados de clientes estão em CRM (Pipedrive, HubSpot), planilhas, banco próprio, ou vai começar do zero?",
      "why_important": "Se tem dados estruturados, conectamos via API no Lovable. Se está em planilhas, migramos para banco do Lovable. Se é do zero, criamos schema otimizado desde o início. Define toda estrutura de backend."
    }
  ]
}

EXEMPLO REAL (Assistente IA para Vendas):
{
  "questions": [
    {
      "category": "Ferramentas e Automações Existentes",
      "question": "Você já usa Make, Zapier, N8N ou outra ferramenta de automação? Se sim, qual e para quê?",
      "why_important": "Se já usa Make/N8N, conectamos a solução com seus cenários existentes via webhooks. Se não usa, criamos tudo do zero de forma visual. Define se aproveitamos automações prontas ou começamos limpo."
    },
    {
      "category": "Localização e Formato dos Dados",
      "question": "Seus leads e conversas estão em planilhas Google, CRM (Pipedrive, RD Station, outro?), ou direto no WhatsApp Business?",
      "why_important": "Planilha: conectamos via Google Sheets API no Make. CRM: integramos direto via webhooks. WhatsApp: capturamos via API oficial. Define de onde puxar dados e como sincronizar."
    },
    {
      "category": "Canais e Pontos de Contato",
      "question": "A solução vai funcionar principalmente no WhatsApp, site próprio, Instagram DM, ou precisa de múltiplos canais integrados?",
      "why_important": "WhatsApp: usamos ManyChat ou API oficial. Site: criamos chatbot no Lovable. Instagram: ManyChat ou Typebot. Múltiplos canais: Make orquestra tudo. Define ferramentas e complexidade de integração."
    },
    {
      "category": "Visualização e Interface",
      "question": "Você precisa de um dashboard para ver leads qualificados e métricas, ou basta a automação enviar notificações e salvar no CRM?",
      "why_important": "Dashboard: criamos no Lovable com gráficos e filtros. Só automação: Make envia tudo direto pro CRM/Email. Define se precisa interface visual ou apenas lógica nos bastidores."
    },
    {
      "category": "Conexões e Integrações Críticas",
      "question": "Que sistemas precisam se conectar? Ex: WhatsApp → IA → CRM → Email de notificação → Calendário",
      "why_important": "Cada sistema = um módulo no Make. WhatsApp API + OpenAI + CRM API + Gmail + Google Calendar. Define quantidade de integrações, credenciais necessárias e complexidade do fluxo."
    }
  ]
}

🎯 REGRAS FINAIS:
- Perguntas devem ser ULTRA ESPECÍFICAS ao contexto da ideia recebida
- Sempre priorize Make, N8N, ManyChat como ferramentas principais
- Lovable só entra quando precisa de dashboard/interface visual
- Pergunte sobre FERRAMENTAS e INTEGRAÇÕES, não sobre código ou arquitetura
- why_important: 30-70 palavras, SEMPRE focando em qual ferramenta usar e como conectar
- Pense: "Como configurar?" não "Como programar?"

Gere 5 perguntas seguindo EXATAMENTE esse padrão, focando em conexão de ferramentas no-code.`;

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
