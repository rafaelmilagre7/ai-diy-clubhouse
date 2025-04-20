
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, userInfo } = await req.json()

    const openAIConfig = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(openAIConfig)

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um assistente amigável do VIVER DE IA Club, ajudando no onboarding de novos membros.
          Se apresente de forma calorosa e guie o usuário pelo processo de onboarding.
          Use as informações do usuário para personalizar a conversa.
          Seja conciso e direto, mantenha as respostas curtas.
          Informações do usuário: ${JSON.stringify(userInfo)}`
        },
        ...messages
      ],
    })

    const reply = completion.data.choices[0]?.message?.content

    return new Response(
      JSON.stringify({ reply }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
