
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()
    console.log("Gerando matches para usuário:", user_id)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Buscar dados do usuário atual
    const { data: currentUser, error: currentUserError } = await supabaseClient
      .from('onboarding_progress')
      .select('*, profiles:profiles(*)')
      .eq('user_id', user_id)
      .single()

    if (currentUserError) {
      console.error("Erro ao buscar usuário atual:", currentUserError)
      throw currentUserError
    }

    // Buscar outros usuários
    const { data: otherUsers, error: otherUsersError } = await supabaseClient
      .from('onboarding_progress')
      .select('*, profiles:profiles(*)')
      .neq('user_id', user_id)
      .limit(20)

    if (otherUsersError) {
      console.error("Erro ao buscar outros usuários:", otherUsersError)
      throw otherUsersError
    }

    // Preparar dados para OpenAI
    const userProfiles = otherUsers.map(user => ({
      id: user.user_id,
      name: user.profiles?.name,
      company: user.profiles?.company_name,
      position: user.professional_info?.current_position,
      interests: user.experience_personalization?.interests,
      skills: user.experience_personalization?.skills_to_share,
      industry: user.professional_info?.company_sector,
    }))

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em networking que ajuda a identificar as melhores conexões profissionais.'
          },
          {
            role: 'user',
            content: `Analise o perfil do usuário atual e encontre os melhores matches baseado em seus interesses, habilidades e objetivos.
            
            Usuário atual:
            Nome: ${currentUser.profiles?.name}
            Empresa: ${currentUser.profiles?.company_name}
            Cargo: ${currentUser.professional_info?.current_position}
            Interesses: ${JSON.stringify(currentUser.experience_personalization?.interests)}
            Habilidades: ${JSON.stringify(currentUser.experience_personalization?.skills_to_share)}
            
            Potenciais conexões:
            ${JSON.stringify(userProfiles, null, 2)}
            
            Retorne apenas um JSON array com os 5 melhores matches, cada um contendo:
            {
              id: ID do usuário,
              compatibility_score: número entre 0 e 1,
              match_reason: texto explicando por que essa conexão é relevante,
              match_strengths: array de pontos fortes do match,
              suggested_topics: array de tópicos sugeridos para iniciar a conversa
            }`
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text()
      console.error("Erro na resposta da OpenAI:", error)
      throw new Error(`OpenAI API error: ${error}`)
    }

    const aiData = await openAIResponse.json()
    console.log("Resposta da OpenAI:", aiData)

    if (!aiData.choices?.[0]?.message?.content) {
      throw new Error('Formato inválido na resposta da OpenAI')
    }

    let matches
    try {
      matches = JSON.parse(aiData.choices[0].message.content)
      if (!Array.isArray(matches)) {
        throw new Error('A resposta não é um array')
      }
    } catch (error) {
      console.error("Erro ao fazer parse da resposta:", error)
      throw new Error('Erro ao processar resposta da OpenAI')
    }

    // Inserir ou atualizar matches no banco
    for (const match of matches) {
      const { error: upsertError } = await supabaseClient
        .from('network_matches')
        .upsert({
          user_id,
          matched_user_id: match.id,
          compatibility_score: match.compatibility_score,
          match_reason: match.match_reason,
          match_strengths: match.match_strengths,
          suggested_topics: match.suggested_topics,
          status: 'pending',
          is_viewed: false,
          updated_at: new Date().toISOString(),
        })

      if (upsertError) {
        console.error("Erro ao inserir match:", upsertError)
        throw upsertError
      }
    }

    return new Response(
      JSON.stringify({ success: true, matches }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
