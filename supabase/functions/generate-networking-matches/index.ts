
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { target_user_id, force_regenerate = false } = await req.json()

    // Se não foi especificado um usuário, usar o usuário autenticado
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user && !target_user_id) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = target_user_id || user.id

    // Verificar se o usuário já tem matches do mês atual
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    if (!force_regenerate) {
      const { data: existingMatches } = await supabase
        .from('network_matches')
        .select('id')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .limit(1)

      if (existingMatches && existingMatches.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Matches já existem para este mês',
            matches_generated: 0 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Gerar matches usando a função do banco
    const { data, error } = await supabase.rpc('generate_networking_matches_for_user', {
      target_user_id: userId
    })

    if (error) {
      console.error('Erro ao gerar matches:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar matches', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        total_matches_generated: data.matches_generated,
        user_id: data.user_id,
        month: data.month
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
