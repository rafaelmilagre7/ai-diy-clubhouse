
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache para evitar requests desnecessários
let businessIdCache: string | null = null
let templatesCache: any[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para descobrir automaticamente o Business ID correto
async function discoverBusinessId(token: string): Promise<string | null> {
  console.log('🔍 Descobrindo Business ID automaticamente...')
  
  try {
    // Primeira tentativa: usar a API para obter informações do usuário
    const meResponse = await fetch('https://graph.facebook.com/v18.0/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (meResponse.ok) {
      const meData = await meResponse.json()
      console.log('👤 Dados do usuário:', meData)
      
      if (meData.id) {
        // Testar se o ID do usuário funciona para templates
        const testResponse = await fetch(
          `https://graph.facebook.com/v18.0/${meData.id}/message_templates?limit=1`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )
        
        if (testResponse.ok) {
          console.log(`✅ Business ID descoberto: ${meData.id}`)
          return meData.id
        }
      }
    }
    
    // Segunda tentativa: usar a API de contas de negócios
    const businessResponse = await fetch(
      'https://graph.facebook.com/v18.0/me/businesses',
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    
    if (businessResponse.ok) {
      const businessData = await businessResponse.json()
      console.log('🏢 Contas de negócio:', businessData)
      
      if (businessData.data && businessData.data.length > 0) {
        const businessId = businessData.data[0].id
        console.log(`✅ Business ID encontrado: ${businessId}`)
        return businessId
      }
    }
    
    console.log('⚠️ Não foi possível descobrir o Business ID automaticamente')
    return null
    
  } catch (error) {
    console.error('❌ Erro ao descobrir Business ID:', error)
    return null
  }
}

// Função para validar conectividade com mais detalhes
async function validateConnectivity(token: string, phoneNumberId: string) {
  const tests = []
  
  // Teste 1: Verificar Phone Number
  try {
    const phoneResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    
    const phoneData = await phoneResponse.json()
    
    tests.push({
      name: 'Phone Number Validation',
      success: phoneResponse.ok,
      status: phoneResponse.status,
      data: phoneData,
      latency: null
    })
  } catch (error) {
    tests.push({
      name: 'Phone Number Validation',
      success: false,
      error: error.message
    })
  }
  
  // Teste 2: Verificar permissões de token
  try {
    const debugResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    
    const debugData = await debugResponse.json()
    
    tests.push({
      name: 'Token Permissions',
      success: debugResponse.ok,
      status: debugResponse.status,
      data: debugData,
      scopes: debugData.data?.scopes || []
    })
  } catch (error) {
    tests.push({
      name: 'Token Permissions',
      success: false,
      error: error.message
    })
  }
  
  // Teste 3: Teste de latência
  const start = Date.now()
  try {
    await fetch('https://graph.facebook.com/v18.0/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const latency = Date.now() - start
    
    tests.push({
      name: 'API Latency',
      success: true,
      latency: `${latency}ms`,
      status: latency < 1000 ? 'Good' : latency < 3000 ? 'Fair' : 'Poor'
    })
  } catch (error) {
    tests.push({
      name: 'API Latency',
      success: false,
      error: error.message
    })
  }
  
  return tests
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

    // Verificar configuração básica e descobrir Business ID automaticamente
    if (action === 'check-config') {
      let discoveredBusinessId = null
      
      if (whatsappToken) {
        discoveredBusinessId = await discoverBusinessId(whatsappToken)
        if (discoveredBusinessId) {
          businessIdCache = discoveredBusinessId
          cacheTimestamp = Date.now()
        }
      }

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
        discoveredBusinessId,
        autoDiscoveryWorked: !!discoveredBusinessId,
        needsBusinessIdUpdate: discoveredBusinessId && discoveredBusinessId !== businessId
      }

      console.log('📋 Configuração WhatsApp:', config)

      return new Response(JSON.stringify({
        success: true,
        config,
        message: 'Configuração verificada e Business ID descoberto automaticamente'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Testar conectividade avançada com API do WhatsApp
    if (action === 'test-connectivity') {
      if (!whatsappToken || !phoneNumberId) {
        throw new Error('Token ou Phone Number ID não configurados')
      }

      console.log('🌐 Executando testes avançados de conectividade...')

      const connectivityTests = await validateConnectivity(whatsappToken, phoneNumberId)
      const overallSuccess = connectivityTests.every(test => test.success)

      return new Response(JSON.stringify({
        success: overallSuccess,
        tests: connectivityTests,
        summary: {
          total: connectivityTests.length,
          passed: connectivityTests.filter(t => t.success).length,
          failed: connectivityTests.filter(t => !t.success).length
        },
        message: overallSuccess ? 'Todos os testes de conectividade passaram' : 'Alguns testes falharam'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Descobrir automaticamente o Business ID e listar templates
    if (action === 'auto-discover') {
      if (!whatsappToken) {
        throw new Error('Token do WhatsApp não configurado')
      }

      console.log('🔍 Iniciando descoberta automática...')

      // Usar cache se disponível e válido
      if (businessIdCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        console.log('📦 Usando Business ID do cache:', businessIdCache)
        
        try {
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${businessIdCache}/message_templates`,
            { headers: { 'Authorization': `Bearer ${whatsappToken}` } }
          )
          
          if (response.ok) {
            const data = await response.json()
            return new Response(JSON.stringify({
              success: true,
              businessId: businessIdCache,
              templates: data.data || [],
              fromCache: true,
              message: `Business ID descoberto (cache): ${businessIdCache}`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
        } catch (error) {
          console.log('❌ Cache inválido, redescobrir...')
          businessIdCache = null
        }
      }

      // Descobrir novo Business ID
      const discoveredId = await discoverBusinessId(whatsappToken)
      
      if (!discoveredId) {
        // Fallback: tentar Business ID do env se não conseguir descobrir
        if (businessId) {
          console.log('🔄 Usando Business ID do .env como fallback')
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${businessId}/message_templates`,
            { headers: { 'Authorization': `Bearer ${whatsappToken}` } }
          )
          
          if (response.ok) {
            const data = await response.json()
            return new Response(JSON.stringify({
              success: true,
              businessId: businessId,
              templates: data.data || [],
              fallback: true,
              message: `Usando Business ID configurado: ${businessId}`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
        }
        
        return new Response(JSON.stringify({
          success: false,
          message: 'Não foi possível descobrir o Business ID automaticamente'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }

      // Buscar templates com o Business ID descoberto
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${discoveredId}/message_templates`,
          { headers: { 'Authorization': `Bearer ${whatsappToken}` } }
        )
        
        if (response.ok) {
          const data = await response.json()
          
          // Atualizar cache
          businessIdCache = discoveredId
          templatesCache = data.data || []
          cacheTimestamp = Date.now()
          
          return new Response(JSON.stringify({
            success: true,
            businessId: discoveredId,
            templates: data.data || [],
            message: `Business ID descoberto: ${discoveredId}`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      } catch (error) {
        console.error('❌ Erro ao buscar templates:', error)
      }

      return new Response(JSON.stringify({
        success: false,
        message: 'Business ID descoberto mas não foi possível buscar templates'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
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
