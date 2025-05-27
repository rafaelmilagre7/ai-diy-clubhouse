
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Iniciando geração automática mensal de matches...');

    const currentMonth = new Date().toISOString().slice(0, 7);
    const startTime = Date.now();

    // Limpar matches antigos (mais de 3 meses)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cleanupMonth = threeMonthsAgo.toISOString().slice(0, 7);

    console.log(`🧹 Limpando matches anteriores a ${cleanupMonth}...`);
    
    const { error: cleanupError } = await supabaseClient
      .from('network_matches')
      .delete()
      .lt('month_year', cleanupMonth);

    if (cleanupError) {
      console.error('Erro na limpeza:', cleanupError);
    } else {
      console.log('✅ Limpeza de matches antigos concluída');
    }

    // Buscar usuários elegíveis (com onboarding completo)
    const { data: eligibleUsers, error: usersError } = await supabaseClient
      .from('onboarding_profile_view')
      .select('user_id, profile_name, company_name')
      .eq('is_completed', true)
      .in('role', ['admin', 'formacao']);

    if (usersError) {
      throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
    }

    const totalUsers = eligibleUsers?.length || 0;
    console.log(`👥 Encontrados ${totalUsers} usuários elegíveis para networking`);

    if (totalUsers === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum usuário elegível encontrado',
        stats: { total_users: 0, matches_generated: 0 }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Processar usuários em lotes para evitar timeout
    const batchSize = 10;
    let totalMatches = 0;
    let processedUsers = 0;
    const errors: string[] = [];

    for (let i = 0; i < totalUsers; i += batchSize) {
      const batch = eligibleUsers.slice(i, i + batchSize);
      console.log(`📦 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(totalUsers/batchSize)} (${batch.length} usuários)`);

      for (const user of batch) {
        try {
          // Verificar se já tem matches para este mês
          const { data: existingMatches } = await supabaseClient
            .from('network_matches')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('month_year', currentMonth)
            .limit(1);

          if (existingMatches && existingMatches.length > 0) {
            console.log(`⏭️ Usuário ${user.profile_name} já tem matches para ${currentMonth}`);
            processedUsers++;
            continue;
          }

          // Chamar função de geração de matches
          const { data: matchResult, error: matchError } = await supabaseClient.functions.invoke(
            'generate-networking-matches',
            {
              body: { 
                target_user_id: user.user_id,
                force_regenerate: false
              }
            }
          );

          if (matchError) {
            console.error(`❌ Erro ao gerar matches para ${user.profile_name}:`, matchError);
            errors.push(`${user.profile_name}: ${matchError.message}`);
          } else {
            const userMatches = matchResult?.total_matches_generated || 0;
            totalMatches += userMatches;
            console.log(`✅ ${user.profile_name}: ${userMatches} matches gerados`);
          }

          processedUsers++;

          // Pequena pausa para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`💥 Exceção ao processar ${user.profile_name}:`, error);
          errors.push(`${user.profile_name}: ${error.message}`);
          processedUsers++;
        }
      }

      // Pausa entre lotes
      if (i + batchSize < totalUsers) {
        console.log('⏳ Pausa entre lotes...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const executionTime = Date.now() - startTime;
    const summary = {
      execution_time_ms: executionTime,
      month: currentMonth,
      total_users: totalUsers,
      processed_users: processedUsers,
      matches_generated: totalMatches,
      error_count: errors.length,
      success_rate: Math.round((processedUsers - errors.length) / processedUsers * 100)
    };

    console.log('📊 Resumo da execução:', summary);

    // Criar log da execução
    try {
      await supabaseClient
        .from('networking_execution_logs')
        .insert({
          execution_date: new Date().toISOString(),
          month_processed: currentMonth,
          total_users: totalUsers,
          processed_users: processedUsers,
          matches_generated: totalMatches,
          execution_time_ms: executionTime,
          errors: errors.length > 0 ? errors : null,
          summary: summary
        });
    } catch (logError) {
      console.error('Erro ao salvar log:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Processamento mensal concluído em ${Math.round(executionTime/1000)}s`,
      stats: summary,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Limitar erros na resposta
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Erro fatal na geração automática:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
