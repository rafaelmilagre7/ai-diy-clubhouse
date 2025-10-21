import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface da requisição
interface GenerateRequest {
  idea: string;
  userId: string;
}

// Interface da resposta da IA
interface AISolutionResponse {
  short_description: string;
  mind_map: any;
  framework_quadrants: any;
  required_tools: {
    essential: any[];
    optional: any[];
  };
  implementation_checklist: any[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // 1. Parsear requisição
    const { idea, userId }: GenerateRequest = await req.json();

    console.log(`[BUILDER] Nova requisição de geração para usuário: ${userId}`);

    if (!idea || idea.length < 30) {
      return new Response(
        JSON.stringify({ error: "Ideia deve ter pelo menos 30 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (idea.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Ideia não pode ter mais de 1000 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Verificar limite de uso
    console.log(`[BUILDER] Verificando limite de uso...`);
    const { data: limitCheck, error: limitError } = await supabase.rpc(
      "check_ai_solution_limit",
      { p_user_id: userId }
    );

    if (limitError) {
      console.error("[BUILDER] Erro ao verificar limite:", limitError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar limite de uso" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BUILDER] Limite: ${limitCheck.generations_used}/${limitCheck.monthly_limit}`);

    if (!limitCheck.can_generate) {
      return new Response(
        JSON.stringify({
          error: "Limite mensal atingido",
          details: {
            used: limitCheck.generations_used,
            limit: limitCheck.monthly_limit,
            reset_date: limitCheck.reset_date,
          },
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Buscar ferramentas do banco para contexto
    console.log(`[BUILDER] Buscando ferramentas cadastradas...`);
    const { data: tools, error: toolsError } = await supabase
      .from("tools")
      .select("id, name, category, official_url, logo_url")
      .eq("status", true);

    if (toolsError) {
      console.warn("[BUILDER] Erro ao buscar ferramentas:", toolsError);
    }

    const toolsContext = tools
      ? tools.map((t) => `${t.name} (${t.category})`).join(", ")
      : "Nenhuma ferramenta disponível no banco";

    console.log(`[BUILDER] Ferramentas encontradas: ${tools?.length || 0}`);

    // 5. Montar prompt para IA
    const systemPrompt = `Você é um arquiteto de soluções especializado em IA e automação.
Sua missão é transformar ideias de negócio em planos práticos e executáveis.

**FERRAMENTAS DISPONÍVEIS NO BANCO:**
${toolsContext}

**FORMATO DE RESPOSTA (JSON VÁLIDO):**
{
  "short_description": "Descrição curta em 2 linhas do que será criado",
  "mind_map": {
    "central_idea": "Ideia principal",
    "branches": [
      {
        "name": "Etapa 1: Preparação",
        "children": ["Sub-item 1", "Sub-item 2"]
      },
      {
        "name": "Etapa 2: Implementação",
        "children": ["Sub-item 3", "Sub-item 4"]
      }
    ]
  },
  "framework_quadrants": {
    "quadrant1_automation": {
      "title": "Automação",
      "description": "Ferramentas para automatizar processos",
      "items": ["Zapier conectando WhatsApp com Notion", "Trigger automático de boas-vindas"],
      "tool_names": ["Zapier", "Make"]
    },
    "quadrant2_ai": {
      "title": "IA",
      "description": "Modelos e ferramentas de inteligência artificial",
      "items": ["ChatGPT para responder perguntas", "Gemini para análise de sentimento"],
      "tool_names": ["ChatGPT", "Gemini"]
    },
    "quadrant3_data": {
      "title": "Dados e Contexto",
      "description": "Onde os dados serão armazenados e organizados",
      "items": ["Base de conhecimento no Notion", "Histórico de conversas no Airtable"],
      "tool_names": ["Notion", "Airtable"]
    },
    "quadrant4_interface": {
      "title": "Interface",
      "description": "Como o usuário final irá interagir",
      "items": ["Bot no WhatsApp Business", "Dashboard web com Lovable"],
      "tool_names": ["WhatsApp Business API", "Lovable"]
    }
  },
  "required_tools": {
    "essential": [
      {
        "name": "ChatGPT",
        "category": "IA Conversacional",
        "reason": "Essencial para processar linguagem natural e gerar respostas personalizadas"
      }
    ],
    "optional": [
      {
        "name": "n8n",
        "category": "Automação",
        "reason": "Alternativa open-source para integrações complexas"
      }
    ]
  },
  "implementation_checklist": [
    {
      "step_number": 1,
      "title": "Configurar conta no ChatGPT",
      "description": "Criar conta ChatGPT Plus e gerar API key",
      "estimated_time": "15 minutos",
      "difficulty": "easy"
    },
    {
      "step_number": 2,
      "title": "Estruturar base de conhecimento",
      "description": "Criar documento no Notion com FAQs e informações do negócio",
      "estimated_time": "2 horas",
      "difficulty": "medium"
    }
  ]
}

**REGRAS IMPORTANTES:**
- Use APENAS ferramentas que existem no banco quando possível
- Seja prático e focado em implementação real
- Checklist deve ter de 5 a 10 passos objetivos
- Framework dos 4 quadrantes é OBRIGATÓRIO
- Estimativas de tempo devem ser realistas
- Dificuldade: "easy", "medium" ou "hard"`;

    const userPrompt = `Ideia do usuário: "${idea}"

Por favor, crie um plano completo de implementação seguindo o formato JSON especificado.`;

    // 6. Chamar Lovable AI (Gemini 2.5 Pro)
    console.log(`[BUILDER] Chamando Lovable AI com Gemini 2.5 Pro...`);
    const lovableAIUrl = "https://lovable-ai-api.deno.dev/v1/chat/completions";
    const lovableAIKey = Deno.env.get("LOVABLE_AI_API_KEY");

    const aiResponse = await fetch(lovableAIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableAIKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[BUILDER] Erro na API Lovable AI:", errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar solução com IA" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error("[BUILDER] Resposta da IA vazia");
      return new Response(
        JSON.stringify({ error: "Resposta da IA vazia" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BUILDER] Resposta da IA recebida (${aiContent.length} caracteres)`);

    // 7. Parsear resposta JSON da IA
    let solutionData: AISolutionResponse;
    try {
      // Extrair JSON do conteúdo (caso venha com markdown)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiContent;
      solutionData = JSON.parse(jsonString);
      console.log(`[BUILDER] Resposta da IA parseada com sucesso`);
    } catch (parseError) {
      console.error("[BUILDER] Erro ao parsear resposta da IA:", parseError);
      console.log("[BUILDER] Conteúdo recebido:", aiContent.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Resposta da IA em formato inválido" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Salvar no banco
    console.log(`[BUILDER] Salvando solução no banco...`);
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
        generation_model: "google/gemini-2.5-pro",
        generation_time_ms: generationTime,
      })
      .select()
      .single();

    if (saveError) {
      console.error("[BUILDER] Erro ao salvar solução:", saveError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar solução" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BUILDER] Solução salva com ID: ${savedSolution.id}`);

    // 9. Incrementar contador de uso
    console.log(`[BUILDER] Incrementando contador de uso...`);
    const { error: incrementError } = await supabase.rpc(
      "increment_ai_solution_usage",
      { p_user_id: userId }
    );

    if (incrementError) {
      console.error("[BUILDER] Erro ao incrementar uso:", incrementError);
    }

    // 10. Retornar resposta de sucesso
    console.log(`[BUILDER] Geração concluída em ${generationTime}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        solution: savedSolution,
        generation_time_ms: generationTime,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[BUILDER] Erro geral:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
