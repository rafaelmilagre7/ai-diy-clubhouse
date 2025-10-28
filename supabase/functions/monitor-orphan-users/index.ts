// FRENTE 4: Edge Function para Monitoramento Proativo de Usuários Órfãos
// Detecta e corrige automaticamente usuários sem profile

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrphanUser {
  id: string;
  email: string;
  created_at: string;
  raw_user_meta_data: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase admin
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

    console.log('🔍 [MONITOR] Iniciando verificação de usuários órfãos...');

    // 1. BUSCAR USUÁRIOS ÓRFÃOS usando a função SQL
    const { data: orphans, error: findError } = await supabaseAdmin
      .rpc('find_orphan_users');

    if (findError) {
      console.error('❌ [MONITOR] Erro ao buscar órfãos:', findError);
      throw findError;
    }

    const orphanCount = orphans?.length || 0;
    console.log(`📊 [MONITOR] ${orphanCount} usuários órfãos encontrados`);

    if (orphanCount === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          orphans_found: 0,
          message: 'Nenhum usuário órfão detectado'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // 2. BUSCAR ROLE PADRÃO
    const { data: defaultRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('name', 'membro_club')
      .single();

    if (roleError || !defaultRole) {
      console.error('❌ [MONITOR] Role padrão não encontrado');
      throw new Error('Role membro_club não encontrado');
    }

    console.log(`✅ [MONITOR] Role padrão: ${defaultRole.id}`);

    // 3. TENTAR CORRIGIR AUTOMATICAMENTE CADA ÓRFÃO
    const results = [];
    for (const orphan of orphans as OrphanUser[]) {
      try {
        console.log(`🔧 [MONITOR] Corrigindo usuário órfão: ${orphan.email}`);

        const name = orphan.raw_user_meta_data?.name || 
                     orphan.raw_user_meta_data?.full_name || 
                     orphan.raw_user_meta_data?.display_name ||
                     orphan.email?.split('@')[0] || 
                     'Usuário';

        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: orphan.id,
            email: orphan.email,
            name: name,
            role_id: defaultRole.id,
            onboarding_completed: false,
            is_master_user: true,
            created_at: orphan.created_at,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error(`❌ [MONITOR] Erro ao criar profile para ${orphan.email}:`, insertError);
          results.push({
            user_id: orphan.id,
            email: orphan.email,
            success: false,
            error: insertError.message
          });
        } else {
          console.log(`✅ [MONITOR] Profile criado automaticamente para ${orphan.email}`);
          
          // Registrar no log
          await supabaseAdmin.rpc('log_orphan_profile_creation', {
            p_user_id: orphan.id,
            p_created_by: 'EdgeFunction_monitor',
            p_metadata: {
              email: orphan.email,
              timestamp: new Date().toISOString(),
              auto_corrected: true
            }
          }).catch(err => console.warn('Erro ao logar:', err));

          results.push({
            user_id: orphan.id,
            email: orphan.email,
            success: true
          });
        }
      } catch (err: any) {
        console.error(`❌ [MONITOR] Erro ao processar ${orphan.email}:`, err);
        results.push({
          user_id: orphan.id,
          email: orphan.email,
          success: false,
          error: err.message
        });
      }
    }

    // 4. ESTATÍSTICAS
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`📊 [MONITOR] Resultados: ${successCount} corrigidos, ${failCount} falhas`);

    // 5. RESPOSTA
    return new Response(
      JSON.stringify({ 
        success: true,
        orphans_found: orphanCount,
        corrected: successCount,
        failed: failCount,
        details: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('❌ [MONITOR] Erro crítico:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
