
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppInviteRequest {
  phone: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
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

    const { phone, inviteUrl, roleName, expiresAt, senderName, notes, inviteId }: WhatsAppInviteRequest = await req.json()

    console.log('📱 Iniciando envio de convite via WhatsApp para:', phone)

    // Validar dados obrigatórios
    if (!phone || !inviteUrl) {
      throw new Error('Telefone e URL do convite são obrigatórios')
    }

    // Limpar e validar número de telefone brasileiro
    const cleanPhone = phone.replace(/\D/g, '')
    let formattedPhone = cleanPhone

    // Adicionar código do país se não tiver
    if (!formattedPhone.startsWith('55') && formattedPhone.length === 11) {
      formattedPhone = '55' + formattedPhone
    } else if (!formattedPhone.startsWith('55') && formattedPhone.length === 10) {
      formattedPhone = '55' + formattedPhone
    }

    console.log('📱 Telefone formatado:', formattedPhone)

    // Dados para o template do WhatsApp
    const templateData = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "convitevia",
        language: {
          code: "pt_BR"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: inviteUrl
              }
            ]
          }
        ]
      }
    }

    // Enviar via WhatsApp Business API
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

    if (!whatsappToken || !phoneNumberId) {
      throw new Error('Credenciais do WhatsApp não configuradas')
    }

    console.log('📱 Enviando template via WhatsApp API...')

    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      }
    )

    const whatsappResult = await whatsappResponse.json()

    console.log('📱 Resposta do WhatsApp:', whatsappResult)

    if (!whatsappResponse.ok) {
      throw new Error(`Erro do WhatsApp API: ${whatsappResult.error?.message || 'Erro desconhecido'}`)
    }

    // Atualizar estatísticas do convite se tiver ID
    if (inviteId) {
      const { error: updateError } = await supabase.rpc('update_invite_send_attempt', {
        invite_id: inviteId
      })

      if (updateError) {
        console.error('⚠️ Erro ao atualizar estatísticas do convite:', updateError)
      }
    }

    const messageId = whatsappResult.messages?.[0]?.id

    console.log('✅ Convite enviado via WhatsApp com sucesso! Message ID:', messageId)

    return new Response(JSON.stringify({
      success: true,
      message: 'Convite enviado via WhatsApp com sucesso',
      whatsappId: messageId,
      strategy: 'whatsapp_template',
      method: 'whatsapp_business_api',
      phone: formattedPhone
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Erro ao enviar convite via WhatsApp:', error)

    return new Response(JSON.stringify({
      success: false,
      message: 'Erro ao enviar convite via WhatsApp',
      error: error.message,
      suggestion: 'Verifique o número de telefone e tente novamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
