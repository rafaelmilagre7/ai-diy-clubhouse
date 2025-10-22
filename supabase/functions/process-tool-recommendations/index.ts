/**
 * 🔧 PROCESS TOOL RECOMMENDATIONS
 * 
 * Edge function para processar recomendações semanais de ferramentas:
 * - Identifica usuários ativos com favoritos
 * - Recomenda ferramentas similares que ainda não favoritaram
 * - Baseado nas categorias de interesse do usuário
 * 
 * Deve ser executada via cron semanalmente.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationResult {
  user_id: string;
  recommendations_count: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[Process Tool Recommendations] 🚀 Starting recommendation processing...');

  try {
    // Criar cliente Supabase com privilégios de service_role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Chamar função do banco que processa recomendações
    console.log('[Process Tool Recommendations] Calling process_tool_recommendations()...');
    const { data, error } = await supabaseAdmin.rpc('process_tool_recommendations');

    if (error) {
      console.error('[Process Tool Recommendations] ❌ Error:', error);
      throw error;
    }

    const results = data as RecommendationResult[];
    const totalUsers = results.length;
    const totalRecommendations = results.reduce((sum, r) => sum + r.recommendations_count, 0);

    const executionTime = Date.now() - startTime;
    
    console.log('[Process Tool Recommendations] ✅ Processing complete:');
    console.log(`  - Total users notified: ${totalUsers}`);
    console.log(`  - Total recommendations sent: ${totalRecommendations}`);
    console.log(`  - Execution time: ${executionTime}ms`);
    
    if (results.length > 0) {
      console.log('  - Sample results:', results.slice(0, 3));
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          users_notified: totalUsers,
          total_recommendations: totalRecommendations,
          execution_time_ms: executionTime
        },
        details: results,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[Process Tool Recommendations] 💥 Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        execution_time_ms: executionTime,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
