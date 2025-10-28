import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 🎯 MATCHING INTELIGENTE DE FERRAMENTAS
const normalizeName = (name: string): string => 
  name.toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove (parênteses)
    .replace(/[^\w\s.-]/g, '') // Remove caracteres especiais
    .trim();

const findToolByName = (searchName: string, platformTools: any[]): any | null => {
  const normalized = normalizeName(searchName);
  
  // 🎯 PRIORIDADE 1: Match exato completo
  const exactMatch = platformTools.find(t => 
    normalizeName(t.name) === normalized
  );
  if (exactMatch) {
    console.log(`✅ Match exato: "${searchName}" → "${exactMatch.name}"`);
    return exactMatch;
  }
  
  // 🎯 PRIORIDADE 2: Match com alias comuns
  const aliases: Record<string, string[]> = {
    'make': ['make.com', 'integromat'],
    'chatgpt': ['openai', 'gpt'],
    'zapier': ['zapier.com'],
    'notion': ['notion.so'],
    'airtable': ['airtable.com'],
    'google sheets': ['sheets', 'google planilhas'],
    'whatsapp': ['whatsapp business', 'wa'],
    'claude': ['anthropic', 'claude ai'],
    'gemini': ['google gemini', 'bard'],
  };
  
  for (const [canonical, aliasList] of Object.entries(aliases)) {
    if (normalized.includes(canonical) || aliasList.some(a => normalized.includes(a))) {
      const aliasMatch = platformTools.find(t => {
        const toolNorm = normalizeName(t.name);
        return toolNorm.includes(canonical) || aliasList.some(a => toolNorm.includes(a));
      });
      if (aliasMatch) {
        console.log(`✅ Match por alias: "${searchName}" → "${aliasMatch.name}"`);
        return aliasMatch;
      }
    }
  }
  
  // 🎯 PRIORIDADE 3: Match parcial (ex: "Make" → "Make.com")
  const partialMatch = platformTools.find(t => {
    const toolNormalized = normalizeName(t.name);
    return toolNormalized.includes(normalized) || normalized.includes(toolNormalized);
  });
  
  if (partialMatch) {
    console.log(`⚠️ Match parcial: "${searchName}" → "${partialMatch.name}"`);
    return partialMatch;
  }
  
  // 🎯 PRIORIDADE 4: Match por palavra-chave significativa
  const nameWords = normalized.split(/[\s.]+/).filter(w => w.length > 3);
  
  if (nameWords.length > 0) {
    const keywordMatch = platformTools.find(t => {
      const toolNormalized = normalizeName(t.name);
      const toolWords = toolNormalized.split(/[\s.]+/).filter(w => w.length > 3);
      
      // Pelo menos 1 palavra deve coincidir exatamente
      return nameWords.some(nw => toolWords.includes(nw));
    });
    
    if (keywordMatch) {
      console.log(`⚠️ Match por palavra-chave: "${searchName}" → "${keywordMatch.name}"`);
      return keywordMatch;
    }
  }
  
  console.warn(`❌ Nenhum match encontrado para: "${searchName}"`);
  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { solutionId } = await req.json();

    if (!solutionId) {
      return new Response(
        JSON.stringify({ error: "solutionId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[POPULATE-TOOLS] 🚀 Iniciando para solução ${solutionId}`);

    // 🔍 FASE 1: Buscar required_tools da solução
    const { data: solution, error: solutionError } = await supabase
      .from("ai_generated_solutions")
      .select("required_tools, user_id")
      .eq("id", solutionId)
      .single();

    if (solutionError || !solution) {
      console.error("[POPULATE-TOOLS] ❌ Solução não encontrada:", solutionError);
      return new Response(
        JSON.stringify({ error: "Solução não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!solution.required_tools) {
      console.log("[POPULATE-TOOLS] ⚠️ Nenhuma ferramenta no required_tools");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Nenhuma ferramenta para processar",
          matched: 0,
          unmatched: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 🔍 FASE 2: Buscar TODAS ferramentas ativas da plataforma (1 query única)
    const { data: platformTools, error: toolsError } = await supabase
      .from("tools")
      .select("*")
      .eq("status", true);

    if (toolsError) {
      console.error("[POPULATE-TOOLS] ❌ Erro ao buscar ferramentas:", toolsError);
      throw toolsError;
    }

    console.log(`[POPULATE-TOOLS] 📊 ${platformTools?.length || 0} ferramentas ativas na plataforma`);

    // 🎯 FASE 3: Processar ferramentas essenciais e opcionais
    const toolsToInsert: any[] = [];
    const unmatchedTools: string[] = [];
    let orderIndex = 0;

    const processTools = (toolsList: any[], isRequired: boolean) => {
      if (!toolsList || !Array.isArray(toolsList)) return;

      for (const jsonTool of toolsList) {
        const toolName = jsonTool.name || jsonTool;
        
        if (typeof toolName !== 'string') {
          console.warn('[POPULATE-TOOLS] ⚠️ Nome de ferramenta inválido:', jsonTool);
          continue;
        }

        const platformTool = findToolByName(toolName, platformTools || []);

        if (platformTool) {
          toolsToInsert.push({
            solution_id: solutionId,
            tool_id: platformTool.id,
            tool_name: platformTool.name,
            tool_url: platformTool.official_url,
            is_required: isRequired,
            order_index: orderIndex++
          });
        } else {
          unmatchedTools.push(toolName);
        }
      }
    };

    // Processar essenciais e opcionais
    processTools(solution.required_tools.essential, true);
    processTools(solution.required_tools.optional, false);

    console.log(`[POPULATE-TOOLS] 📊 Resultado do matching:`, {
      matched: toolsToInsert.length,
      unmatched: unmatchedTools.length,
      unmatchedList: unmatchedTools
    });

    // 🗑️ FASE 4: Limpar entradas antigas
    const { error: deleteError } = await supabase
      .from("solution_tools")
      .delete()
      .eq("solution_id", solutionId);

    if (deleteError) {
      console.error("[POPULATE-TOOLS] ❌ Erro ao limpar ferramentas antigas:", deleteError);
      throw deleteError;
    }

    console.log("[POPULATE-TOOLS] 🗑️ Ferramentas antigas removidas");

    // 💾 FASE 5: Inserir novas ferramentas
    if (toolsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("solution_tools")
        .insert(toolsToInsert);

      if (insertError) {
        console.error("[POPULATE-TOOLS] ❌ Erro ao inserir ferramentas:", insertError);
        throw insertError;
      }

      console.log(`[POPULATE-TOOLS] ✅ ${toolsToInsert.length} ferramentas inseridas com sucesso`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        matched: toolsToInsert.length,
        unmatched: unmatchedTools.length,
        unmatchedTools,
        message: `${toolsToInsert.length} ferramentas vinculadas com sucesso`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[POPULATE-TOOLS] ❌ Erro:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro ao processar ferramentas",
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
