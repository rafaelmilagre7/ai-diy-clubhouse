import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FlowGenerationSchema = z.object({
  solutionId: z.string().uuid("ID de solução inválido"),
  flowType: z.enum([
    "automation_journey",
    "ai_architecture",
    "deploy_checklist",
    "api_integration"
  ]),
  userId: z.string().uuid("ID de usuário inválido")
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[FLOWS-GEN][${requestId}] === GERAÇÃO DE FLUXO INICIADA ===`);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação necessário' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error(`[FLOWS-GEN][${requestId}] ❌ Token inválido:`, authError);
      return new Response(
        JSON.stringify({ error: 'Token de autenticação inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const validationResult = FlowGenerationSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return new Response(
        JSON.stringify({ error: firstError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { solutionId, flowType, userId } = validationResult.data;
    
    console.log(`[FLOWS-GEN][${requestId}] 🎯 Tipo: ${flowType}`);
    console.log(`[FLOWS-GEN][${requestId}] 📄 Solução: ${solutionId.substring(0, 8)}***`);

    // Buscar solução existente
    const { data: solution, error: solutionError } = await supabase
      .from("ai_generated_solutions")
      .select("*")
      .eq("id", solutionId)
      .eq("user_id", userId)
      .single();

    if (solutionError || !solution) {
      console.error(`[FLOWS-GEN][${requestId}] ❌ Solução não encontrada`);
      return new Response(
        JSON.stringify({ error: "Solução não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar ferramentas disponíveis
    const { data: tools } = await supabase
      .from("tools")
      .select("id, name, category, official_url, logo_url")
      .eq("status", true);

    const toolsContext = tools
      ? tools.map((t) => `- ${t.name} (${t.category}) | URL: ${t.official_url} | Logo: ${t.logo_url || 'N/A'}`).join("\n")
      : "Nenhuma ferramenta disponível";

    // Construir prompt específico para cada tipo de fluxo
    let systemPrompt = "";
    let userPrompt = "";
    let toolDefinition: any = null;

    if (flowType === "automation_journey") {
      systemPrompt = `Você é um especialista em automação no-code.

OBJETIVO: Criar uma JORNADA DE AUTOMAÇÃO visual e acionável.

FERRAMENTAS DISPONÍVEIS:
${toolsContext}

ESTRUTURA DA JORNADA:
- 5-10 etapas sequenciais
- Cada etapa = configuração específica em uma ferramenta
- Links diretos para tutoriais/docs
- Tempo estimado real
- Ícones das ferramentas (usar logo_url do catálogo)

EXEMPLO DE ETAPA:
{
  "id": "step-1",
  "tool_name": "Make.com",
  "tool_icon": "https://logo.clearbit.com/make.com",
  "title": "Configurar Webhook de Entrada",
  "description": "Acesse make.com → Scenarios → Create → Webhook → Copy URL → Cole no WhatsApp Business API",
  "estimated_time": "15min",
  "tutorial_link": "https://make.com/docs/webhooks",
  "order": 1
}`;

      userPrompt = `SOLUÇÃO:
Título: ${solution.title}
Descrição: ${solution.short_description}
Ideia: ${solution.original_idea}

Framework: ${JSON.stringify(solution.framework_mapping)}
Ferramentas: ${JSON.stringify(solution.required_tools)}

Crie a jornada de automação passo-a-passo (5-10 etapas).`;

      toolDefinition = {
        type: "function",
        function: {
          name: "generate_automation_journey",
          description: "Gerar jornada de automação",
          parameters: {
            type: "object",
            properties: {
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    tool_name: { type: "string" },
                    tool_icon: { type: "string", description: "URL da logo (COPIE do catálogo)" },
                    title: { type: "string" },
                    description: { type: "string", description: "3-5 frases ULTRA-ESPECÍFICAS" },
                    estimated_time: { type: "string" },
                    tutorial_link: { type: "string" },
                    order: { type: "integer" }
                  },
                  required: ["id", "tool_name", "tool_icon", "title", "description", "estimated_time", "order"]
                }
              },
              total_time: { type: "string", description: "Tempo total estimado" },
              difficulty: { type: "string", enum: ["Fácil", "Intermediário", "Avançado"] }
            },
            required: ["steps", "total_time", "difficulty"]
          }
        }
      };
    } else if (flowType === "ai_architecture") {
      systemPrompt = `Você é um arquiteto de IA especializado em otimização de custos.

OBJETIVO: Criar ÁRVORE DE DECISÃO para escolha de modelos de IA.

REGRAS:
- Começar do cenário inicial (ex: "Cliente envia mensagem")
- Para cada decisão, mostrar 2-3 opções
- Cada opção = modelo de IA específico + benchmark de custo/latência
- Critérios claros de quando usar cada um
- Fallback se API falhar

MODELOS DISPONÍVEIS:
- GPT-4 Turbo ($10/1M tokens, 2-3s latência)
- Claude Sonnet ($3/1M tokens, 1-2s latência)
- Gemini Flash ($0.15/1M tokens, 0.5-1s latência)
- Llama 3 (self-hosted, custo fixo, 1-2s latência)

ESTRUTURA DE NÓ:
{
  "id": "node-1",
  "question": "Tipo de mensagem?",
  "type": "decision",
  "options": [
    {
      "label": "Texto simples",
      "next_node": "node-2",
      "ai_model": "gemini-flash",
      "reason": "Custo baixo, resposta rápida suficiente"
    }
  ],
  "benchmark": {
    "latency": "0.5-1s",
    "cost_per_1k": "$0.00015"
  }
}`;

      userPrompt = `SOLUÇÃO:
Título: ${solution.title}
Descrição: ${solution.short_description}

Framework: ${JSON.stringify(solution.framework_mapping)}

Crie árvore de decisão de IA (5-10 nós de decisão).`;

      toolDefinition = {
        type: "function",
        function: {
          name: "generate_ai_architecture",
          description: "Gerar árvore de decisão de IA",
          parameters: {
            type: "object",
            properties: {
              decision_nodes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    question: { type: "string" },
                    type: { type: "string", enum: ["decision", "action", "end"] },
                    options: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          next_node: { type: "string" },
                          ai_model: { type: "string" },
                          reason: { type: "string" }
                        },
                        required: ["label", "ai_model", "reason"]
                      }
                    },
                    benchmark: {
                      type: "object",
                      properties: {
                        latency: { type: "string" },
                        cost_per_1k: { type: "string" }
                      }
                    }
                  },
                  required: ["id", "question", "type"]
                }
              },
              estimated_monthly_cost: { type: "string", description: "Custo mensal estimado" }
            },
            required: ["decision_nodes", "estimated_monthly_cost"]
          }
        }
      };
    } else if (flowType === "deploy_checklist") {
      systemPrompt = `Você é Rafael Milagre - especialista em execução prática.

OBJETIVO: Criar CHECKLIST INTERATIVO de deployment.

REGRAS RAFAEL MILAGRE:
✓ 8-15 tarefas (não mais que isso)
✓ Cada tarefa = mini-tutorial (4-6 frases)
✓ Ordem lógica de execução
✓ Critérios de validação claros
✓ Links para recursos/tutoriais

ESTRUTURA DE TAREFA:
{
  "id": "task-1",
  "title": "Criar conta Make.com",
  "description": "1. Acesse make.com/register\n2. Use email corporativo\n3. Escolha plano Free (até 1000 operações/mês)\n4. Confirme email",
  "estimated_time": "10min",
  "order": 1,
  "validation": "Você consegue acessar o dashboard do Make e ver 'No scenarios'",
  "video_url": "https://youtube.com/watch?v=xxx",
  "dependencies": []
}`;

      userPrompt = `SOLUÇÃO:
Título: ${solution.title}
Descrição: ${solution.short_description}

Checklist atual: ${JSON.stringify(solution.implementation_checklist)}
Ferramentas: ${JSON.stringify(solution.required_tools)}

Transforme em checklist interativo de deploy (8-15 tarefas).`;

      toolDefinition = {
        type: "function",
        function: {
          name: "generate_deploy_checklist",
          description: "Gerar checklist de deployment",
          parameters: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string", description: "4-6 frases ULTRA-DETALHADAS" },
                    estimated_time: { type: "string" },
                    order: { type: "integer" },
                    validation: { type: "string", description: "Como validar conclusão" },
                    video_url: { type: "string" },
                    dependencies: { type: "array", items: { type: "integer" } }
                  },
                  required: ["id", "title", "description", "estimated_time", "order", "validation"]
                }
              },
              total_time: { type: "string" },
              difficulty: { type: "string", enum: ["Fácil", "Intermediário", "Avançado"] }
            },
            required: ["items", "total_time", "difficulty"]
          }
        }
      };
    } else if (flowType === "api_integration") {
      systemPrompt = `Você é um arquiteto de APIs e integrações.

OBJETIVO: Criar MAPA DE INTEGRAÇÕES entre ferramentas.

ESTRUTURA:
- Nós = ferramentas (com status: configured/pending)
- Arestas = conexões API entre elas
- Cada conexão = tipo (webhook/REST/websocket) + auth + endpoint

EXEMPLO DE ESTRUTURA:
{
  "nodes": [
    {
      "id": "make",
      "label": "Make.com",
      "type": "orchestrator",
      "status": "configured"
    }
  ],
  "edges": [
    {
      "source": "make",
      "target": "whatsapp",
      "connection_type": "webhook",
      "auth": "bearer_token",
      "endpoint": "https://graph.facebook.com/v18.0/messages",
      "docs_url": "https://developers.facebook.com/docs/whatsapp"
    }
  ]
}`;

      userPrompt = `SOLUÇÃO:
Título: ${solution.title}
Ferramentas: ${JSON.stringify(solution.required_tools)}
Framework: ${JSON.stringify(solution.framework_mapping)}

Mapeie TODAS as integrações API necessárias.`;

      toolDefinition = {
        type: "function",
        function: {
          name: "generate_api_integration_map",
          description: "Gerar mapa de integrações API",
          parameters: {
            type: "object",
            properties: {
              nodes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    type: { type: "string", enum: ["orchestrator", "ai_service", "database", "api", "frontend"] },
                    status: { type: "string", enum: ["configured", "pending", "optional"] }
                  },
                  required: ["id", "label", "type", "status"]
                }
              },
              edges: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    source: { type: "string" },
                    target: { type: "string" },
                    connection_type: { type: "string", enum: ["webhook", "rest_api", "websocket", "graphql"] },
                    auth: { type: "string", enum: ["bearer_token", "api_key", "oauth2", "basic_auth"] },
                    endpoint: { type: "string" },
                    docs_url: { type: "string" }
                  },
                  required: ["source", "target", "connection_type", "auth", "endpoint"]
                }
              }
            },
            required: ["nodes", "edges"]
          }
        }
      };
    }

    // Chamar Lovable AI
    console.log(`[FLOWS-GEN][${requestId}] 🚀 Chamando Lovable AI...`);
    
    const lovableAIUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableAIKey = Deno.env.get("LOVABLE_API_KEY");

    const aiResponse = await fetch(lovableAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableAIKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [toolDefinition],
        tool_choice: { type: "function", function: { name: toolDefinition.function.name } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[FLOWS-GEN][${requestId}] ❌ AI Error: ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar conteúdo com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error(`[FLOWS-GEN][${requestId}] ❌ Sem tool call na resposta`);
      return new Response(
        JSON.stringify({ error: "Resposta inesperada da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedContent = JSON.parse(toolCall.function.arguments);
    console.log(`[FLOWS-GEN][${requestId}] ✅ Conteúdo gerado com sucesso`);

    // Atualizar no banco
    const updateData: any = {};
    
    if (flowType === "automation_journey") {
      updateData.automation_journey_flow = generatedContent;
    } else if (flowType === "ai_architecture") {
      updateData.ai_architecture_tree = generatedContent;
    } else if (flowType === "deploy_checklist") {
      updateData.deploy_checklist_structured = generatedContent;
    } else if (flowType === "api_integration") {
      updateData.api_integration_map = generatedContent;
    }

    const { error: updateError } = await supabase
      .from("ai_generated_solutions")
      .update(updateData)
      .eq("id", solutionId);

    if (updateError) {
      console.error(`[FLOWS-GEN][${requestId}] ❌ Erro ao atualizar banco:`, updateError);
    } else {
      console.log(`[FLOWS-GEN][${requestId}] 💾 Banco atualizado`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        content: generatedContent,
        flowType
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error(`[FLOWS-GEN][${requestId}] ❌ Erro:`, err);
    return new Response(
      JSON.stringify({ error: err.message || "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
