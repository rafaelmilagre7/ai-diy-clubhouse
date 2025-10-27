import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteInviteRequest {
  email: string;
}

interface DeleteInviteResponse {
  success: boolean;
  message: string;
  deletedCount?: number;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`🗑️ [ADMIN-DELETE-${requestId}] Iniciando processamento...`);

  try {
    // Get Supabase service client with elevated permissions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Parse request body
    const { email }: DeleteInviteRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email é obrigatório'
        } as DeleteInviteResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`📧 [ADMIN-DELETE-${requestId}] Email alvo: ${email}`);

    // Verificar se há convites soft-deleted para este email
    const { data: softDeletedInvites, error: selectError } = await supabase
      .from('invites')
      .select('id, email, created_at, deleted_at')
      .eq('email', email)
      .not('deleted_at', 'is', null);

    if (selectError) {
      console.error(`❌ [ADMIN-DELETE-${requestId}] Erro ao buscar convites:`, selectError);
      throw new Error(`Erro ao buscar convites: ${selectError.message}`);
    }

    if (!softDeletedInvites || softDeletedInvites.length === 0) {
      console.log(`⚠️ [ADMIN-DELETE-${requestId}] Nenhum convite soft-deleted encontrado para ${email}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: `Nenhum convite soft-deleted encontrado para ${email}`,
          deletedCount: 0
        } as DeleteInviteResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`🔍 [ADMIN-DELETE-${requestId}] Encontrados ${softDeletedInvites.length} convites soft-deleted`);

    // Deletar fisicamente os convites soft-deleted
    const { error: deleteError } = await supabase
      .from('invites')
      .delete()
      .eq('email', email)
      .not('deleted_at', 'is', null);

    if (deleteError) {
      console.error(`❌ [ADMIN-DELETE-${requestId}] Erro ao deletar convites:`, deleteError);
      throw new Error(`Erro ao deletar convites: ${deleteError.message}`);
    }

    const deletedCount = softDeletedInvites.length;
    console.log(`✅ [ADMIN-DELETE-${requestId}] ${deletedCount} convites deletados fisicamente para ${email}`);

    // Log de auditoria
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        event_type: 'admin_action',
        action: 'physical_invite_deletion',
        details: {
          target_email: email,
          deleted_count: deletedCount,
          deleted_invites: softDeletedInvites.map(inv => ({
            id: inv.id,
            created_at: inv.created_at,
            deleted_at: inv.deleted_at
          })),
          request_id: requestId
        },
        severity: 'info'
      });

    if (auditError) {
      console.warn(`⚠️ [ADMIN-DELETE-${requestId}] Falha no log de auditoria:`, auditError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${deletedCount} convite(s) deletado(s) fisicamente para ${email}`,
        deletedCount
      } as DeleteInviteResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error(`❌ [ADMIN-DELETE-${requestId}] Erro geral:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno no servidor'
      } as DeleteInviteResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});