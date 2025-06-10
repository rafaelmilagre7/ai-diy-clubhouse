
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { corsHeaders } from '../_shared/cors.ts'

// CORREÇÃO DE SEGURANÇA: Validar entradas
function validateInput(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Dados inválidos fornecidos' };
  }
  
  // Validar user_id se fornecido
  if (data.user_id && typeof data.user_id !== 'string') {
    return { isValid: false, error: 'user_id deve ser uma string UUID válida' };
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
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'JSON inválido na requisição' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      const validation = validateInput(requestData)
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
      console.log('🚫 Sistema de networking pausado')
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

    // Log de início da geração
    console.log('🚀 Iniciando geração de matches de networking')
    
    // Buscar usuários ativos para networking
    const { data: activeUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        company_name,
        company_sector,
        current_position,
        networking_preferences (
          is_active,
          looking_for,
          min_compatibility,
          preferred_connections_per_week
        )
      `)
      .not('networking_preferences', 'is', null)

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao carregar dados de usuários' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const filteredUsers = activeUsers?.filter(user => 
      user.networking_preferences?.some((pref: any) => pref.is_active)
    ) || []

    console.log(`📊 Encontrados ${filteredUsers.length} usuários ativos para networking`)

    if (filteredUsers.length < 2) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Poucos usuários disponíveis para gerar matches',
          matches_generated: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Gerar matches (lógica simplificada para exemplo)
    const matches = []
    const maxMatches = Math.min(10, Math.floor(filteredUsers.length / 2))

    for (let i = 0; i < maxMatches; i++) {
      const user1 = filteredUsers[i * 2]
      const user2 = filteredUsers[i * 2 + 1]
      
      if (user1 && user2) {
        const matchData = {
          user_id: user1.id,
          matched_user_id: user2.id,
          compatibility_score: Math.random() * 0.4 + 0.6, // 0.6 a 1.0
          match_type: 'customer',
          status: 'pending',
          match_reason: 'Compatibilidade de setor e objetivos profissionais',
          suggested_topics: JSON.stringify(['Networking profissional', 'Crescimento empresarial']),
          match_strengths: JSON.stringify(['Mesmo setor', 'Objetivos similares'])
        }

        const { error: insertError } = await supabase
          .from('network_matches')
          .insert(matchData)

        if (!insertError) {
          matches.push(matchData)
        } else {
          console.error('❌ Erro ao inserir match:', insertError)
        }
      }
    }

    console.log(`✅ Gerados ${matches.length} matches de networking`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches_generated: matches.length,
        message: `${matches.length} novos matches gerados com sucesso`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erro na função generate-networking-matches:', error)
    
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
