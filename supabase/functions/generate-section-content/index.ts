import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Schema de validação
const GenerateSectionSchema = z.object({
  solutionId: z.string().uuid("ID de solução inválido"),
  sectionType: z.enum([
    "architecture",
    "tools",
    "checklist",
    "lovable",
    "data_flow",
    "user_journey",
    "technical_stack"
  ]),
  userId: z.string().uuid("ID de usuário inválido")
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[SECTION-GEN][${requestId}] === GERAÇÃO DE SEÇÃO INICIADA ===`);

  try {
    // Verificar autenticação
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
      console.error(`[SECTION-GEN][${requestId}] ❌ Token inválido:`, authError);
      return new Response(
        JSON.stringify({ error: 'Token de autenticação inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SECTION-GEN][${requestId}] 🔐 Usuário autenticado: ${user.id}`);

    const body = await req.json();
    const validationResult = GenerateSectionSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return new Response(
        JSON.stringify({ error: firstError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { solutionId, sectionType, userId } = validationResult.data;
    
    console.log(`[SECTION-GEN][${requestId}] 🎯 Seção: ${sectionType}`);
    console.log(`[SECTION-GEN][${requestId}] 📄 Solução ID: ${solutionId.substring(0, 8)}***`);

    // Buscar solução existente
    const { data: solution, error: solutionError } = await supabase
      .from("ai_generated_solutions")
      .select("*")
      .eq("id", solutionId)
      .eq("user_id", userId)
      .single();

    if (solutionError || !solution) {
      console.error(`[SECTION-GEN][${requestId}] ❌ Solução não encontrada`);
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
      ? tools.map((t) => `- ${t.name} (${t.category}) | Logo: ${t.logo_url || 'N/A'}`).join("\n")
      : "Nenhuma ferramenta disponível";

    // Construir prompt específico para cada seção
    let systemPrompt = "";
    let userPrompt = "";
    let toolDefinition: any = null;

    if (sectionType === "tools") {
      systemPrompt = `Você é um especialista em ferramentas e tecnologias para IA e automação.

FERRAMENTAS DISPONÍVEIS NO CATÁLOGO:
${toolsContext}

OBJETIVO: Gerar lista COMPLETA e DETALHADA de ferramentas necessárias (essenciais e opcionais).

REGRAS:
✓ Use SEMPRE as ferramentas do catálogo disponível acima
✓ COPIE exatamente o logo_url da lista acima
✓ Se não houver logo, use https://logo.clearbit.com/[dominio].com
✓ Ferramentas essenciais: 4-8 itens (insubstituíveis)
✓ Ferramentas opcionais: 3-6 itens (melhoram mas não são críticas)
✓ Seja ESPECÍFICO: por que essencial, setup real, custo real
✓ Se a solução envolve criar aplicação web/dashboard, SEMPRE inclua Lovable`;

      userPrompt = `CONTEXTO DA SOLUÇÃO:
Título: ${solution.title}
Descrição: ${solution.short_description}
Ideia Original: ${solution.original_idea}

Framework: ${JSON.stringify(solution.framework_mapping)}

Gere a lista COMPLETA de ferramentas necessárias (essenciais + opcionais).`;

      toolDefinition = {
        type: "function",
        function: {
          name: "generate_tools_list",
          description: "Gerar lista completa de ferramentas",
          parameters: {
            type: "object",
            properties: {
              essential: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    category: { type: "string" },
                    reason: { type: "string", description: "4-6 frases explicando por que é essencial" },
                    setup_complexity: { type: "string", enum: ["easy", "medium", "hard"] },
                    setup_steps: { type: "string", description: "Passos específicos de configuração" },
                    cost_estimate: { type: "string", description: "Custo mensal em USD" },
                    logo_url: { type: "string", description: "URL da logo (COPIE da lista disponível)" },
                    alternatives: { type: "array", items: { type: "string" } }
                  },
                  required: ["name", "category", "reason", "setup_complexity", "cost_estimate", "logo_url"]
                }
              },
              optional: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    category: { type: "string" },
                    reason: { type: "string", description: "Por que PODE ser útil" },
                    when_to_use: { type: "string", description: "Em qual cenário usar" },
                    cost_estimate: { type: "string" },
                    logo_url: { type: "string" }
                  },
                  required: ["name", "category", "reason", "cost_estimate", "logo_url"]
                }
              }
            },
            required: ["essential", "optional"]
          }
        }
      };
    } else if (sectionType === "checklist") {
      systemPrompt = `Você é Rafael Milagre - especialista em execução prática.

OBJETIVO: Criar checklist ULTRA-DETALHADO de implementação (12-25 steps).

REGRAS RAFAEL MILAGRE:
✓ ULTRA-ESPECÍFICO: não "configurar API", mas "acesse console.x.com, clique..."
✓ Cada step = mini-tutorial (5-8 frases)
✓ Métricas mensuráveis
✓ Sem passos genéricos: tudo executável`;

      userPrompt = `CONTEXTO DA SOLUÇÃO:
Título: ${solution.title}
Descrição: ${solution.short_description}
Ideia Original: ${solution.original_idea}

Framework: ${JSON.stringify(solution.framework_mapping)}

Crie checklist COMPLETO de implementação (12-25 passos).`;

      toolDefinition = {
        type: "function",
        function: {
          name: "generate_checklist",
          description: "Gerar checklist detalhado",
          parameters: {
            type: "object",
            properties: {
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    step_number: { type: "integer" },
                    title: { type: "string" },
                    description: { type: "string", description: "5-8 frases ULTRA-DETALHADAS" },
                    estimated_time: { type: "string" },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    dependencies: { type: "array", items: { type: "integer" } },
                    validation_criteria: { type: "string", description: "Como validar conclusão" },
                    common_pitfalls: { type: "string", description: "Erros comuns" },
                    resources: { type: "array", items: { type: "string" } }
                  },
                  required: ["step_number", "title", "description", "estimated_time", "difficulty"]
                }
              }
            },
            required: ["steps"]
          }
        }
      };
    } else if (sectionType === "architecture") {
      systemPrompt = `Você é um arquiteto de software especialista.

OBJETIVO: Gerar o diagrama Mermaid do FLUXO DE ARQUITETURA completo.

⚠️ INSTRUÇÕES MERMAID (CRÍTICO):
- Use "graph TD" ou "graph LR" (NUNCA "flowchart" para architecture)
- Nós: [ ] retângulos, ( ) arredondados, (( )) círculos, [( )] banco
- NUNCA use chaves { } em graphs
- Conexões: -->|texto| ou apenas -->
- Estilos: style NODEID fill:#cor,stroke:#cor,color:#fff
- Máximo 15 nós

EXEMPLO VÁLIDO:
graph TD
  A[Usuário] -->|mensagem| B(WhatsApp API)
  B --> C{Make}
  C -->|qualifica| D[GPT-4]
  D --> E[(CRM)]
  style D fill:#3b82f6`;

      userPrompt = `CONTEXTO:
Título: ${solution.title}
Descrição: ${solution.short_description}

Gere o diagrama Mermaid representando TODO o fluxo técnico.`;

      toolDefinition = {
        type: "function",
        function: {
          name: "generate_architecture",
          description: "Gerar diagrama de arquitetura",
          parameters: {
            type: "object",
            properties: {
              mermaid_code: { type: "string", description: "Código Mermaid completo (graph TD ou LR)" },
              description: { type: "string", description: "Descrição em 1-2 frases" }
            },
            required: ["mermaid_code", "description"]
          }
        }
      };
    } else if (sectionType === "lovable") {
      systemPrompt = `Você é um especialista em criar prompts para a plataforma Lovable.

OBJETIVO: Gerar prompt COMPLETO e EXECUTÁVEL para criar a aplicação no Lovable.

ESTRUTURA DO PROMPT:
1. Objetivo claro (2-3 frases)
2. Funcionalidades principais (lista detalhada)
3. Arquitetura técnica (stack, integrações)
4. UI/UX (design, componentes)
5. Dados (schemas, relacionamentos)

O prompt deve ser COPY-PASTE-READY para o Lovable gerar a aplicação.`;

      userPrompt = `CONTEXTO DA SOLUÇÃO:
Título: ${solution.title}
Descrição: ${solution.short_description}
Framework: ${JSON.stringify(solution.framework_mapping)}

Gere prompt Lovable COMPLETO e EXECUTÁVEL.`;

      toolDefinition = {
        type: "function",
        function: {
          name: "generate_lovable_prompt",
          description: "Gerar prompt para Lovable",
          parameters: {
            type: "object",
            properties: {
              prompt: { type: "string", description: "Prompt completo e copy-paste-ready" }
            },
            required: ["prompt"]
          }
        }
      };
    }

    // Chamar Lovable AI
    console.log(`[SECTION-GEN][${requestId}] 🚀 Chamando Lovable AI...`);
    
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
      console.error(`[SECTION-GEN][${requestId}] ❌ AI Error: ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar conteúdo com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error(`[SECTION-GEN][${requestId}] ❌ Sem tool call na resposta`);
      return new Response(
        JSON.stringify({ error: "Resposta inesperada da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedContent = JSON.parse(toolCall.function.arguments);
    console.log(`[SECTION-GEN][${requestId}] ✅ Conteúdo gerado com sucesso`);

    // Atualizar no banco
    const updateData: any = {};
    
    if (sectionType === "tools") {
      updateData.required_tools = generatedContent;
    } else if (sectionType === "checklist") {
      updateData.implementation_checklist = generatedContent.steps;
    } else if (sectionType === "architecture") {
      updateData.architecture_flowchart = generatedContent;
    } else if (sectionType === "lovable") {
      updateData.lovable_prompt = generatedContent.prompt;
    }

    const { error: updateError } = await supabase
      .from("ai_generated_solutions")
      .update(updateData)
      .eq("id", solutionId);

    if (updateError) {
      console.error(`[SECTION-GEN][${requestId}] ❌ Erro ao atualizar banco:`, updateError);
    } else {
      console.log(`[SECTION-GEN][${requestId}] 💾 Banco atualizado`);
    }

    // Retornar conteúdo
    return new Response(
      JSON.stringify({ 
        success: true,
        content: generatedContent,
        sectionType
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error(`[SECTION-GEN][${requestId}] ❌ Erro:`, err);
    return new Response(
      JSON.stringify({ error: err.message || "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
