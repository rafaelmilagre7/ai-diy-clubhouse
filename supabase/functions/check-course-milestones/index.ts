import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MilestoneRequest {
  user_id: string;
  course_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, course_id } = await req.json() as MilestoneRequest;

    if (!user_id || !course_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'user_id e course_id são obrigatórios'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log(`🎯 [MILESTONES] Verificando progresso do usuário ${user_id} no curso ${course_id}`);

    // Chamar função RPC que verifica milestones
    const { data, error } = await supabase.rpc('check_course_milestones', {
      p_user_id: user_id,
      p_course_id: course_id
    });

    if (error) {
      console.error('❌ [MILESTONES] Erro ao verificar:', error);
      throw error;
    }

    const milestonesReached = Array.isArray(data) ? data : [];
    
    if (milestonesReached.length > 0) {
      console.log(`✅ [MILESTONES] ${milestonesReached.length} milestone(s) atingido(s):`, 
        milestonesReached.map((m: any) => `${m.milestone_reached}%`)
      );
    } else {
      console.log('ℹ️ [MILESTONES] Nenhum novo milestone atingido');
    }

    return new Response(
      JSON.stringify({
        success: true,
        milestones_reached: milestonesReached,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ [MILESTONES] Erro fatal:', error);
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
