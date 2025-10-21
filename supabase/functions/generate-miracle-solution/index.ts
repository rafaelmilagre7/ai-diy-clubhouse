import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  idea: string;
  userId: string;
  answers?: Array<{ question: string; answer: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { idea, userId, answers = [] }: GenerateRequest = await req.json();

    console.log(`[MIRACLE] === GERAÇÃO MIRACLE AI INICIADA ===`);
    console.log(`[MIRACLE] 👤 User ID: ${userId}`);
    console.log(`[MIRACLE] 💡 Ideia: "${idea.substring(0, 100)}..."`);
    console.log(`[MIRACLE] 📝 Contexto: ${answers.length} respostas coletadas`);

    if (!idea || idea.length < 30) {
      return new Response(
        JSON.stringify({ error: "Ideia deve ter pelo menos 30 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar limite
    const { data: limitCheck, error: limitError } = await supabase.rpc(
      "check_ai_solution_limit",
      { p_user_id: userId }
    );

    if (limitError || !limitCheck.can_generate) {
      return new Response(
        JSON.stringify({ error: "Limite mensal atingido" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar ferramentas COM logos
    const { data: tools } = await supabase
      .from("tools")
      .select("id, name, category, official_url, logo_url")
      .eq("status", true);

    const toolsContext = tools
      ? tools.map((t) => `- ${t.name} (${t.category}) | Logo: ${t.logo_url || 'N/A'}`).join("\n")
      : "Nenhuma ferramenta disponível";

    // Construir contexto adicional das perguntas
    let contextFromAnswers = "";
    if (answers.length > 0) {
      contextFromAnswers = "\n\nCONTEXTO ADICIONAL COLETADO:\n";
      answers.forEach((qa, idx) => {
        contextFromAnswers += `${idx + 1}. ${qa.question}\nR: ${qa.answer}\n\n`;
      });
    }

    const systemPrompt = `Você é o Rafael Milagre - especialista em IA, automação e soluções práticas.

DNA RAFAEL MILAGRE:
- Inteligência Conectiva: Conecta técnica + negócio + lógica como sistema único
- Didatismo Extremo: Traduz complexo → simples, sem jargões
- 100% Aplicável: Não é teoria - é EXECUÇÃO pura
- Anti-hype, anti-guru, anti-buzzword
- Mostra COMO fazer, não só o QUE fazer

SEU TOM:
- "Vou te mostrar como fazer isso NA PRÁTICA, sem enrolação"
- "Esqueça teoria, vamos direto ao que FUNCIONA"
- "Aqui está o passo a passo REAL, não o ideal"

FERRAMENTAS DISPONÍVEIS:
${toolsContext}

OBJETIVO:
Criar um plano ULTRA-ESPECÍFICO, EXECUTÁVEL e MENSURÁVEL.

ESTRUTURA DA RESPOSTA:

{
  "short_description": "3-5 frases TÉCNICAS e OBJETIVAS: 1) O QUE é a solução (arquitetura, componentes), 2) COMO funciona (fluxo técnico, integrações), 3) RESULTADO MENSURÁVEL (métricas, %, ROI). TOM: técnico, direto. EVITE: 'Vou te mostrar', 'Vamos criar'. USE: 'Sistema de X integrado com Y', 'Pipeline automatizado de Z', 'Reduz A em B%'",
  
  "architecture_flowchart": {
    "mermaid_code": "Código Mermaid (formato 'graph TD' ou 'graph LR') representando TODO o fluxo técnico da solução. EXEMPLO para WhatsApp + IA:\n\ngraph TD\n  A[Lead envia WhatsApp] -->|Mensagem| B(API Meta)\n  B -->|Webhook| C{Make Automation}\n  C -->|Texto| D[GPT-4 Qualifica]\n  D -->|Lead Bom| E[(CRM - Hot Lead)]\n  D -->|Lead Frio| F[(CRM - Descarte)]\n  E --> G[Notifica Vendedor]\n  style D fill:#3b82f6\n  style E fill:#10b981\n  style F fill:#ef4444\n\nUSE setas, decisões (chaves {}), bancos (parênteses [()]), processos (retângulos). Seja TÉCNICO e COMPLETO.",
    "description": "1-2 frases explicando o que o fluxo mostra de ponta a ponta"
  },
  
  "mind_map": {
    "central_idea": "Ideia principal em uma frase impactante",
    "branches": [
      {
        "name": "FASE 1: Preparação (Semana 1)",
        "children": ["Item específico 1", "Item específico 2", ...]
      },
      {
        "name": "FASE 2: Implementação (Semanas 2-3)",
        "children": ["Item específico 1", "Item específico 2", ...]
      },
      {
        "name": "FASE 3: Otimização (Semana 4)",
        "children": ["Item específico 1", "Item específico 2", ...]
      },
      {
        "name": "FASE 4: Escala (Semana 5+)",
        "children": ["Item específico 1", "Item específico 2", ...]
      }
    ]
  },
  
  "framework_quadrants": {
    "quadrant1_automation": {
      "title": "🤖 Automação",
      "description": "Como automatizar processos específicos, com triggers, ações e resultados mensuráveis.",
      "items": ["Automação 1: quando X acontece, sistema faz Y, economizando Z horas/semana", ...],
      "tool_names": ["Make", "Zapier"],
      "integration_details": "Como as ferramentas se conectam: APIs, autenticação, webhooks, frequência."
    },
    "quadrant2_ai": {
      "title": "🧠 IA",
      "description": "Como usar IA: modelo, prompt, custo estimado, caso de uso detalhado.",
      "items": ["Modelo X para Y: prompt específico, temperatura Z, custo $W/1000 requisições", ...],
      "tool_names": ["ChatGPT", "Gemini"],
      "ai_strategy": "Qual modelo usar e por quê, como treinar, como validar, estratégia de fallback."
    },
    "quadrant3_data": {
      "title": "📊 Dados",
      "description": "Arquitetura de dados: schemas, relacionamentos, estratégias de backup e segurança.",
      "items": ["Database X: tabelas [nomes], campos [tipos], índices, backup diário", ...],
      "tool_names": ["Supabase", "Airtable"],
      "data_architecture": "Fluxo completo de dados, schemas SQL, relacionamentos, volume estimado."
    },
    "quadrant4_interface": {
      "title": "🎨 Interface",
      "description": "Como usuário interage: jornada, pontos de contato, feedback visual.",
      "items": ["Dashboard web: componentes X, Y, Z, visualizações em tempo real de [métricas]", ...],
      "tool_names": ["Lovable", "WhatsApp API"],
      "ux_considerations": "Jornada do usuário passo-a-passo, pontos de atenção, tratamento de erros."
    }
  },
  
  "required_tools": {
    "essential": [
      {
        "name": "Nome EXATO da ferramenta (copie da lista de ferramentas disponíveis acima)",
        "category": "Categoria",
        "reason": "Por que é essencial (4-6 frases): qual problema resolve, por que alternativas não funcionam tão bem, ROI esperado.",
        "setup_complexity": "easy/medium/hard",
        "setup_steps": "Passos específicos de configuração",
        "cost_estimate": "Estimativa mensal USD com breakdown",
        "logo_url": "URL da logo (COPIE EXATAMENTE da lista de ferramentas disponíveis acima. Se a ferramenta não tiver logo na lista, use https://logo.clearbit.com/[dominio].com)",
        "alternatives": ["Alt 1 (pros/cons)", "Alt 2 (pros/cons)"]
      }
    ],
    "optional": [
      {
        "name": "Nome EXATO (copie da lista de ferramentas)",
        "category": "Categoria",
        "reason": "Por que PODE ser útil (3-4 frases)",
        "when_to_use": "Cenário específico (ex: quando >1000 usuários)",
        "cost_estimate": "USD/mês",
        "logo_url": "URL da logo (COPIE da lista de ferramentas disponíveis ou use https://logo.clearbit.com/[dominio].com)"
      }
    ]
  },
  
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "Título claro do passo",
      "description": "Descrição ULTRA-DETALHADA (5-8 frases): o que fazer EXATAMENTE, onde acessar, comandos exatos, URLs.",
      "estimated_time": "2 horas",
      "difficulty": "easy/medium/hard",
      "dependencies": [],
      "validation_criteria": "Como saber se foi concluído (3-4 critérios testáveis)",
      "common_pitfalls": "3-5 erros comuns e como evitar",
      "resources": ["URL tutorial", "URL docs"]
    }
  ]
}

REGRAS RAFAEL MILAGRE:
✓ Seja ULTRA-ESPECÍFICO (não "configurar API", mas "acesse console.x.com, clique em Settings...")
✓ Checklist: MÍNIMO 12 steps, MÁXIMO 25
✓ Cada step = mini-tutorial (5-8 frases)
✓ Métricas mensuráveis: não "melhora eficiência", mas "reduz de 2h para 15min (87.5%)"
✓ Ferramentas: 10-18 total (essential + optional)
✓ Priorize ferramentas do banco e SEMPRE inclua os logo_url fornecidos:
${toolsContext}
✓ CRÍTICO: Para cada ferramenta em required_tools, COPIE o logo_url exato da lista acima
✓ Evite buzzwords: "revolucionário", "disruptivo" → fale RESULTADO REAL
✓ Sem promessas impossíveis: "automatize 100% do negócio" → seja realista
✓ Passos genéricos → passos executáveis
✓ SEMPRE gere o architecture_flowchart com código Mermaid completo e funcional`;

    const userPrompt = `IDEIA INICIAL:
"${idea}"
${contextFromAnswers}

Crie um plano completo seguindo o formato JSON especificado.`;

    console.log(`[MIRACLE] 🚀 Chamando Lovable AI (Gemini 2.5 Flash)...`);

    const lovableAIUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableAIKey = Deno.env.get("LOVABLE_API_KEY");

    const aiCallStart = Date.now();

    // TOOL CALLING para FORÇAR JSON válido e completo
    const toolDefinition = {
      type: "function",
      function: {
        name: "create_solution_plan",
        description: "Criar plano detalhado de implementação de solução com IA",
        parameters: {
          type: "object",
          properties: {
            short_description: { type: "string", description: "Descrição em 3-5 frases" },
            mind_map: {
              type: "object",
              properties: {
                central_idea: { type: "string" },
                branches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      children: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "children"]
                  }
                }
              },
              required: ["central_idea", "branches"]
            },
            framework_quadrants: {
              type: "object",
              properties: {
                quadrant1_automation: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    items: { type: "array", items: { type: "string" } },
                    tool_names: { type: "array", items: { type: "string" } },
                    integration_details: { type: "string" }
                  }
                },
                quadrant2_ai: { type: "object" },
                quadrant3_data: { type: "object" },
                quadrant4_interface: { type: "object" }
              }
            },
            required_tools: {
              type: "object",
              properties: {
                essential: { type: "array" },
                optional: { type: "array" }
              }
            },
            architecture_flowchart: {
              type: "object",
              properties: {
                mermaid_code: { type: "string", description: "Código Mermaid completo do fluxograma" },
                description: { type: "string", description: "Descrição do fluxograma em 1-2 frases" }
              },
              required: ["mermaid_code", "description"]
            },
            implementation_checklist: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: { type: "integer" },
                  title: { type: "string" },
                  description: { type: "string" },
                  estimated_time: { type: "string" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  dependencies: { type: "array", items: { type: "integer" } },
                  validation_criteria: { type: "string" },
                  common_pitfalls: { type: "string" },
                  resources: { type: "array", items: { type: "string" } }
                },
                required: ["step_number", "title", "description"]
              }
            }
          },
          required: ["short_description", "mind_map", "framework_quadrants", "required_tools", "implementation_checklist", "architecture_flowchart"]
        }
      }
    };

    // Call Lovable AI (Gemini 2.5 Flash com JSON mode)
    const aiResponse = await fetch(lovableAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableAIKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + '\n\nIMPORTANTE: Sua resposta DEVE ser um JSON válido e completo seguindo exatamente o schema fornecido. Não deixe campos vazios ou incompletos.' },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 128000,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(180000),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Erro na API: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiResponseTime = Date.now() - aiCallStart;

    console.log(`[MIRACLE] ⚡ Tempo de resposta: ${(aiResponseTime / 1000).toFixed(1)}s`);
    console.log(`[MIRACLE] 📊 Tokens: ${aiData.usage?.total_tokens || 'N/A'}`);

    // Extrair dados do message content
    const message = aiData.choices?.[0]?.message;
    if (!message || !message.content) {
      console.error("[MIRACLE] ❌ Resposta não contém content");
      throw new Error("Resposta inválida da IA");
    }

    let solutionData;
    try {
      solutionData = JSON.parse(message.content);
    } catch (parseError) {
      console.error("[MIRACLE] ❌ Erro ao fazer parse do JSON:", parseError);
      throw new Error("JSON inválido na resposta");
    }

    console.log(`[MIRACLE] ✅ JSON válido extraído com JSON mode`);
    console.log(`[MIRACLE] ✓ Checklist: ${solutionData.implementation_checklist?.length || 0} steps`);

    // Salvar no banco
    const generationTime = Date.now() - startTime;

    const { data: savedSolution, error: saveError } = await supabase
      .from("ai_generated_solutions")
      .insert({
        user_id: userId,
        original_idea: idea,
        short_description: solutionData.short_description,
        mind_map: solutionData.mind_map,
        required_tools: solutionData.required_tools,
            framework_mapping: solutionData.framework_quadrants,
            implementation_checklist: solutionData.implementation_checklist,
            architecture_flowchart: solutionData.architecture_flowchart || null, // Validar
            generation_model: "google/gemini-2.5-flash",
            generation_time_ms: generationTime,
          })
          .select()
          .single();

      if (saveError) {
        console.error("[MIRACLE] ❌ Erro ao salvar:", saveError);
        throw new Error("Erro ao salvar solução");
      }

      // VALIDAR se architecture_flowchart foi gerado
      if (!savedSolution.architecture_flowchart || !savedSolution.architecture_flowchart.mermaid_code) {
        console.warn("[MIRACLE] ⚠️ WARNING: architecture_flowchart não foi gerado pela IA!");
      } else {
        console.log("[MIRACLE] ✅ architecture_flowchart gerado com sucesso");
      }

    // Incrementar contador
    await supabase.rpc("increment_ai_solution_usage", { p_user_id: userId });

    console.log(`[MIRACLE] ✅ === GERAÇÃO CONCLUÍDA ===`);
    console.log(`[MIRACLE] ⏱️ Tempo total: ${(generationTime / 1000).toFixed(1)}s`);
    console.log(`[MIRACLE] 💾 Solution ID: ${savedSolution.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        solution: savedSolution,
        generation_time_ms: generationTime,
        tokens_used: aiData.usage?.total_tokens,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[MIRACLE] ❌ Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
