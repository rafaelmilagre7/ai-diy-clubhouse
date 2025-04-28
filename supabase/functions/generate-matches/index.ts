
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
    console.log("Iniciando geração de matches para usuário:", user_id)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Buscar dados do usuário atual usando a nova view
    const { data: currentUser, error: currentUserError } = await supabaseClient
      .from('onboarding_profile_view')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle()

    if (currentUserError) {
      console.error("Erro ao buscar usuário atual:", currentUserError)
      throw new Error('Erro ao buscar dados do usuário')
    }

    if (!currentUser) {
      console.error("Usuário não encontrado ou sem dados de onboarding")
      throw new Error('Perfil incompleto. Por favor, complete seu onboarding primeiro.')
    }

    // Validar dados essenciais do usuário
    if (!currentUser.experience_personalization?.interests || 
        !currentUser.experience_personalization?.skills_to_share) {
      throw new Error('Perfil incompleto. Atualize seus interesses e habilidades.')
    }

    // Buscar outros usuários usando a nova view
    const { data: otherUsers, error: otherUsersError } = await supabaseClient
      .from('onboarding_profile_view')
      .select('*')
      .neq('user_id', user_id)
      .not('experience_personalization', 'is', null)
      .limit(20)

    if (otherUsersError) {
      console.error("Erro ao buscar outros usuários:", otherUsersError)
      throw new Error('Erro ao buscar potenciais conexões')
    }

    if (!otherUsers || otherUsers.length === 0) {
      throw new Error('Não encontramos usuários compatíveis no momento')
    }

    // Preparar dados para OpenAI com validação
    const userProfiles = otherUsers.map(user => ({
      id: user.user_id,
      name: user.profile_name || 'Usuário',
      company: user.profile_company || 'Empresa não informada',
      position: user.professional_info?.current_position || 'Cargo não informado',
      interests: user.experience_personalization?.interests || [],
      skills: user.experience_personalization?.skills_to_share || [],
      industry: user.professional_info?.company_sector || 'Setor não informado',
    }))

    console.log("Enviando request para OpenAI com dados validados")

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('Configuração do OpenAI ausente')
    }

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
            Nome: ${currentUser.profile_name}
            Empresa: ${currentUser.profile_company || 'Não informada'}
            Cargo: ${currentUser.professional_info?.current_position || 'Não informado'}
            Interesses: ${JSON.stringify(currentUser.experience_personalization?.interests || [])}
            Habilidades: ${JSON.stringify(currentUser.experience_personalization?.skills_to_share || [])}
            
            Potenciais conexões:
            ${JSON.stringify(userProfiles, null, 2)}
            
            Retorne um array JSON com os 5 melhores matches. Para cada match inclua:
            {
              "id": string (ID do usuário),
              "compatibility_score": número entre 0 e 1,
              "match_reason": string explicando por que essa conexão é relevante,
              "match_strengths": array de pontos fortes do match,
              "suggested_topics": array de tópicos sugeridos para iniciar a conversa
            }`
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text()
      console.error("Erro na resposta da OpenAI:", error)
      throw new Error('Erro ao processar matches')
    }

    const aiData = await openAIResponse.json()
    if (!aiData.choices?.[0]?.message?.content) {
      throw new Error('Formato inválido na resposta da IA')
    }

    let matches
    try {
      matches = JSON.parse(aiData.choices[0].message.content)
      if (!Array.isArray(matches)) {
        throw new Error('Resposta inválida da IA')
      }
    } catch (error) {
      console.error("Erro ao processar resposta:", error)
      throw new Error('Erro ao processar recomendações')
    }

    console.log("Matches gerados com sucesso:", matches.length)

    // Inserir matches no banco
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
        console.error("Erro ao salvar match:", upsertError)
      }
    }

    return new Response(
      JSON.stringify({ success: true, matches_count: matches.length }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na geração de matches:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error instanceof Error ? error.stack : undefined
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
