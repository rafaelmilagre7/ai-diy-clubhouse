import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { solutionId, userId } = await req.json();

    console.log(`[SMART-ARCH] Gerando arquitetura inteligente para solução ${solutionId}`);

    // Buscar solução completa
    const { data: solution, error: fetchError } = await supabase
      .from("ai_generated_solutions")
      .select("*")
      .eq("id", solutionId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !solution) {
      return new Response(
        JSON.stringify({ error: "Solução não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se já existe (cache)
    if (solution.implementation_flows && solution.architecture_insights) {
      console.log("[SMART-ARCH] Arquitetura já existe, retornando cache");
      return new Response(
        JSON.stringify({ 
          success: true, 
          cached: true,
          flows: solution.implementation_flows,
          insights: solution.architecture_insights
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const lovableUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";

    // Construir prompt super inteligente
    const systemPrompt = `Você é um arquiteto de software sênior especializado em IA, automação e no-code.

CONTEXTO DA SOLUÇÃO:
- Ideia Original: "${solution.original_idea}"
- Título: "${solution.title}"
- Descrição: "${solution.short_description || 'Não especificado'}"
- Ferramentas: ${JSON.stringify(solution.required_tools || {})}
- Framework: ${JSON.stringify(solution.framework_mapping || {})}

ANÁLISE OBRIGATÓRIA - Responda cada pergunta:

1. **Precisa de RAG (Retrieval Augmented Generation)?**
   - Se a solução envolve: base de conhecimento, documentos, PDFs, chatbot inteligente, respostas contextualizadas
   - Identifique: onde usar RAG, qual estratégia (embedding + vector DB), qual modelo de embedding

2. **Precisa integrar CRM?**
   - Ferramentas: HubSpot, Salesforce, Pipedrive, RD Station
   - Como: capturar leads, atualizar status, sincronizar dados

3. **Quais APIs externas são necessárias?**
   - WhatsApp Business API, OpenAI/Anthropic/Google AI, Stripe, SendGrid, Twilio, etc
   - Identifique todas as integrações necessárias

4. **Qual modelo de IA usar em cada etapa?**
   - GPT-5 ($3/1M tokens): raciocínio complexo, análise profunda
   - Gemini 2.5 Flash ($0.075/1M): melhor custo-benefício, rápido
   - Claude Sonnet 4.5 ($3/1M): melhor para código e análise
   - Quando usar cada um?

5. **Onde armazenar dados?**
   - Google Sheets (simples), Airtable (relacional), Supabase (robusto), Pinecone (vectors)
   - Justifique a escolha

6. **Como notificar usuários?**
   - Email (Resend/SendGrid), WhatsApp, Slack, webhooks

7. **Estimativa de custos mensais**
   - APIs de IA, storage, automação, comunicação
   - Breakdown detalhado

GERE 3 FLUXOS MERMAID DIFERENTES:

**FLUXO 1: Implementação Principal** (graph TD)
- 10-15 etapas do início ao deploy
- Decisões críticas marcadas com rombo {}
- Cores para destacar: style NodeId fill:#cor

**FLUXO 2: Fluxo de Dados/APIs** (sequenceDiagram)
- Como dados circulam entre sistemas
- Todas as chamadas de API
- Processamento e armazenamento

**FLUXO 3: Arquitetura de IA com Custos** (graph LR)
- Modelos de IA usados
- Onde entra RAG (se aplicável)
- Estimativa de custo por componente

REGRAS MERMAID:
- Use \\n para quebras de linha
- IDs sem espaços (use_underscores)
- Para graph: --> para conexões
- Para sequence: ->> para mensagens
- Mantenha LEGÍVEL (máximo 15-20 nós por diagrama)

FORMATO DE RESPOSTA (JSON PURO):
{
  "implementation_flows": {
    "flows": [
      {
        "id": "main_implementation",
        "title": "Fluxo Principal de Implementação do [Nome Solução]",
        "description": "Detalhamento completo",
        "mermaid_code": "graph TD\\n  Start[...]",
        "estimated_time": "15-20h",
        "complexity": "high",
        "key_decisions": [
          "Usar RAG ou fine-tuning?",
          "Qual embedding model?"
        ]
      },
      {
        "id": "data_flow",
        "title": "Fluxo de Dados e APIs",
        "description": "Como dados circulam",
        "mermaid_code": "sequenceDiagram\\n  User->>...",
        "estimated_time": "5-8h",
        "complexity": "medium"
      },
      {
        "id": "ai_architecture",
        "title": "Arquitetura de IA e Custos",
        "description": "Modelos, RAG, custos",
        "mermaid_code": "graph LR\\n  Input[...]",
        "estimated_time": "10-12h",
        "complexity": "high"
      }
    ],
    "total_estimated_time": "30-40 horas",
    "prerequisites": "Lista específica de pré-requisitos (contas, conhecimentos, acessos)"
  },
  "architecture_insights": {
    "needs_rag": true/false,
    "rag_strategy": "Se sim: Embedding via OpenAI Ada v3 → Pinecone → GPT-5 para geração",
    "rag_cost_estimate": "Se sim: $50-100/mês (embedding + vector DB)",
    "needs_crm": true/false,
    "crm_integration": "Se sim: HubSpot via Make webhook",
    "external_apis": [
      {
        "name": "WhatsApp Business API",
        "purpose": "Receber mensagens dos clientes",
        "cost": "$0/mês (até 1000 conversas)"
      },
      {
        "name": "OpenAI GPT-5",
        "purpose": "Qualificação de leads via IA",
        "cost": "$200-300/mês (estimado)"
      }
    ],
    "data_storage": {
      "primary": "Airtable",
      "reason": "Relacional, fácil integração com Make",
      "cost": "$20/mês"
    },
    "ai_models": [
      {
        "model": "GPT-5",
        "use_case": "Análise complexa de leads",
        "when_to_use": "Quando precisa raciocínio profundo",
        "cost_per_1m_tokens": "$3",
        "alternative": "Gemini 2.5 Flash ($0.075/1M) se custo for crítico"
      }
    ],
    "total_monthly_cost_estimate": {
      "min": "$50",
      "max": "$300",
      "breakdown": {
        "ai_apis": "$200",
        "storage": "$20",
        "communication": "$30",
        "automation": "$50"
      }
    },
    "recommended_stack": [
      "Lovable (frontend)",
      "Make (automação)",
      "Airtable (dados)",
      "OpenAI (IA)",
      "Resend (email)"
    ]
  }
}

Seja ULTRA ESPECÍFICO. Não seja genérico. Use os dados da solução para fazer análise real.`;

    console.log("[SMART-ARCH] Chamando Lovable AI...");

    const aiResponse = await fetch(lovableUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você retorna APENAS JSON válido, sem markdown." },
          { role: "user", content: systemPrompt }
        ],
        temperature: 0.8,
        max_tokens: 16000
      }),
      signal: AbortSignal.timeout(90000) // 90 segundos
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[SMART-ARCH] Erro AI: ${aiResponse.status} - ${errorText}`);
      throw new Error(`Erro na API de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse JSON
    let parsedContent;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("[SMART-ARCH] Erro parse JSON:", content.substring(0, 500));
      throw new Error("JSON inválido retornado pela IA");
    }

    // Validar estrutura mínima
    if (!parsedContent.implementation_flows || !parsedContent.architecture_insights) {
      throw new Error("Resposta da IA sem campos obrigatórios");
    }

    // Salvar no banco
    const { error: updateError } = await supabase
      .from("ai_generated_solutions")
      .update({
        implementation_flows: parsedContent.implementation_flows,
        architecture_insights: parsedContent.architecture_insights,
        updated_at: new Date().toISOString()
      })
      .eq("id", solutionId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("[SMART-ARCH] Erro ao salvar:", updateError);
      throw new Error("Erro ao salvar arquitetura");
    }

    console.log("[SMART-ARCH] ✅ Arquitetura inteligente gerada e salva");

    return new Response(
      JSON.stringify({ 
        success: true,
        cached: false,
        flows: parsedContent.implementation_flows,
        insights: parsedContent.architecture_insights
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[SMART-ARCH] Erro:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro ao gerar arquitetura",
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
