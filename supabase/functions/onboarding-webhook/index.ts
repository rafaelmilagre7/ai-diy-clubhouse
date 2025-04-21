
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Received complete webhook payload:', JSON.stringify(body, null, 2))

    // Verificar se o email está presente
    if (!body.email) {
      console.error('Email não fornecido no payload')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email é obrigatório' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Buscar usuário pelo email
    const { data: userSearch, error: userSearchError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', body.email)
      .single()

    if (userSearchError) {
      console.error('Erro ao buscar usuário pelo email:', userSearchError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao processar usuário' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Se não encontrar usuário, retornar erro
    if (!userSearch) {
      console.warn(`Usuário com email ${body.email} não encontrado`)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não encontrado' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    const userId = userSearch.id

    // Preparar dados do onboarding
    const onboardingData = {
      user_id: userId,
      personal_info: body.personal_info || {},
      professional_info: body.professional_info || {},
      business_goals: body.business_goals || {},
      ai_experience: body.ai_experience || {},
      experience_personalization: body.experience_personalization || {},
      complementary_info: body.complementary_info || {},
      is_completed: true,
      completed_steps: [
        'personal',
        'professional_data',
        'business_context',
        'ai_exp',
        'business_goals',
        'experience_personalization',
        'complementary_info',
        'review'
      ],
      current_step: 'completed'
    }

    // Atualizar registro de progresso do onboarding
    const { data, error } = await supabaseClient
      .from('onboarding_progress')
      .upsert({
        ...onboardingData,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar dados de onboarding:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao salvar dados de onboarding' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    console.log('Dados de onboarding processados com sucesso para usuário:', userId)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dados de onboarding processados com sucesso',
        userId: userId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erro no processamento do webhook:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

