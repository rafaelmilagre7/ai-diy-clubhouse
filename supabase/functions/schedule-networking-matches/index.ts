
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

// CORREÇÃO DE SEGURANÇA: Validar entradas
function validateCronInput(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: true }; // Cron jobs podem não ter payload
  }
  
  // Validar campos específicos se presentes
  if (data.force && typeof data.force !== 'boolean') {
    return { isValid: false, error: 'Campo force deve ser boolean' };
  }
  
  return { isValid: true };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // CORREÇÃO DE SEGURANÇA: Usar variável de ambiente em vez de URL hardcoded
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente SUPABASE não configuradas')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração do servidor indisponível' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // CORREÇÃO DE SEGURANÇA: Validar entrada da requisição
    let requestData = {}
    if (req.method === 'POST') {
      try {
        requestData = await req.json()
      } catch (error) {
        // Ignorar erro de JSON para cron jobs
        console.log('ℹ️ Requisição sem JSON (normal para cron)')
      }
      
      const validation = validateCronInput(requestData)
      if (!validation.isValid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: validation.error 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Verificar se o sistema está pausado
    const { data: systemStatus, error: statusError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'networking_paused')
      .single()

    if (statusError && statusError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar status do sistema:', statusError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro interno do servidor' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // CORREÇÃO CRÍTICA: Retornar false quando pausado
    if (systemStatus?.value === 'true') {
      console.log('🚫 Agendamento de networking pausado')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Sistema de networking temporariamente pausado para manutenção',
          code: 'NETWORKING_PAUSED'
        }),
        { 
          status: 503, // Service Unavailable
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('⏰ Executando agendamento de matches de networking')
    
    // Chamar a função de geração de matches
    const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-networking-matches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scheduled: true, ...requestData })
    })

    const generateResult = await generateResponse.json()

    if (!generateResponse.ok) {
      console.error('❌ Erro na geração de matches:', generateResult)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: generateResult.error || 'Erro na geração de matches' 
        }),
        { 
          status: generateResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log da execução do agendamento
    await supabase
      .from('analytics')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        event_type: 'networking_scheduled',
        event_data: {
          matches_generated: generateResult.matches_generated || 0,
          executed_at: new Date().toISOString()
        }
      })

    console.log(`✅ Agendamento executado: ${generateResult.matches_generated || 0} matches gerados`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Agendamento de networking executado com sucesso',
        matches_generated: generateResult.matches_generated || 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erro na função schedule-networking-matches:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
