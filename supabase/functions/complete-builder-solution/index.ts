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

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const { solutionId } = await req.json();

    if (!solutionId) {
      return new Response(
        JSON.stringify({ error: "Solution ID é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[COMPLETE-BUILDER][${requestId}] 🚀 Iniciando completamento da solução ${solutionId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar solução existente
    const { data: solution, error: fetchError } = await supabase
      .from("ai_generated_solutions")
      .select("*")
      .eq("id", solutionId)
      .single();

    if (fetchError || !solution) {
      return new Response(
        JSON.stringify({ error: "Solução não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se já está completa
    if (solution.is_complete) {
      console.log(`[COMPLETE-BUILDER][${requestId}] ✅ Solução já completa, retornando...`);
      return new Response(
        JSON.stringify({
          success: true,
          solution,
          already_complete: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[COMPLETE-BUILDER][${requestId}] 💡 Ideia: "${solution.original_idea?.substring(0, 80)}..."`);
    console.log(`[COMPLETE-BUILDER][${requestId}] 🔄 Completando detalhes...`);

    const lovableAIKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableAIKey) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Buscar ferramentas com logos
    const { data: tools } = await supabase
      .from("tools")
      .select("id, name, category, official_url, logo_url")
      .eq("status", true);

    const toolsContext = tools
      ? tools.map((t) => `- ${t.name} (${t.category}) | Logo: ${t.logo_url || 'N/A'}`).join("\n")
      : "Nenhuma ferramenta disponível";

    const systemPrompt = `Você é o Rafael Milagre - especialista em IA, automação e soluções práticas.

Complete os DETALHES TÉCNICOS de uma solução já iniciada.

FERRAMENTAS DISPONÍVEIS:
${toolsContext}

Você receberá:
- Título da solução
- Descrição curta
- Framework de implementação (4 quadrantes)

Sua missão: gerar os DETALHES COMPLETOS seguindo o formato JSON.

IMPORTANTE: Retorne APENAS JSON válido, sem markdown ou texto adicional.

ESTRUTURA OBRIGATÓRIA:
{
  "required_tools": {
    "essential": [
      {
        "name": "Nome EXATO da ferramenta da lista",
        "category": "Categoria",
        "reason": "Por que é essencial (4-6 frases)",
        "setup_complexity": "easy|medium|hard",
        "setup_steps": "Passos específicos",
        "cost_estimate": "Estimativa USD/mês",
        "logo_url": "COPIE da lista de ferramentas",
        "alternatives": ["Alt 1", "Alt 2"]
      }
    ],
    "optional": [
      {
        "name": "Nome da ferramenta",
        "category": "Categoria",
        "reason": "Por que pode ser útil",
        "when_to_use": "Cenário específico",
        "cost_estimate": "USD/mês",
        "logo_url": "URL da logo"
      }
    ]
  },
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "Título do passo",
      "description": "Descrição ULTRA-DETALHADA (5-8 frases)",
      "estimated_time": "2 horas",
      "difficulty": "easy|medium|hard",
      "dependencies": [],
      "validation_criteria": "Como validar (3-4 critérios)",
      "common_pitfalls": "Erros comuns e soluções",
      "resources": ["URL1", "URL2"]
    }
  ],
  "architecture_flowchart": {
    "mermaid_code": "graph TD\\n  A[Node] --> B[Node]",
    "description": "Descrição do fluxo"
  },
  "data_flow_diagram": {
    "mermaid_code": "flowchart LR\\n  A --> B",
    "description": "Descrição do fluxo de dados"
  },
  "user_journey_map": {
    "mermaid_code": "journey\\n  title Jornada\\n  section Inicio\\n    Acao: 5: Usuario",
    "description": "Descrição da jornada"
  },
  "technical_stack_diagram": {
    "mermaid_code": "graph TB\\n  A[Tech]",
    "description": "Descrição da stack"
  },
  "mind_map": {
    "central_idea": "Ideia central",
    "branches": [
      {
        "name": "FASE 1: Nome",
        "children": ["Item 1", "Item 2"]
      }
    ]
  }
}

REGRAS:
- 10-18 ferramentas total (essential + optional)
- 12-25 passos no checklist
- Todos os 4 diagramas Mermaid válidos
- Mind map com 4 fases
- SEMPRE incluir Lovable.dev se a solução envolver web app`;

    const userPrompt = `SOLUÇÃO EXISTENTE:

Título: ${solution.title}

Descrição: ${solution.short_description}

Framework: ${JSON.stringify(solution.framework_mapping, null, 2)}

Ideia Original: ${solution.original_idea}

Complete os detalhes técnicos agora!`;

    console.log(`[COMPLETE-BUILDER][${requestId}] 🤖 Chamando Lovable AI...`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        temperature: 0.7,
        max_tokens: 96000,
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(180000),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Erro na API: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const message = aiData.choices?.[0]?.message;
    
    if (!message || !message.content) {
      throw new Error("Resposta inválida da IA");
    }

    const completionData = JSON.parse(message.content);

    console.log(`[COMPLETE-BUILDER][${requestId}] ✅ Detalhes gerados com sucesso`);

    // Atualizar solução no banco
    const { error: updateError } = await supabase
      .from("ai_generated_solutions")
      .update({
        required_tools: completionData.required_tools,
        implementation_checklist: completionData.implementation_checklist,
        architecture_flowchart: completionData.architecture_flowchart,
        data_flow_diagram: completionData.data_flow_diagram,
        user_journey_map: completionData.user_journey_map,
        technical_stack_diagram: completionData.technical_stack_diagram,
        mind_map: completionData.mind_map,
        is_complete: true,
      })
      .eq("id", solutionId);

    if (updateError) {
      throw new Error("Erro ao atualizar solução");
    }

    const completionTime = Date.now() - startTime;
    console.log(`[COMPLETE-BUILDER][${requestId}] ✅ Completamento finalizado em ${(completionTime / 1000).toFixed(1)}s`);

    // Buscar solução atualizada
    const { data: updatedSolution } = await supabase
      .from("ai_generated_solutions")
      .select("*")
      .eq("id", solutionId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        solution: updatedSolution,
        completion_time_ms: completionTime,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[COMPLETE-BUILDER][${requestId}] ❌ Erro:`, error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Erro ao completar solução",
        code: "COMPLETION_FAILED",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
