/**
 * 📰 PROCESS COMMUNITY DIGEST
 * 
 * Edge function para processar digest semanal da comunidade:
 * - Top 5 tópicos mais ativos da semana
 * - Envia para usuários ativos que não receberam nos últimos 6 dias
 * - Resumo de atividades e engajamento
 * 
 * Deve ser executada via cron semanalmente (sugestão: domingo 9h).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DigestResult {
  user_id: string;
  topics_count: number;
  top_topics: Array<{
    topic_id: string;
    topic_title: string;
    replies_count: number;
    views_count: number;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[Process Community Digest] 🚀 Starting digest processing...');

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

    // Chamar função do banco que processa digest
    console.log('[Process Community Digest] Calling process_community_digest()...');
    const { data, error } = await supabaseAdmin.rpc('process_community_digest');

    if (error) {
      console.error('[Process Community Digest] ❌ Error:', error);
      throw error;
    }

    const results = data as DigestResult[];
    const totalUsers = results.length;
    const totalTopics = results.reduce((sum, r) => sum + r.topics_count, 0);

    const executionTime = Date.now() - startTime;
    
    console.log('[Process Community Digest] ✅ Processing complete:');
    console.log(`  - Total users notified: ${totalUsers}`);
    console.log(`  - Total topics featured: ${totalTopics}`);
    console.log(`  - Execution time: ${executionTime}ms`);
    
    if (results.length > 0) {
      console.log('  - Sample results:', results.slice(0, 3).map(r => ({
        user_id: r.user_id,
        topics_count: r.topics_count
      })));
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          users_notified: totalUsers,
          total_topics: totalTopics,
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
    console.error('[Process Community Digest] 💥 Fatal error:', error);
    
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
