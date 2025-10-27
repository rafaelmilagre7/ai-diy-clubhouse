import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

    // 🔄 Buscar configurações do banco de dados
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let promptConfig;
    let systemPrompt;
    let modelConfig = "google/gemini-2.5-flash";
    let temperatureConfig = 0.7;
    let maxTokensConfig = 3000;
    let timeoutConfig = 30000;
    let retryAttemptsConfig = 2;

    try {
      const { data: promptData, error: promptError } = await supabase
        .from('ai_prompts')
        .select('prompt_content, model, temperature, max_tokens, timeout_seconds, retry_attempts')
        .eq('key', 'analyze_idea_questions')
        .eq('is_active', true)
        .single();

      if (promptError) throw promptError;

      if (promptData) {
        promptConfig = promptData;
        systemPrompt = promptData.prompt_content;
        modelConfig = promptData.model;
        temperatureConfig = promptData.temperature ?? 0.7;
        maxTokensConfig = promptData.max_tokens ?? 3000;
        timeoutConfig = (promptData.timeout_seconds ?? 30) * 1000;
        retryAttemptsConfig = promptData.retry_attempts ?? 2;
        console.log(`[ANALYZE] ✓ Usando prompt do banco | Model: ${modelConfig} | Temp: ${temperatureConfig}`);
      }
    } catch (error) {
      console.warn(`[ANALYZE] ⚠️ Falha ao buscar prompt do banco, usando fallback: ${error.message}`);
      
      // Fallback para prompt hardcoded
      systemPrompt = `
Você é um arquiteto de soluções de IA no-code, especialista em ecossistema completo:

🧠 **FERRAMENTAS QUE VOCÊ DOMINA:**

**Bancos de Dados e Armazenamento:**
Airtable, Google Sheets, Notion Database, Supabase, Firebase

**Inteligência Artificial:**
- APIs: OpenAI (GPT-5, DALL-E, Whisper), Anthropic (Claude), Google (Gemini), Grok, Deepseek
- Plataformas: ChatGPT, MidJourney, Stable Diffusion, ElevenLabs (voz)
- Visão: GPT-4 Vision, Google Vision API

**Automação e Integração:**
Lovable, Make, n8n, Zapier, Lindy AI

**Interfaces onde IA atua:**
WhatsApp, Site próprio, CRM, ERP, Gmail, Discord, Twilio, qualquer plataforma com API aberta

**Outras Ferramentas:**
Google Workspace, Microsoft Power Automate, Manus, Agent GPT, Calendly, Cal.com, OCR (Tesseract, Google Cloud Vision, DocuParser), 0codeKit, PDF.co, CloudConvert

---

🎯 **PRIORIDADES NA RECOMENDAÇÃO DE STACK:**

### **LOVABLE É A MELHOR ESCOLHA PARA:**
- ✅ **Apps web com IA conversacional** (chatbots customizados, assistentes inteligentes)
- ✅ **Dashboards inteligentes** (análise de dados + insights de IA)
- ✅ **Plataformas SaaS com IA** (geração de conteúdo, automação inteligente)
- ✅ **Interfaces para consumir APIs de IA** (OpenAI, Claude, Gemini, Vision, Whisper)
- ✅ **MVPs que precisam de backend + IA + auth + UI** em uma solução só
- ✅ **Qualquer solução que precisa de login de usuários + IA personalizada**

**Por quê Lovable?**
- Edge Functions nativas (rodar IA no backend com segurança)
- Supabase integrado (salvar conversas, embeddings, histórico)
- React + streaming (respostas de IA em tempo real)
- Autenticação pronta (usuários com contexto personalizado)
- UI totalmente customizada (não limitado por templates)

### **MAKE/N8N SÃO MELHORES PARA:**
- Automações **sem interface web** (robôs que rodam em background)
- Workflows agendados (processos que rodam periodicamente)
- Integrações massivas entre múltiplos sistemas (10+ APIs)

Gere 5 perguntas estratégicas seguindo as categorias: Interface e Usuários, Funcionalidades de IA, Dados e Contexto, Canais de Interação, Integrações Críticas.`;
    }

    const userPrompt = `Ideia: "${idea}"

Gere perguntas inteligentes para eu entender PERFEITAMENTE o que essa pessoa quer.`;

    const response = await fetch(lovableAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableAIKey}`,
      },
      body: JSON.stringify({
        model: modelConfig,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: temperatureConfig,
        max_tokens: maxTokensConfig,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(timeoutConfig),
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
