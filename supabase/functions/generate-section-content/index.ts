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

    console.log(`[SECTION-GEN] 🚀 Gerando ${sectionType} para solução ${solutionId}`);

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
      console.log(`[SECTION-GEN] ✅ ${sectionType} já existe, retornando cache`);
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

    // Criar prompts específicos para cada tipo
    let systemPrompt = "";
    let model = "google/gemini-2.5-pro";
    let maxTokens = 30000;

    if (sectionType === "framework") {
      systemPrompt = `Você é um arquiteto de soluções especializado em criar frameworks executáveis.

Analise a solução e crie um framework de 4 pilares:
1. Automação No-Code (Lovable, Make, Zapier)
2. Modelos de IA (GPT-5, Claude, Gemini)
3. Dados (Sheets, Airtable, Supabase)
4. Canais (WhatsApp, Email, Web)

Retorne JSON com a estrutura:
{
  "framework_quadrants": {
    "quadrant1_automation": {
      "title": "Automação",
      "description": "...",
      "items": ["..."],
      "tool_names": ["..."],
      "integration_details": "..."
    },
    (repita para quadrant2_ai, quadrant3_data, quadrant4_interface)
  },
  "mind_map": {
    "central_idea": "...",
    "branches": [{"name": "...", "children": ["..."]}]
  }
}

Seja DETALHADO e ESPECÍFICO em cada campo.`;
      maxTokens = 50000;
    } else if (sectionType === "tools") {
      systemPrompt = `Você é especialista em ferramentas SaaS e APIs.

Identifique e detalhe TODAS as ferramentas necessárias:
- Essential: Ferramentas críticas sem as quais a solução não funciona
- Optional: Ferramentas que melhoram mas não são essenciais

Para cada ferramenta, forneça: nome, categoria, razão detalhada (8+ frases), complexidade de setup, passos de configuração, custo estimado, URL do logo, URL oficial, alternativas.

Retorne JSON:
{
  "required_tools": {
    "essential": [...],
    "optional": [...]
  }
}`;
      maxTokens = 30000;
    } else if (sectionType === "checklist") {
      systemPrompt = `Você é um gerente de projetos especializado em criar checklists executáveis.

Crie um checklist COMPLETO com 15-30 steps sequenciais.

Cada step deve incluir:
- step_number, title, description (tipo tutorial com 10+ frases)
- estimated_time, difficulty, dependencies
- validation_criteria (4+ critérios testáveis)
- common_pitfalls (5+ erros comuns)
- resources (URLs de tutoriais/docs)

Organize por fases: Setup, Desenvolvimento, Testes, Deploy.

Retorne JSON:
{
  "implementation_checklist": [...]
}`;
      maxTokens = 40000;
    } else if (sectionType === "architecture") {
      systemPrompt = `Você é arquiteto de sistemas especializado em Mermaid.

Gere 1-3 fluxos visuais diferentes usando código Mermaid:
1. Fluxo de Implementação (graph TD)
2. Fluxo de Dados/APIs (sequenceDiagram)
3. Jornada do Usuário (journey)

REGRAS CRÍTICAS DO MERMAID:
- Use setas com espaços: " --> "
- IDs sem espaços (use underscore)
- Labels entre colchetes
- Máximo 20 nós por diagrama
- Português nos labels

Retorne JSON:
{
  "implementation_flows": {
    "flows": [
      {
        "id": "...",
        "title": "...",
        "description": "...",
        "mermaid_code": "graph TD...",
        "estimated_time": "...",
        "complexity": "..."
      }
    ],
    "total_estimated_time": "...",
    "prerequisites": "..."
  }
}`;
      maxTokens = 20000;
    } else if (sectionType === "lovable") {
      systemPrompt = `Você é tech lead especializado em criar prompts para desenvolvimento.

Gere um PROMPT COMPLETO para o Lovable implementar a solução.

Inclua:
- Contexto do projeto (2-3 parágrafos)
- Stack tecnológica (React, Supabase, etc)
- Schema de banco detalhado
- Funcionalidades core (passo-a-passo)
- Workflows e integrações
- Design e UX
- Autenticação e segurança
- Critérios de aceite

Use formatação Markdown.

Retorne JSON:
{
  "lovable_prompt": "# Título...",
  "complexity": "low/medium/high",
  "estimated_time": "..."
}`;
      maxTokens = 30000;
    }

    const userPrompt = `Analise esta solução e gere o conteúdo solicitado:

IDEIA: ${solution.original_idea}
TÍTULO: ${solution.title}
DESCRIÇÃO: ${solution.short_description || 'Não especificada'}

Retorne APENAS o objeto JSON especificado (sem markdown, sem code blocks).`;

    console.log(`[SECTION-GEN] 🤖 Modelo: ${model}`);
    console.log(`[SECTION-GEN] 📊 Max tokens: ${maxTokens}`);
    console.log(`[SECTION-GEN] 🚀 Chamando Lovable AI...`);

    const aiResponse = await fetch(lovableUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: maxTokens,
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(180000)
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[SECTION-GEN] ❌ Erro na AI: ${aiResponse.status} - ${errorText}`);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit atingido. Aguarde alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Erro na API de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    console.log(`[SECTION-GEN] 📥 Resposta recebida (${content.length} chars)`);

    // Parse do JSON retornado
    let parsedContent;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("[SECTION-GEN] ❌ Erro ao fazer parse:", content.substring(0, 500));
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
      console.error("[SECTION-GEN] ❌ Erro ao atualizar:", updateError);
      throw new Error("Erro ao salvar conteúdo gerado");
    }

    console.log(`[SECTION-GEN] ✅ ${sectionType} gerado e salvo com sucesso!`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cached: false,
        content: parsedContent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[SECTION-GEN] ❌ Erro:", error);
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