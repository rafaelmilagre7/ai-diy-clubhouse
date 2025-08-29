
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
  email?: string;
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

    const { phone, inviteUrl, roleName, expiresAt, senderName, notes, inviteId, email }: WhatsAppInviteRequest = await req.json()

    console.log('🚨 [WHATSAPP-OPTIMIZED] Processamento iniciado:', {
      phone: phone?.substring(0, 5) + '***',
      hasInviteUrl: !!inviteUrl,
      roleName,
      timestamp: new Date().toISOString()
    })

    // VALIDAÇÃO RÁPIDA
    if (!phone || !inviteUrl) {
      console.error('❌ [WHATSAPP] Dados obrigatórios faltando:', { phone: !!phone, inviteUrl: !!inviteUrl })
      throw new Error('Telefone e URL do convite são obrigatórios')
    }

    // VERIFICAR CREDENCIAIS
    const whatsappToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID')

    if (!whatsappToken || !phoneNumberId) {
      throw new Error('Credenciais WhatsApp não configuradas')
    }

    // PROCESSAR TELEFONE
    let formattedPhone = phone.replace(/\D/g, '')
    
    if (phone.includes('|')) {
      const [dialCode, phoneNumber] = phone.split('|')
      const cleanDialCode = dialCode.replace('+', '')
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
      formattedPhone = cleanDialCode + cleanPhoneNumber
    } else if (formattedPhone.length > 11) {
      formattedPhone = formattedPhone
    } else if (formattedPhone.length === 11 || formattedPhone.length === 10) {
      formattedPhone = '55' + formattedPhone
    }

    // PREPARAR TEMPLATE
    const userName = email ? email.split('@')[0].replace(/[._-]/g, ' ').trim() : 'Novo Membro'
    
    const templateData = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "convitevia",
        language: { code: "pt_BR" },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: userName },
            { type: "text", text: inviteUrl }
          ]
        }]
      }
    }

    console.log('📱 [WHATSAPP] Enviando template...')

    // ENVIAR COM TIMEOUT OTIMIZADO (15s)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    let whatsappResponse
    try {
      whatsappResponse = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
          signal: controller.signal
        }
      )
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout na API do WhatsApp (15s)')
      }
      throw new Error(`Erro de conectividade: ${fetchError.message}`)
    } finally {
      clearTimeout(timeoutId)
    }

    const whatsappResult = await whatsappResponse.json()

    if (!whatsappResponse.ok) {
      const errorMsg = `Erro ${whatsappResponse.status}: ${whatsappResult.error?.message || whatsappResult.message || 'Erro desconhecido'}`
      console.error('❌ [WHATSAPP] Erro da API:', errorMsg)
      throw new Error(errorMsg)
    }

    const messageId = whatsappResult.messages?.[0]?.id
    console.log('✅ [WHATSAPP] Mensagem enviada:', messageId)

    // ATUALIZAR ESTATÍSTICAS EM BACKGROUND (não aguardar)
    if (inviteId) {
      setTimeout(async () => {
        try {
          await supabase.from('invite_deliveries').insert({
            invite_id: inviteId,
            channel: 'whatsapp',
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_id: messageId,
            metadata: { 
              phone: formattedPhone,
              message_id: messageId,
              template_used: 'convitevia'
            }
          })

          await supabase.rpc('update_invite_send_attempt', {
            invite_id: inviteId
          })

          console.log('✅ [BACKGROUND] Estatísticas atualizadas')
        } catch (statError) {
          console.error('⚠️ [BACKGROUND] Erro ao atualizar:', statError)
        }
      }, 100)
    }

    // RESPOSTA IMEDIATA
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
    console.error('❌ [WHATSAPP] Erro:', error)

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
