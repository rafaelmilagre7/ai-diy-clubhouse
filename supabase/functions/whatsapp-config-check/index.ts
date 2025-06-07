
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    let action, phone, templateName, businessIdToTest
    
    try {
      const parsed = JSON.parse(body)
      action = parsed.action
      phone = parsed.phone
      templateName = parsed.templateName
      businessIdToTest = parsed.businessIdToTest
    } catch (e) {
      console.error('❌ Erro ao parsear JSON:', e)
      throw new Error('JSON inválido')
    }

    console.log('🔍 WhatsApp Debug - Ação:', action)

    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const businessId = Deno.env.get('WHATSAPP_BUSINESS_ID')

    // Verificar configuração básica
    if (action === 'check-config') {
      const config = {
        hasToken: !!whatsappToken,
        hasPhoneNumberId: !!phoneNumberId,
        hasBusinessId: !!businessId,
        tokenLength: whatsappToken ? whatsappToken.length : 0,
        phoneNumberIdLength: phoneNumberId ? phoneNumberId.length : 0,
        businessIdLength: businessId ? businessId.length : 0,
        tokenMasked: whatsappToken ? `${whatsappToken.substring(0, 10)}...` : null,
        phoneNumberIdMasked: phoneNumberId ? `${phoneNumberId.substring(0, 6)}...` : null,
        businessIdMasked: businessId ? `${businessId.substring(0, 6)}...` : null,
        currentBusinessId: businessId,
        suggestedBusinessId: '385516967985232' // Do print fornecido
      }

      console.log('📋 Configuração WhatsApp:', config)

      return new Response(JSON.stringify({
        success: true,
        config,
        message: 'Configuração verificada'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Testar conectividade com API do WhatsApp
    if (action === 'test-connectivity') {
      if (!whatsappToken || !phoneNumberId) {
        throw new Error('Token ou Phone Number ID não configurados')
      }

      console.log('🌐 Testando conectividade com WhatsApp API...')

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      console.log('📡 Resposta da API WhatsApp:', data)

      return new Response(JSON.stringify({
        success: response.ok,
        status: response.status,
        data,
        message: response.ok ? 'Conectividade OK' : 'Erro de conectividade'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Testar diferentes Business IDs para templates
    if (action === 'test-business-ids') {
      if (!whatsappToken) {
        throw new Error('Token do WhatsApp não configurado')
      }

      const businessIdsToTest = [
        { id: businessId, label: 'Business ID Atual (do .env)' },
        { id: '385516967985232', label: 'Business ID do Print' },
        { id: '385471239079413', label: 'Business ID Alternativo' }
      ]

      const results = []

      for (const businessIdTest of businessIdsToTest) {
        if (!businessIdTest.id) continue

        console.log(`🧪 Testando Business ID: ${businessIdTest.id} (${businessIdTest.label})`)

        try {
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${businessIdTest.id}/message_templates`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
                'Content-Type': 'application/json',
              },
            }
          )

          const data = await response.json()

          results.push({
            businessId: businessIdTest.id,
            label: businessIdTest.label,
            success: response.ok,
            status: response.status,
            templatesFound: response.ok ? (data.data ? data.data.length : 0) : 0,
            error: response.ok ? null : data.error,
            templates: response.ok ? (data.data || []).slice(0, 5) : null // Primeiros 5 templates
          })

          console.log(`📊 Resultado ${businessIdTest.label}: ${response.ok ? 'Sucesso' : 'Erro'} - ${response.ok ? data.data?.length || 0 : 'N/A'} templates`)

        } catch (error) {
          results.push({
            businessId: businessIdTest.id,
            label: businessIdTest.label,
            success: false,
            error: error.message,
            templatesFound: 0
          })
          console.log(`❌ Erro ao testar ${businessIdTest.label}: ${error.message}`)
        }
      }

      return new Response(JSON.stringify({
        success: true,
        results,
        message: `Testados ${results.length} Business IDs`,
        recommendation: results.find(r => r.success && r.templatesFound > 0)?.businessId || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Listar templates aprovados usando Business ID específico ou padrão
    if (action === 'list-templates') {
      if (!whatsappToken) {
        throw new Error('Token do WhatsApp não configurado')
      }

      const businessIdToUse = businessIdToTest || businessId

      if (!businessIdToUse) {
        throw new Error('Business ID não configurado')
      }

      console.log(`📋 Buscando templates usando Business ID: ${businessIdToUse}`)

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${businessIdToUse}/message_templates`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      console.log('📄 Templates encontrados:', data)

      if (!response.ok) {
        console.error('❌ Erro ao buscar templates:', data)
        return new Response(JSON.stringify({
          success: false,
          error: data.error || 'Erro desconhecido',
          businessIdUsed: businessIdToUse,
          message: `Erro ${response.status}: ${data.error?.message || 'Não foi possível buscar templates'}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        })
      }

      return new Response(JSON.stringify({
        success: response.ok,
        templates: data.data || [],
        businessIdUsed: businessIdToUse,
        message: `${data.data?.length || 0} templates encontrados`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Enviar mensagem de teste
    if (action === 'send-test') {
      if (!whatsappToken || !phoneNumberId) {
        throw new Error('Configuração WhatsApp incompleta')
      }

      if (!phone) {
        throw new Error('Número de telefone é obrigatório')
      }

      const templateToUse = templateName || 'hello_world'

      console.log(`📱 Enviando teste para ${phone} com template ${templateToUse}`)

      // Limpar e formatar número brasileiro
      const cleanPhone = phone.replace(/\D/g, '')
      let formattedPhone = cleanPhone

      // Adicionar código do país se não tiver
      if (!formattedPhone.startsWith('55') && formattedPhone.length === 11) {
        formattedPhone = '55' + formattedPhone
      } else if (!formattedPhone.startsWith('55') && formattedPhone.length === 10) {
        formattedPhone = '55' + formattedPhone
      }

      const templateData = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateToUse,
          language: {
            code: "pt_BR"
          }
        }
      }

      // Adicionar parâmetros específicos para template de convite
      if (templateToUse === 'convite_acesso') {
        templateData.template.components = [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: "https://viverdeia.ai/convite/teste"
              }
            ]
          }
        ]
      }

      const response = await fetch(
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

      const result = await response.json()

      console.log('📨 Resultado do envio:', result)

      if (!response.ok) {
        console.error('❌ Erro no envio:', result)
        return new Response(JSON.stringify({
          success: false,
          error: result.error || 'Erro desconhecido',
          result,
          templateUsed: templateToUse,
          phoneFormatted: formattedPhone,
          message: `Erro ${response.status}: ${result.error?.message || 'Não foi possível enviar mensagem'}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        })
      }

      return new Response(JSON.stringify({
        success: response.ok,
        result,
        templateUsed: templateToUse,
        phoneFormatted: formattedPhone,
        message: response.ok ? 'Mensagem enviada com sucesso' : 'Erro no envio'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Ação não reconhecida')

  } catch (error) {
    console.error('❌ Erro no debug WhatsApp:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Erro durante o debug'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
