import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupResult {
  success: boolean;
  message: string;
  deletedRecords: {
    invites: number;
    deliveries: number;
    backups: number;
    auditLogs: number;
  };
  newInvite?: {
    id: string;
    token: string;
    link: string;
  };
}

Deno.serve(async (req) => {
  console.log('🔧 [ADMIN CLEANUP WAGNER] Iniciando limpeza completa...');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false }
      }
    );

    const wagnerEmail = 'wagner@acairepublic.com';
    let deletedRecords = {
      invites: 0,
      deliveries: 0,
      backups: 0,
      auditLogs: 0
    };

    console.log(`📋 Limpando todos os registros para: ${wagnerEmail}`);

    // 1. Buscar IDs dos convites primeiro
    const { data: inviteIds } = await supabaseAdmin
      .from('invites')
      .select('id')
      .eq('email', wagnerEmail);

    console.log(`📧 Encontrados ${inviteIds?.length || 0} convites`);

    // 2. Deletar deliveries relacionadas
    if (inviteIds && inviteIds.length > 0) {
      const inviteIdList = inviteIds.map(i => i.id);
      
      const { error: deliveryError, count: deliveryCount } = await supabaseAdmin
        .from('invite_deliveries')
        .delete({ count: 'exact' })
        .in('invite_id', inviteIdList);

      if (!deliveryError) {
        deletedRecords.deliveries = deliveryCount || 0;
        console.log(`✅ Deletadas ${deletedRecords.deliveries} deliveries`);
      }
    }

    // 3. Deletar convites
    const { error: inviteError, count: inviteCount } = await supabaseAdmin
      .from('invites')
      .delete({ count: 'exact' })
      .eq('email', wagnerEmail);

    if (!inviteError) {
      deletedRecords.invites = inviteCount || 0;
      console.log(`✅ Deletados ${deletedRecords.invites} convites`);
    }

    // 4. Deletar backups de convites
    const { error: backupError, count: backupCount } = await supabaseAdmin
      .from('invite_backups')
      .delete({ count: 'exact' })
      .eq('email', wagnerEmail);

    if (!backupError) {
      deletedRecords.backups = backupCount || 0;
      console.log(`✅ Deletados ${deletedRecords.backups} backups`);
    }

    // 5. Deletar logs de auditoria relacionados
    const { error: auditError, count: auditCount } = await supabaseAdmin
      .from('audit_logs')
      .delete({ count: 'exact' })
      .eq('details->>email', wagnerEmail);

    if (!auditError) {
      deletedRecords.auditLogs = auditCount || 0;
      console.log(`✅ Deletados ${deletedRecords.auditLogs} logs de auditoria`);
    }

    // 6. Verificar se email está realmente limpo
    const { data: remainingInvites } = await supabaseAdmin
      .from('invites')
      .select('id')
      .eq('email', wagnerEmail);

    const { data: remainingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', wagnerEmail)
      .maybeSingle();

    const isClean = (!remainingInvites || remainingInvites.length === 0) && !remainingProfile;

    if (!isClean) {
      console.log('⚠️ Email não foi completamente limpo');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email não foi completamente limpo - ainda existem registros',
          deletedRecords
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Criar novo convite limpo
    console.log('📧 Criando novo convite limpo...');
    
    // Buscar role membro_club
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('name', 'membro_club')
      .single();

    if (!roleData) {
      throw new Error('Role membro_club não encontrado');
    }

    // Criar convite usando RPC
    const { data: inviteResult, error: inviteCreateError } = await supabaseAdmin.rpc('create_invite_hybrid', {
      p_email: wagnerEmail,
      p_role_id: roleData.id,
      p_phone: null,
      p_expires_in: '7 days',
      p_notes: 'Convite recriado após limpeza completa - email estava contaminado',
      p_channel_preference: 'email'
    });

    if (inviteCreateError || !inviteResult?.success) {
      throw new Error(`Erro ao criar novo convite: ${inviteCreateError?.message || 'Falha desconhecida'}`);
    }

    const inviteLink = `https://zotzvtepvpnkcoobdubt.supabase.co/convite/${inviteResult.token}`;

    const result: CleanupResult = {
      success: true,
      message: `✅ Limpeza completa realizada! ${deletedRecords.invites} convites, ${deletedRecords.deliveries} deliveries, ${deletedRecords.backups} backups e ${deletedRecords.auditLogs} logs removidos. Novo convite criado.`,
      deletedRecords,
      newInvite: {
        id: inviteResult.invite_id,
        token: inviteResult.token,
        link: inviteLink
      }
    };

    console.log('🎉 Limpeza completa finalizada:', result);

    // Log da operação administrativa
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: null,
        event_type: 'admin_cleanup',
        action: 'complete_user_cleanup',
        details: {
          target_email: wagnerEmail,
          deleted_records: deletedRecords,
          new_invite_created: true,
          cleanup_timestamp: new Date().toISOString()
        },
        severity: 'info'
      });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erro na limpeza completa:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: `Erro na limpeza: ${error.message}`,
        deletedRecords: { invites: 0, deliveries: 0, backups: 0, auditLogs: 0 }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});