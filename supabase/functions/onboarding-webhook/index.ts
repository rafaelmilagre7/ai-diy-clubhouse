
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
    console.log('Received webhook data:', body)

    // Mapear os dados recebidos para o formato esperado pelo banco
    const onboardingData = {
      user_id: body.user_id,
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

    // Verificar se já existe um registro para este usuário
    const { data: existingProgress } = await supabaseClient
      .from('onboarding_progress')
      .select('id')
      .eq('user_id', body.user_id)
      .single()

    let result
    if (existingProgress) {
      // Atualizar registro existente
      result = await supabaseClient
        .from('onboarding_progress')
        .update(onboardingData)
        .eq('id', existingProgress.id)
    } else {
      // Criar novo registro
      result = await supabaseClient
        .from('onboarding_progress')
        .insert([onboardingData])
    }

    if (result.error) {
      throw result.error
    }

    console.log('Successfully stored onboarding data')
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Onboarding data processed successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
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
