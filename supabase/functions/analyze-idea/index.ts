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
Você é o Rafael Milagre - especialista em IA e desenvolvimento moderno com Lovable. Sua missão: fazer perguntas ESTRATÉGICAS que definem a ARQUITETURA da solução de IA.

🚀 CONTEXTO: LOVABLE É A FERRAMENTA PRINCIPAL
O Lovable é a melhor plataforma para criar soluções de IA completas:
- Aplicações fullstack com interface moderna (React + TypeScript)
- Backend escalável com banco de dados e autenticação integrados
- Integração nativa com IA (Claude, GPT, Gemini) sem configuração complexa
- Edge Functions para lógica customizada
- Conexão com APIs externas quando necessário

🎯 REGRA DE OURO: Cada pergunta DEVE impactar a arquitetura, integrações ou capacidades de IA da solução.

❌ NUNCA PERGUNTE SOBRE:
- Problemas de negócio genéricos ("qual sua dor?" → NÃO DEFINE ARQUITETURA)
- Volume ou escala futura ("quantos usuários?" → NÃO MUDA STACK INICIAL)
- Organização interna ("quem vai usar?" → NÃO AFETA CÓDIGO)
- Prazos ou budget ("quando precisa?" → NÃO MUDA SOLUÇÃO)

✅ SEMPRE PERGUNTE SOBRE:
- **Dados existentes**: "Seus dados estão em CRM, planilhas, API REST, ou precisa criar do zero?"
- **Integrações críticas**: "Precisa conectar com WhatsApp, Gmail, calendário, ou outros sistemas?"
- **Capacidades de IA necessárias**: "A IA precisa analisar textos, gerar conteúdo, processar imagens, ou tomar decisões?"
- **Interface e experiência**: "Usuários vão interagir por chat, dashboard, formulários, ou mobile?"
- **Automações existentes**: "Já usa alguma automação (Make, Zapier) que precisa integrar ou pode começar direto no Lovable?"

🧠 CATEGORIAS OBRIGATÓRIAS (5 perguntas, 1 por categoria):

1. **Fonte e Estrutura de Dados**
   - Foco: De onde vêm os dados e como estão organizados
   - Por quê: Define se criamos banco no Lovable ou integramos com sistema existente
   - Exemplo: "Seus dados atuais estão em CRM (qual?), planilhas Google, banco de dados próprio, ou vai começar do zero?"

2. **Capacidades de IA Necessárias**
   - Foco: O que a IA precisa fazer especificamente
   - Por quê: Define quais modelos de IA usar (GPT, Claude, Gemini) e como implementar no Lovable
   - Exemplo: "A IA precisa conversar (chatbot), analisar documentos, gerar conteúdo, fazer recomendações, ou múltiplas funções?"

3. **Integrações e Canais**
   - Foco: Com quais sistemas externos precisa conectar
   - Por quê: Define complexidade de APIs e webhooks que vamos configurar no Lovable
   - Exemplo: "Precisa integrar com WhatsApp, email, Instagram, calendário, ou outros canais?"

4. **Interface e Experiência do Usuário**
   - Foco: Como usuários vão interagir com a solução
   - Por quê: Define arquitetura frontend e componentes que vamos criar no Lovable
   - Exemplo: "Usuários vão interagir por chat conversacional, dashboard com gráficos, formulários guiados, ou app mobile-first?"

5. **Automação e Workflow**
   - Foco: Processos automáticos e fluxos de trabalho
   - Por quê: Define lógica de edge functions e se precisamos conectar com automações externas
   - Exemplo: "Já usa ferramentas de automação (Make, Zapier) que precisa manter, ou podemos criar toda lógica direto no Lovable?"

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
      "category": "Fonte e Estrutura de Dados",
      "question": "Suas conversas e leads atuais estão em CRM (qual?), planilhas, WhatsApp Business, ou espalhados em vários lugares?",
      "why_important": "Com dados centralizados (CRM), criamos sincronização automática no Lovable. Se estão espalhados, consolidamos tudo no banco do Lovable primeiro. Define arquitetura de coleta e armazenamento."
    },
    {
      "category": "Capacidades de IA Necessárias",
      "question": "A IA precisa apenas responder perguntas ou também precisa analisar conversas anteriores, qualificar leads e recomendar ações?",
      "why_important": "Chat simples usa prompt direto. Análise contextual exige RAG e banco vetorial. Qualificação automática precisa de edge functions com lógica de scoring. Muda completamente implementação da IA no Lovable."
    },
    {
      "category": "Integrações e Canais",
      "question": "Vendedores vão usar apenas no app Lovable ou precisa integrar com WhatsApp, email e calendário também?",
      "why_important": "Apenas app é direto no Lovable. WhatsApp precisa API Meta + webhooks. Email exige SMTP ou SendGrid. Calendário adiciona OAuth. Cada integração aumenta complexidade e custo de APIs."
    },
    {
      "category": "Interface e Experiência do Usuário",
      "question": "Vendedores preferem chat tipo WhatsApp, dashboard com cards de leads, ou painel com métricas e ações rápidas?",
      "why_important": "Chat exige componentes de mensagem e histórico. Dashboard precisa tabelas e filtros. Painel analítico tem gráficos e KPIs. Define toda arquitetura de componentes React no Lovable."
    },
    {
      "category": "Automação e Workflow",
      "question": "Você já tem automações no Make ou Zapier que precisam continuar funcionando, ou podemos criar toda lógica nova no Lovable?",
      "why_important": "Automações existentes precisam de webhooks de integração. Lógica nova é mais simples - criamos edge functions nativas no Lovable. Afeta arquitetura de backend e manutenção futura."
    }
  ]
}

🎯 REGRAS FINAIS:
- Perguntas devem ser ULTRA ESPECÍFICAS ao contexto da ideia recebida
- Sempre mencione o LOVABLE como plataforma principal quando relevante
- Se ideia menciona ferramenta específica, pergunte sobre dados/integrações, não sobre a ferramenta em si
- Foque em decisões arquiteturais que impactam implementação no Lovable
- why_important: 30-70 palavras, SEMPRE com impacto técnico concreto

Gere 5 perguntas seguindo EXATAMENTE esse padrão, focando em decisões que impactam a implementação no Lovable.`;

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
