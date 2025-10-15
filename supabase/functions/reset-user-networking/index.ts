import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetResult {
  success: boolean;
  message: string;
  details?: {
    deleted_matches: number;
    deleted_notifications: number;
    preferences_reset: boolean;
  };
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autenticado');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Usuário não encontrado');
    }

    console.log(`🔄 Iniciando reset de networking para usuário: ${user.id}`);

    // 1. Deletar matches estratégicos
    const { error: matchesError, count: deletedMatches } = await supabase
      .from('strategic_matches_v2')
      .delete({ count: 'exact' })
      .eq('user_id', user.id);

    if (matchesError) {
      console.error('❌ Erro ao deletar matches:', matchesError);
      throw matchesError;
    }

    console.log(`✅ ${deletedMatches || 0} matches deletados`);

    // 2. Deletar notificações de conexão
    const { error: notifError, count: deletedNotifications } = await supabase
      .from('connection_notifications')
      .delete({ count: 'exact' })
      .eq('user_id', user.id);

    if (notifError) {
      console.error('❌ Erro ao deletar notificações:', notifError);
      throw notifError;
    }

    console.log(`✅ ${deletedNotifications || 0} notificações deletadas`);

    // 3. Atualizar timestamp das preferências (opcional)
    const { error: prefsError } = await supabase
      .from('networking_preferences')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (prefsError) {
      console.warn('⚠️ Aviso ao atualizar preferências:', prefsError);
      // Não lançar erro, continuar mesmo assim
    } else {
      console.log('✅ Preferências de networking atualizadas');
    }

    // 4. Registrar no audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      event_type: 'networking_reset',
      action: 'reset_user_networking',
      details: {
        deleted_matches: deletedMatches || 0,
        deleted_notifications: deletedNotifications || 0,
        timestamp: new Date().toISOString()
      },
      severity: 'info'
    });

    const result: ResetResult = {
      success: true,
      message: 'Reset de networking concluído com sucesso',
      details: {
        deleted_matches: deletedMatches || 0,
        deleted_notifications: deletedNotifications || 0,
        preferences_reset: true
      }
    };

    console.log('✅ Reset completo:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Erro no reset de networking:', error);
    
    const errorResult: ResetResult = {
      success: false,
      message: 'Erro ao resetar networking',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };

    return new Response(
      JSON.stringify(errorResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
