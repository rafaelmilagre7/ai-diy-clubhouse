import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const BATCH_SIZE = 50; // Processar 50 usuários por vez
const DELAY_BETWEEN_BATCHES = 2000; // 2 segundos entre batches

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 [BATCH] Iniciando geração em massa de matches');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Buscar todos os user_ids que têm networking_profiles_v2
    const { data: profiles, error: profilesError } = await supabase
      .from('networking_profiles_v2')
      .select('user_id')
      .order('created_at', { ascending: true });
    
    if (profilesError || !profiles) {
      throw new Error(`Erro ao buscar perfis: ${profilesError?.message}`);
    }
    
    console.log(`📊 [BATCH] ${profiles.length} perfis encontrados para processar`);
    
    const userIds = profiles.map(p => p.user_id);
    const totalBatches = Math.ceil(userIds.length / BATCH_SIZE);
    
    let totalProcessed = 0;
    let totalMatches = 0;
    let totalErrors = 0;
    const errors: any[] = [];
    const startTime = Date.now();
    
    // Processar em batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE, userIds.length);
      const batchUserIds = userIds.slice(batchStart, batchEnd);
      
      console.log(`\n🔄 [BATCH ${batchIndex + 1}/${totalBatches}] Processando usuários ${batchStart + 1}-${batchEnd}`);
      
      // Processar batch em paralelo
      const batchPromises = batchUserIds.map(async (userId) => {
        try {
          const { data, error } = await supabase.functions.invoke('generate-strategic-matches-v2', {
            body: { user_id: userId }
          });
          
          if (error) throw error;
          
          totalProcessed++;
          
          if (data?.matches_generated) {
            totalMatches += data.matches_generated;
          }
          
          return { success: true, userId, matches: data?.matches_generated || 0 };
        } catch (error) {
          totalErrors++;
          errors.push({ userId, error: error.message });
          console.error(`❌ [BATCH] Erro ao processar ${userId}:`, error.message);
          return { success: false, userId, error: error.message };
        }
      });
      
      await Promise.all(batchPromises);
      
      console.log(`✅ [BATCH ${batchIndex + 1}/${totalBatches}] Batch concluído`);
      console.log(`   - Processados neste batch: ${batchUserIds.length}`);
      console.log(`   - Total processado até agora: ${totalProcessed}/${userIds.length}`);
      console.log(`   - Matches gerados até agora: ${totalMatches}`);
      console.log(`   - Erros até agora: ${totalErrors}`);
      
      // Delay entre batches para não sobrecarregar
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
    
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    
    const result = {
      success: true,
      statistics: {
        total_profiles: userIds.length,
        total_processed: totalProcessed,
        total_matches_generated: totalMatches,
        total_errors: totalErrors,
        processing_time_seconds: totalTime,
        avg_matches_per_user: Math.round(totalMatches / totalProcessed * 100) / 100
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Retornar só os primeiros 10 erros
    };
    
    console.log('\n✅ [BATCH] Processamento completo:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('❌ [BATCH ERROR]', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erro ao processar batch de matches"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
