import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  solutionId: z.string().uuid("ID de solução inválido"),
  sectionType: z.enum(["framework", "tools", "checklist", "architecture", "lovable"]),
  userId: z.string().uuid("ID de usuário inválido")
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { solutionId, sectionType, userId } = RequestSchema.parse(body);

    console.log(`[SECTION-GEN] Gerando ${sectionType} para solução ${solutionId}`);

    // Buscar solução e verificar permissão
    const { data: solution, error: fetchError } = await supabase
      .from("ai_generated_solutions")
      .select("*")
      .eq("id", solutionId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !solution) {
      return new Response(
        JSON.stringify({ error: "Solução não encontrada ou sem permissão" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mapear tipo de seção para campos do banco
    const fieldMapping: Record<string, string[]> = {
      framework: ["framework_mapping", "mind_map"],
      tools: ["required_tools"],
      checklist: ["implementation_checklist"],
      architecture: ["implementation_flows"],
      lovable: ["lovable_prompt"]
    };

    const fieldsToGenerate = fieldMapping[sectionType];
    const primaryField = fieldsToGenerate[0];

    // Verificar se já existe (cache)
    if (solution[primaryField]) {
      console.log(`[SECTION-GEN] ${sectionType} já existe, retornando cache`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          cached: true,
          content: solution[primaryField] 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar conteúdo via Lovable AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const lovableUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";

    const prompts: Record<string, string> = {
      framework: `Analise esta ideia e gere APENAS o framework_quadrants (4 quadrantes) no formato JSON:

IDEIA: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description}"

Retorne APENAS um objeto JSON puro com a estrutura:
{
  "framework_quadrants": {
    "quadrant1_automation": {
      "title": "🤖 Automação",
      "description": "...",
      "items": ["...", "..."],
      "tool_names": ["..."],
      "integration_details": "..."
    },
    "quadrant2_ai": {
      "title": "🧠 IA",
      "description": "...",
      "items": ["...", "..."],
      "tool_names": ["..."],
      "ai_strategy": "..."
    },
    "quadrant3_data": {
      "title": "📊 Dados",
      "description": "...",
      "items": ["...", "..."],
      "tool_names": ["..."],
      "data_architecture": "..."
    },
    "quadrant4_interface": {
      "title": "🎨 Interface",
      "description": "...",
      "items": ["...", "..."],
      "tool_names": ["..."],
      "ux_considerations": "..."
    }
  },
  "mind_map": {
    "central_idea": "...",
    "branches": [
      {
        "name": "FASE 1: ...",
        "children": ["...", "..."]
      }
    ]
  }
}`,
      
      tools: `Analise esta solução e gere APENAS a lista de ferramentas necessárias no formato JSON:

IDEIA: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description}"

Retorne APENAS um objeto JSON puro:
{
  "required_tools": {
    "essential": [
      {
        "name": "Nome da ferramenta",
        "category": "Categoria",
        "reason": "Por que é essencial (4-6 frases)",
        "setup_complexity": "easy/medium/hard",
        "setup_steps": "Passos específicos",
        "cost_estimate": "USD/mês",
        "logo_url": "https://logo.clearbit.com/[dominio].com",
        "alternatives": ["Alt 1", "Alt 2"]
      }
    ],
    "optional": [...]
  }
}`,
      
      checklist: `Analise esta solução e gere APENAS o checklist de implementação no formato JSON:

IDEIA: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description}"

Retorne APENAS um array JSON:
{
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "...",
      "description": "Descrição ULTRA-DETALHADA (5-8 frases)",
      "estimated_time": "2 horas",
      "difficulty": "easy/medium/hard",
      "dependencies": [],
      "validation_criteria": "Como saber se foi concluído",
      "common_pitfalls": "3-5 erros comuns",
      "resources": ["URL tutorial"]
    }
  ]
}`,
      
      architecture: `Analise esta solução e gere 1-3 fluxos visuais de implementação usando CÓDIGO MERMAID.

IDEIA: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description}"

INSTRUÇÕES:
- Gere entre 1 a 3 fluxos dependendo da complexidade da solução
- Use diferentes tipos de diagramas Mermaid (flowchart, sequence, journey, stateDiagram)
- Cada fluxo deve ter MÁXIMO 15-20 nós/etapas para manter legibilidade
- Use português brasileiro nos labels
- Seja específico e prático, não genérico

TIPOS DE DIAGRAMAS SUGERIDOS:
1. **Fluxo de Implementação Principal** (graph TD)
   - Etapas principais do início ao deploy
   - Decisões críticas
   - Integrações necessárias

2. **Fluxo de Dados/APIs** (sequenceDiagram ou graph LR)
   - Como dados fluem entre sistemas
   - Integrações de APIs
   - Automações

3. **Jornada do Usuário** (journey)
   - Como usuário interage com a solução
   - Pontos de contato
   - Experiência fim-a-fim

EXEMPLO DE FORMATO:
{
  "implementation_flows": {
    "flows": [
      {
        "id": "main_implementation",
        "title": "Fluxo Principal de Implementação",
        "description": "Passo a passo completo desde configuração até deploy",
        "mermaid_code": "graph TD\\n    Start[Início] --> Config[Configurar Ambiente]\\n    Config --> DB[Setup Database]\\n    DB --> API[Integrar APIs]\\n    API --> Test[Testar]\\n    Test --> Deploy[Deploy]",
        "estimated_time": "8-12 horas",
        "complexity": "medium"
      },
      {
        "id": "data_flow",
        "title": "Fluxo de Dados e Integrações",
        "description": "Como os dados circulam entre os sistemas",
        "mermaid_code": "sequenceDiagram\\n    User->>App: Envia dados\\n    App->>API: Processa\\n    API->>DB: Armazena\\n    DB-->>User: Resposta",
        "estimated_time": "3-5 horas",
        "complexity": "low"
      }
    ],
    "total_estimated_time": "11-17 horas",
    "prerequisites": "Conta no Make/Zapier, conhecimento básico de APIs, acesso ao Airtable/Notion"
  }
}

REGRAS DO CÓDIGO MERMAID:
- Use \\n para quebras de linha
- IDs sem espaços (use underscores)
- Labels entre colchetes []
- Para flowchart: use --> para conexões
- Para sequence: use ->> para mensagens
- Mantenha SIMPLES e LEGÍVEL

Retorne APENAS o JSON acima.`,
      
      lovable: `Gere um prompt Lovable completo e profissional para esta solução:

IDEIA: "${solution.original_idea}"
TÍTULO: "${solution.title}"
DESCRIÇÃO: "${solution.short_description}"

Retorne APENAS um objeto JSON:
{
  "lovable_prompt": "# 🎯 CONTEXTO DO PROJETO\\n\\n[2-3 parágrafos]\\n\\n# 📋 ESPECIFICAÇÃO TÉCNICA\\n\\n## Stack Tecnológica\\n- Frontend: ...\\n- Backend: ...\\n\\n## Funcionalidades Core\\n1. **Feature 1**: ...\\n\\n# 🔄 WORKFLOWS\\n...",
  "complexity": "low/medium/high",
  "estimated_time": "..."
}` 
    };

    const systemPrompt = prompts[sectionType];

    console.log(`[SECTION-GEN] Chamando Lovable AI para ${sectionType}...`);

    const aiResponse = await fetch(lovableUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um assistente que retorna APENAS JSON válido, sem markdown, sem explicações." },
          { role: "user", content: systemPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000
      }),
      signal: AbortSignal.timeout(60000)
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[SECTION-GEN] Erro na AI: ${aiResponse.status} - ${errorText}`);
      throw new Error(`Erro na API de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse do JSON retornado
    let parsedContent;
    try {
      // Remover markdown se houver
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("[SECTION-GEN] Erro ao fazer parse:", content);
      throw new Error("JSON inválido retornado pela IA");
    }

    // Preparar update baseado no tipo de seção
    const updateData: Record<string, any> = {};
    
    if (sectionType === "framework") {
      updateData.framework_mapping = parsedContent.framework_quadrants;
      updateData.mind_map = parsedContent.mind_map;
    } else if (sectionType === "tools") {
      updateData.required_tools = parsedContent.required_tools;
    } else if (sectionType === "checklist") {
      updateData.implementation_checklist = parsedContent.implementation_checklist;
    } else if (sectionType === "architecture") {
      updateData.implementation_flows = parsedContent.implementation_flows;
    } else if (sectionType === "lovable") {
      updateData.lovable_prompt = parsedContent.lovable_prompt;
    }

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from("ai_generated_solutions")
      .update(updateData)
      .eq("id", solutionId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("[SECTION-GEN] Erro ao atualizar:", updateError);
      throw new Error("Erro ao salvar conteúdo gerado");
    }

    console.log(`[SECTION-GEN] ✅ ${sectionType} gerado e salvo com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cached: false,
        content: parsedContent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[SECTION-GEN] Erro:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro ao gerar conteúdo",
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
