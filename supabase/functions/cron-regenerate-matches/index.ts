import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const REGENERATION_INTERVAL_DAYS = 7;
const BATCH_SIZE = 100; // Processar 100 por vez no cron

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 [CRON] Iniciando regeneração semanal de matches');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Buscar perfis que não regeneraram há 7+ dias
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - REGENERATION_INTERVAL_DAYS);
    
    const { data: profilesToRegenerate, error: profilesError } = await supabase
      .from('networking_profiles_v2')
      .select('user_id')
      .or(`last_match_generation.is.null,last_match_generation.lt.${cutoffDate.toISOString()}`)
      .limit(BATCH_SIZE);
    
    if (profilesError) {
      throw new Error(`Erro ao buscar perfis: ${profilesError.message}`);
    }
    
    if (!profilesToRegenerate || profilesToRegenerate.length === 0) {
      console.log('✅ [CRON] Nenhum perfil precisa de regeneração');
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum perfil precisa de regeneração no momento',
        profiles_checked: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log(`📊 [CRON] ${profilesToRegenerate.length} perfis para regenerar`);
    
    let totalProcessed = 0;
    let totalMatches = 0;
    let totalErrors = 0;
    
    // Processar em paralelo
    const promises = profilesToRegenerate.map(async (profile) => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-strategic-matches-v2', {
          body: { user_id: profile.user_id }
        });
        
        if (error) throw error;
        
        totalProcessed++;
        if (data?.matches_generated) {
          totalMatches += data.matches_generated;
        }
        
        // Criar notificação para o usuário
        await supabase
          .from('connection_notifications')
          .insert({
            user_id: profile.user_id,
            sender_id: profile.user_id, // Self-notification
            type: 'matches_updated',
            is_read: false
          })
          .select()
          .single();
        
        return { success: true, userId: profile.user_id };
      } catch (error) {
        totalErrors++;
        console.error(`❌ [CRON] Erro ao processar ${profile.user_id}:`, error.message);
        return { success: false, userId: profile.user_id, error: error.message };
      }
    });
    
    await Promise.all(promises);
    
    const result = {
      success: true,
      statistics: {
        profiles_regenerated: totalProcessed,
        matches_generated: totalMatches,
        errors: totalErrors,
        execution_time: new Date().toISOString()
      }
    };
    
    console.log('✅ [CRON] Regeneração completa:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('❌ [CRON ERROR]', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erro ao regenerar matches"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
