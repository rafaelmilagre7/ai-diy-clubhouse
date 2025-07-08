
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

    console.log('📱 [WHATSAPP] Iniciando envio de convite para:', phone?.substring(0, 5) + '***')
    console.log('📱 [WHATSAPP] URL do convite:', inviteUrl)
    console.log('📱 [WHATSAPP] Role:', roleName)
    console.log('📱 [WHATSAPP] Email:', email?.substring(0, 5) + '***')

    // Validar dados obrigatórios
    if (!phone || !inviteUrl) {
      console.error('❌ [WHATSAPP] Dados obrigatórios faltando:', { phone: !!phone, inviteUrl: !!inviteUrl })
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

    console.log('📱 [WHATSAPP] Telefone formatado:', formattedPhone)

    // Extrair nome do email ou usar um padrão
    const userName = senderName || (email ? email.split('@')[0].replace(/[._-]/g, ' ').trim() : 'Novo Membro')
    
    console.log('📱 [WHATSAPP] Nome do usuário para template:', userName)

    // Dados para o template do WhatsApp (template "convitevia" precisa de 2 parâmetros)
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
                text: userName
              },
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
    const whatsappToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID')

    if (!whatsappToken || !phoneNumberId) {
      console.error('❌ [WHATSAPP] Credenciais não configuradas:', { 
        hasToken: !!whatsappToken, 
        hasPhoneId: !!phoneNumberId 
      })
      throw new Error('Credenciais do WhatsApp Business não configuradas')
    }

    console.log('📱 [WHATSAPP] Enviando template via API...')
    console.log('📱 [WHATSAPP] Phone Number ID:', phoneNumberId)
    console.log('📱 [WHATSAPP] Template data:', JSON.stringify(templateData, null, 2))

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

    console.log('📱 [WHATSAPP] Resposta completa:', {
      status: whatsappResponse.status,
      statusText: whatsappResponse.statusText,
      result: whatsappResult
    })

    if (!whatsappResponse.ok) {
      const errorMsg = `Erro ${whatsappResponse.status}: ${whatsappResult.error?.message || whatsappResult.message || 'Erro desconhecido'}`
      console.error('❌ [WHATSAPP] Erro da API:', errorMsg)
      console.error('❌ [WHATSAPP] Detalhes do erro:', whatsappResult)
      throw new Error(errorMsg)
    }

    // Atualizar estatísticas do convite se tiver ID (não crítico)
    if (inviteId) {
      try {
        const { error: updateError } = await supabase.rpc('update_invite_send_attempt', {
          invite_id: inviteId
        })

        if (updateError) {
          console.error('⚠️ Erro ao atualizar estatísticas do convite (não crítico):', updateError)
        } else {
          console.log('✅ Estatísticas do convite atualizadas com sucesso')
        }
      } catch (statError) {
        console.error('⚠️ Erro não crítico ao atualizar estatísticas:', statError)
        // Não falhar o envio por causa das estatísticas
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
