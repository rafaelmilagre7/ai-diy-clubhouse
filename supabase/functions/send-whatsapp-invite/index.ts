
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

    console.log('🚨 [WHATSAPP-DEBUG] FUNÇÃO CHAMADA! Dados recebidos:', {
      phone: phone?.substring(0, 5) + '***',
      hasInviteUrl: !!inviteUrl,
      roleName,
      email: email?.substring(0, 5) + '***',
      timestamp: new Date().toISOString()
    })

    console.log('📱 [WHATSAPP] Iniciando envio de convite para:', phone?.substring(0, 5) + '***')
    console.log('📱 [WHATSAPP] URL do convite:', inviteUrl)
    console.log('📱 [WHATSAPP] Role:', roleName)
    console.log('📱 [WHATSAPP] Email:', email?.substring(0, 5) + '***')

    // Validar dados obrigatórios
    if (!phone || !inviteUrl) {
      console.error('❌ [WHATSAPP] Dados obrigatórios faltando:', { phone: !!phone, inviteUrl: !!inviteUrl })
      throw new Error('Telefone e URL do convite são obrigatórios')
    }

    // Processar número de telefone internacional
    let formattedPhone = phone.replace(/\D/g, '')
    
    // Se o telefone está no formato internacional "+dialCode|phoneNumber"
    if (phone.includes('|')) {
      const [dialCode, phoneNumber] = phone.split('|')
      const cleanDialCode = dialCode.replace('+', '')
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
      formattedPhone = cleanDialCode + cleanPhoneNumber
    }
    // Se já tem código de país (número longo), usar como está
    else if (formattedPhone.length > 11) {
      // Já tem código do país
      formattedPhone = formattedPhone
    }
    // Se é número brasileiro sem código
    else if (formattedPhone.length === 11 || formattedPhone.length === 10) {
      formattedPhone = '55' + formattedPhone
    }

    console.log('📱 [WHATSAPP] Telefone formatado:', formattedPhone)

    // Extrair nome do email da pessoa CONVIDADA (não do sender)
    const userName = email ? email.split('@')[0].replace(/[._-]/g, ' ').trim() : 'Novo Membro'
    
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

    // Verificar credenciais do Supabase Secrets
    const whatsappToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID')

    console.log('🔑 [WHATSAPP] Verificação de credenciais:', { 
      hasToken: !!whatsappToken, 
      tokenLength: whatsappToken?.length,
      hasPhoneId: !!phoneNumberId,
      phoneIdLength: phoneNumberId?.length
    })

    if (!whatsappToken || !phoneNumberId) {
      console.error('❌ [WHATSAPP] Credenciais não configuradas no Supabase Secrets:', { 
        hasToken: !!whatsappToken, 
        hasPhoneId: !!phoneNumberId 
      })
      
      // Registrar tentativa falhada para auditoria
      if (inviteId) {
        try {
          await supabase.from('invite_deliveries').insert({
            invite_id: inviteId,
            channel: 'whatsapp',
            status: 'failed',
            error_message: 'Credenciais WhatsApp não configuradas no Supabase Secrets',
            metadata: { phone: formattedPhone, error_type: 'missing_credentials' }
          })
        } catch (logError) {
          console.error('⚠️ Erro ao registrar falha:', logError)
        }
      }
      
      throw new Error('Credenciais do WhatsApp Business não configuradas no Supabase Secrets. Configure WHATSAPP_BUSINESS_TOKEN e WHATSAPP_BUSINESS_PHONE_ID nos Edge Function Secrets.')
    }

    console.log('📱 [WHATSAPP] Enviando template via API...')
    console.log('📱 [WHATSAPP] Phone Number ID:', phoneNumberId)
    console.log('📱 [WHATSAPP] Template data:', JSON.stringify(templateData, null, 2))

    // Criar timeout e abort controller para evitar travamentos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos

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
      
      // Verificar se foi timeout ou erro de rede
      if (fetchError.name === 'AbortError') {
        console.error('❌ [WHATSAPP] Timeout na requisição (30s)')
        throw new Error('Timeout na API do WhatsApp - tente novamente')
      }
      
      console.error('❌ [WHATSAPP] Erro de conectividade:', fetchError.message)
      throw new Error(`Erro de conectividade: ${fetchError.message}`)
    } finally {
      clearTimeout(timeoutId)
    }

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
      
      // Registrar falha detalhada para auditoria
      if (inviteId) {
        try {
          await supabase.from('invite_deliveries').insert({
            invite_id: inviteId,
            channel: 'whatsapp',
            status: 'failed',
            error_message: errorMsg,
            metadata: { 
              phone: formattedPhone, 
              http_status: whatsappResponse.status,
              api_error: whatsappResult,
              error_type: 'api_error'
            }
          })
        } catch (logError) {
          console.error('⚠️ Erro ao registrar falha da API:', logError)
        }
      }
      
      throw new Error(errorMsg)
    }

    // Registrar sucesso e atualizar estatísticas
    const messageId = whatsappResult.messages?.[0]?.id

    if (inviteId) {
      try {
        // Registrar entrega bem-sucedida
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

        // Atualizar estatísticas do convite
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
