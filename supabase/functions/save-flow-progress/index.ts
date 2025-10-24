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

    const { solutionId, userId, flowProgress, userNotes } = await req.json();

    console.log(`[SAVE-FLOW] Salvando progresso para solução ${solutionId}`);

    // Buscar solução para validar permissão
    const { data: solution, error: fetchError } = await supabase
      .from("ai_generated_solutions")
      .select("id")
      .eq("id", solutionId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !solution) {
      return new Response(
        JSON.stringify({ error: "Solução não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Preparar dados de atualização
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (flowProgress !== undefined) {
      updateData.flow_progress = flowProgress;
    }

    if (userNotes !== undefined) {
      updateData.user_notes = userNotes;
    }

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from("ai_generated_solutions")
      .update(updateData)
      .eq("id", solutionId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("[SAVE-FLOW] Erro ao atualizar:", updateError);
      throw new Error("Erro ao salvar progresso");
    }

    console.log("[SAVE-FLOW] ✅ Progresso salvo com sucesso");

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[SAVE-FLOW] Erro:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro ao salvar progresso",
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
