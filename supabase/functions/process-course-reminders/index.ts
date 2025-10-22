import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 [COURSE-REMINDERS] Iniciando processamento...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Chamar função RPC que identifica cursos inacabados e cria notificações
    const { data, error } = await supabase.rpc('process_course_reminders');

    if (error) {
      console.error('❌ [COURSE-REMINDERS] Erro ao processar:', error);
      throw error;
    }

    const remindersCount = Array.isArray(data) ? data.length : 0;
    console.log(`✅ [COURSE-REMINDERS] ${remindersCount} lembretes criados`);
    
    if (remindersCount > 0) {
      console.log('📊 [COURSE-REMINDERS] Detalhes:', {
        usuarios_notificados: remindersCount,
        sample: data.slice(0, 3).map((d: any) => ({
          user: d.user_id,
          course: d.course_title,
          progress: `${d.progress_percentage?.toFixed(1)}%`
        }))
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: remindersCount,
        data,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ [COURSE-REMINDERS] Erro fatal:', error);
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
