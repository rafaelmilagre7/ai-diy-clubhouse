
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Configuração de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lidar com requisição OPTIONS para CORS
Deno.serve(async (req) => {
  // Esta função de edge aceita requisições POST apenas
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('PROJECT_URL') || Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('PRIVATE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração de ambiente Supabase incompleta')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { invite_id } = await req.json()
    
    if (!invite_id) {
      throw new Error('ID do convite é obrigatório')
    }
    
    console.log(`Atualizando estatísticas do convite ${invite_id}`)
    
    // Atualizar estatísticas do convite
    const { data, error } = await supabase
      .from('invites')
      .update({
        last_sent_at: new Date().toISOString(),
        send_attempts: supabase.rpc('increment', { 
          row_id: invite_id, 
          table_name: 'invites', 
          column_name: 'send_attempts' 
        })
      })
      .eq('id', invite_id)
    
    if (error) {
      console.error(`Erro ao atualizar estatísticas: ${error.message}`)
      throw error
    }
    
    console.log(`Estatísticas do convite ${invite_id} atualizadas com sucesso`)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Estatísticas de envio atualizadas'
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro ao atualizar estatísticas',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
