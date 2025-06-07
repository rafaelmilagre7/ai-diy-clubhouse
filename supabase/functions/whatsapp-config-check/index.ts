
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
    const { action, templateName, phoneNumber } = await req.json()

    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

    console.log(`🔍 Ação solicitada: ${action}`)

    if (action === 'check_config') {
      const result = {
        token: { valid: false, message: '' },
        phoneId: { valid: false, message: '' },
        connectivity: { valid: false, message: '' }
      }

      // Verificar token
      if (!whatsappToken) {
        result.token.message = 'WHATSAPP_ACCESS_TOKEN não configurado'
      } else if (whatsappToken.length < 100) {
        result.token.message = 'Token parece ser muito curto (possível erro)'
      } else {
        result.token.valid = true
        result.token.message = `Token configurado (${whatsappToken.substring(0, 20)}...)`
      }

      // Verificar Phone Number ID
      if (!phoneNumberId) {
        result.phoneId.message = 'WHATSAPP_PHONE_NUMBER_ID não configurado'
      } else if (!/^\d+$/.test(phoneNumberId)) {
        result.phoneId.message = 'Phone Number ID deve conter apenas números'
      } else {
        result.phoneId.valid = true
        result.phoneId.message = `Phone Number ID: ${phoneNumberId}`
      }

      // Testar conectividade
      if (result.token.valid && result.phoneId.valid) {
        try {
          const testResponse = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}`,
            {
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
              },
            }
          )

          if (testResponse.ok) {
            result.connectivity.valid = true
            result.connectivity.message = 'Conectividade OK - API acessível'
          } else {
            result.connectivity.message = `Erro HTTP ${testResponse.status}: ${await testResponse.text()}`
          }
        } catch (error) {
          result.connectivity.message = `Erro de conectividade: ${error.message}`
        }
      } else {
        result.connectivity.message = 'Não é possível testar (token ou phone ID inválidos)'
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list_templates') {
      if (!whatsappToken) {
        throw new Error('Token do WhatsApp não configurado')
      }

      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')}/message_templates`,
          {
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Erro ao listar templates: ${response.status}`)
        }

        const data = await response.json()
        return new Response(JSON.stringify({ templates: data.data || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (error) {
        return new Response(JSON.stringify({ 
          templates: [],
          error: error.message 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    if (action === 'send_hello_world') {
      if (!whatsappToken || !phoneNumberId) {
        throw new Error('Configurações do WhatsApp não encontradas')
      }

      const messageData = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US"
          }
        }
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        }
      )

      const result = await response.json()

      return new Response(JSON.stringify({
        success: response.ok,
        result,
        error: response.ok ? null : result.error?.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação não reconhecida' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })

  } catch (error) {
    console.error('❌ Erro na função de debug:', error)

    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
