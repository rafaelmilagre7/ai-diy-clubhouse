
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

// Diagnóstico avançado de permissões do token
async function diagnosisTokenPermissions(token: string) {
  console.log('🔍 Analisando permissões detalhadas do token...')
  
  const analysis = {
    isValid: false,
    permissions: [],
    missingPermissions: [],
    type: 'unknown',
    expiresAt: null,
    scopes: [],
    details: null,
    hasBusinessAccess: false,
    hasWhatsAppAccess: false
  }
  
  try {
    // 1. Verificar detalhes do token
    const debugResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`
    )
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json()
      console.log('🔍 Debug token data:', debugData)
      
      if (debugData.data) {
        analysis.isValid = debugData.data.is_valid
        analysis.permissions = debugData.data.scopes || []
        analysis.expiresAt = debugData.data.expires_at
        analysis.type = debugData.data.type
        analysis.scopes = debugData.data.scopes || []
        analysis.details = debugData.data
        
        // Verificar permissões específicas
        const requiredPerms = ['whatsapp_business_management', 'business_management', 'pages_messaging']
        analysis.missingPermissions = requiredPerms.filter(perm => !analysis.permissions.includes(perm))
        
        analysis.hasBusinessAccess = analysis.permissions.includes('business_management')
        analysis.hasWhatsAppAccess = analysis.permissions.includes('whatsapp_business_management')
      }
    }
    
    console.log('📊 Análise de permissões:', analysis)
    return analysis
    
  } catch (error) {
    console.error('❌ Erro na análise de permissões:', error)
    return analysis
  }
}

// Estratégias múltiplas para descoberta de Business ID
async function discoverBusinessIdAdvanced(token: string) {
  console.log('🔍 Iniciando descoberta avançada de Business ID...')
  
  const strategies = [
    { name: 'API /me/businesses', attempt: discoverViaBusinesses },
    { name: 'API /me direct ID', attempt: discoverViaUserMe },
    { name: 'WhatsApp Business Accounts', attempt: discoverViaWhatsAppAccounts },
    { name: 'Pages API', attempt: discoverViaPages },
    { name: 'Owned Apps', attempt: discoverViaOwnedApps }
  ]
  
  const results = []
  
  for (const strategy of strategies) {
    console.log(`🎯 Tentando estratégia: ${strategy.name}`)
    
    try {
      const startTime = Date.now()
      const result = await strategy.attempt(token)
      const duration = Date.now() - startTime
      
      const strategyResult = {
        name: strategy.name,
        success: !!result,
        businessId: result,
        duration: `${duration}ms`,
        error: null
      }
      
      results.push(strategyResult)
      
      if (result) {
        console.log(`✅ Sucesso com ${strategy.name}: ${result}`)
        return { businessId: result, strategies: results }
      }
      
    } catch (error) {
      console.log(`❌ Falha em ${strategy.name}:`, error.message)
      results.push({
        name: strategy.name,
        success: false,
        businessId: null,
        duration: '0ms',
        error: error.message
      })
    }
  }
  
  console.log('⚠️ Todas as estratégias falharam')
  return { businessId: null, strategies: results }
}

// Estratégia 1: Via /me/businesses
async function discoverViaBusinesses(token: string) {
  const response = await fetch('https://graph.facebook.com/v18.0/me/businesses', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (response.ok) {
    const data = await response.json()
    if (data.data && data.data.length > 0) {
      return data.data[0].id
    }
  }
  
  return null
}

// Estratégia 2: Via /me direto
async function discoverViaUserMe(token: string) {
  const response = await fetch('https://graph.facebook.com/v18.0/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (response.ok) {
    const data = await response.json()
    if (data.id) {
      // Testar se funciona para templates
      const testResponse = await fetch(
        `https://graph.facebook.com/v18.0/${data.id}/message_templates?limit=1`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      if (testResponse.ok) {
        return data.id
      }
    }
  }
  
  return null
}

// Estratégia 3: Via WhatsApp Business Accounts
async function discoverViaWhatsAppAccounts(token: string) {
  const response = await fetch('https://graph.facebook.com/v18.0/me/businesses?fields=owned_whatsapp_business_accounts', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (response.ok) {
    const data = await response.json()
    if (data.data && data.data.length > 0) {
      const business = data.data.find(b => b.owned_whatsapp_business_accounts?.data?.length > 0)
      if (business) {
        return business.id
      }
    }
  }
  
  return null
}

// Estratégia 4: Via Pages
async function discoverViaPages(token: string) {
  const response = await fetch('https://graph.facebook.com/v18.0/me/accounts', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (response.ok) {
    const data = await response.json()
    if (data.data && data.data.length > 0) {
      // Pegar a primeira página e tentar usar seu ID
      return data.data[0].id
    }
  }
  
  return null
}

// Estratégia 5: Via Owned Apps
async function discoverViaOwnedApps(token: string) {
  const response = await fetch('https://graph.facebook.com/v18.0/me/applications/developer', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  if (response.ok) {
    const data = await response.json()
    if (data.data && data.data.length > 0) {
      return data.data[0].id
    }
  }
  
  return null
}

// Testes de conectividade avançados e categorizados
async function validateConnectivityAdvanced(token: string, phoneNumberId: string) {
  console.log('🌐 Iniciando testes avançados de conectividade...')
  
  const tests = []
  
  // CATEGORIA 1: Validação de Token
  console.log('🔐 Categoria: Validação de Token')
  
  // Teste 1.1: Token Debug
  try {
    const start = Date.now()
    const debugResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`
    )
    const latency = Date.now() - start
    const debugData = await debugResponse.json()
    
    tests.push({
      category: 'Token Validation',
      name: 'Token Debug & Permissions',
      success: debugResponse.ok && debugData.data?.is_valid,
      status: debugResponse.status,
      data: debugData,
      latency: `${latency}ms`,
      scopes: debugData.data?.scopes || [],
      details: {
        isValid: debugData.data?.is_valid,
        type: debugData.data?.type,
        expiresAt: debugData.data?.expires_at,
        appId: debugData.data?.app_id
      }
    })
  } catch (error) {
    tests.push({
      category: 'Token Validation',
      name: 'Token Debug & Permissions',
      success: false,
      error: error.message
    })
  }
  
  // Teste 1.2: User Info
  try {
    const start = Date.now()
    const userResponse = await fetch('https://graph.facebook.com/v18.0/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const latency = Date.now() - start
    const userData = await userResponse.json()
    
    tests.push({
      category: 'Token Validation',
      name: 'User Information Access',
      success: userResponse.ok,
      status: userResponse.status,
      data: userData,
      latency: `${latency}ms`,
      details: {
        userId: userData.id,
        name: userData.name
      }
    })
  } catch (error) {
    tests.push({
      category: 'Token Validation',
      name: 'User Information Access',
      success: false,
      error: error.message
    })
  }
  
  // CATEGORIA 2: WhatsApp API
  console.log('📱 Categoria: WhatsApp API')
  
  // Teste 2.1: Phone Number Validation
  try {
    const start = Date.now()
    const phoneResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    const latency = Date.now() - start
    const phoneData = await phoneResponse.json()
    
    tests.push({
      category: 'WhatsApp API',
      name: 'Phone Number Validation',
      success: phoneResponse.ok,
      status: phoneResponse.status,
      data: phoneData,
      latency: `${latency}ms`,
      details: {
        phoneNumberId: phoneNumberId,
        verified: phoneData.verified_name,
        status: phoneData.code_verification_status
      }
    })
  } catch (error) {
    tests.push({
      category: 'WhatsApp API',
      name: 'Phone Number Validation',
      success: false,
      error: error.message
    })
  }
  
  // Teste 2.2: Messages API Availability
  try {
    const start = Date.now()
    const messagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: "whatsapp" })
      }
    )
    const latency = Date.now() - start
    const responseData = await messagesResponse.json()
    
    // 400 é esperado pois não enviamos dados válidos, mas significa que a API está acessível
    const isAccessible = messagesResponse.status === 400 || messagesResponse.ok
    
    tests.push({
      category: 'WhatsApp API',
      name: 'Messages API Accessibility',
      success: isAccessible,
      status: messagesResponse.status,
      data: responseData,
      latency: `${latency}ms`,
      details: {
        accessible: isAccessible,
        errorCode: responseData.error?.code
      }
    })
  } catch (error) {
    tests.push({
      category: 'WhatsApp API',
      name: 'Messages API Accessibility',
      success: false,
      error: error.message
    })
  }
  
  // CATEGORIA 3: Performance & Network
  console.log('⚡ Categoria: Performance & Network')
  
  // Teste 3.1: API Latency
  const latencyTests = []
  for (let i = 0; i < 3; i++) {
    try {
      const start = Date.now()
      await fetch('https://graph.facebook.com/v18.0/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const latency = Date.now() - start
      latencyTests.push(latency)
    } catch (error) {
      latencyTests.push(null)
    }
  }
  
  const validLatencies = latencyTests.filter(l => l !== null)
  const avgLatency = validLatencies.length > 0 
    ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length)
    : null
  
  tests.push({
    category: 'Performance',
    name: 'API Latency (avg of 3 tests)',
    success: avgLatency !== null && avgLatency < 3000,
    latency: avgLatency ? `${avgLatency}ms` : 'Failed',
    data: { individual: latencyTests, average: avgLatency },
    details: {
      rating: avgLatency < 500 ? 'Excellent' : avgLatency < 1000 ? 'Good' : avgLatency < 3000 ? 'Fair' : 'Poor'
    }
  })
  
  // CATEGORIA 4: Business Access
  console.log('🏢 Categoria: Business Access')
  
  // Teste 4.1: Business Accounts Access
  try {
    const start = Date.now()
    const businessResponse = await fetch('https://graph.facebook.com/v18.0/me/businesses', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const latency = Date.now() - start
    const businessData = await businessResponse.json()
    
    tests.push({
      category: 'Business Access',
      name: 'Business Accounts Access',
      success: businessResponse.ok,
      status: businessResponse.status,
      data: businessData,
      latency: `${latency}ms`,
      details: {
        businessCount: businessData.data?.length || 0,
        hasBusinessAccess: businessResponse.ok && businessData.data?.length > 0
      }
    })
  } catch (error) {
    tests.push({
      category: 'Business Access',
      name: 'Business Accounts Access',
      success: false,
      error: error.message
    })
  }
  
  return tests
}

serve(async (req) => {
  // Gerar ID único para esta requisição para tracking
  const requestId = Math.random().toString(36).substr(2, 9)
  console.log(`🚀 [${requestId}] Nova requisição WhatsApp Debug iniciada`)
  
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] Resposta CORS enviada`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const startTime = Date.now()
    const body = await req.text()
    console.log(`📨 [${requestId}] Body recebido (${body.length} chars):`, body.substring(0, 200))
    
    let action, phone, templateName, businessIdToTest
    
    try {
      const parsed = JSON.parse(body)
      action = parsed.action
      phone = parsed.phone
      templateName = parsed.templateName
      businessIdToTest = parsed.businessIdToTest
      console.log(`✅ [${requestId}] JSON parseado com sucesso`)
    } catch (e) {
      console.error(`❌ [${requestId}] Erro ao parsear JSON:`, e)
      throw new Error('JSON inválido')
    }

    console.log(`🔍 [${requestId}] WhatsApp Debug - Ação: ${action}`)
    console.log(`⏱️ [${requestId}] Tempo de parse: ${Date.now() - startTime}ms`)

    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const businessId = Deno.env.get('WHATSAPP_BUSINESS_ID')

    // AÇÃO: Verificação de configuração com diagnóstico avançado
    if (action === 'check-config') {
      console.log(`⚙️ [${requestId}] Iniciando verificação avançada de configuração`)
      
      let discoveryResult = null
      let tokenAnalysis = null
      
      if (whatsappToken) {
        console.log(`🔍 [${requestId}] Token disponível, iniciando diagnósticos avançados`)
        
        // Diagnóstico de permissões do token
        tokenAnalysis = await diagnosisTokenPermissions(whatsappToken)
        console.log(`📊 [${requestId}] Análise de token concluída:`, tokenAnalysis)
        
        // Descoberta avançada de Business ID
        discoveryResult = await discoverBusinessIdAdvanced(whatsappToken)
        
        if (discoveryResult.businessId) {
          businessIdCache = discoveryResult.businessId
          cacheTimestamp = Date.now()
          console.log(`✅ [${requestId}] Business ID descoberto e armazenado: ${discoveryResult.businessId}`)
        } else {
          console.log(`⚠️ [${requestId}] Todas as estratégias de descoberta falharam`)
        }
      } else {
        console.log(`❌ [${requestId}] Token WhatsApp não configurado`)
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
        discoveredBusinessId: discoveryResult?.businessId,
        autoDiscoveryWorked: !!discoveryResult?.businessId,
        needsBusinessIdUpdate: discoveryResult?.businessId && discoveryResult.businessId !== businessId,
        
        // Novos campos para diagnóstico avançado
        tokenAnalysis,
        discoveryStrategies: discoveryResult?.strategies || [],
        permissionIssues: tokenAnalysis?.missingPermissions || [],
        tokenType: tokenAnalysis?.type,
        tokenExpiry: tokenAnalysis?.expiresAt,
        hasBusinessAccess: tokenAnalysis?.hasBusinessAccess,
        hasWhatsAppAccess: tokenAnalysis?.hasWhatsAppAccess
      }

      console.log(`📋 [${requestId}] Configuração avançada compilada`)
      console.log(`✅ [${requestId}] Diagnóstico completo`)

      return new Response(JSON.stringify({
        success: true,
        config,
        message: 'Diagnóstico avançado de configuração concluído'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // AÇÃO: Testes avançados de conectividade categorizados
    if (action === 'test-connectivity') {
      if (!whatsappToken || !phoneNumberId) {
        throw new Error('Token ou Phone Number ID não configurados')
      }

      console.log(`🌐 [${requestId}] Executando testes avançados e categorizados de conectividade...`)

      const connectivityTests = await validateConnectivityAdvanced(whatsappToken, phoneNumberId)
      
      // Análise por categoria
      const categories = {}
      connectivityTests.forEach(test => {
        const category = test.category || 'Other'
        if (!categories[category]) {
          categories[category] = { total: 0, passed: 0, failed: 0, tests: [] }
        }
        categories[category].total++
        categories[category].tests.push(test)
        if (test.success) {
          categories[category].passed++
        } else {
          categories[category].failed++
        }
      })
      
      const overallSuccess = connectivityTests.every(test => test.success)
      const criticalFailures = connectivityTests.filter(test => 
        !test.success && ['Token Validation', 'WhatsApp API'].includes(test.category)
      )
      
      console.log(`📊 [${requestId}] Testes concluídos - Sucesso geral: ${overallSuccess}`)
      console.log(`🔍 [${requestId}] Categorias analisadas:`, Object.keys(categories))

      return new Response(JSON.stringify({
        success: overallSuccess,
        tests: connectivityTests,
        categories,
        summary: {
          total: connectivityTests.length,
          passed: connectivityTests.filter(t => t.success).length,
          failed: connectivityTests.filter(t => !t.success).length,
          criticalFailures: criticalFailures.length
        },
        message: overallSuccess 
          ? 'Todos os testes de conectividade passaram' 
          : `${connectivityTests.filter(t => !t.success).length} teste(s) falharam`
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

      // Descobrir novo Business ID com estratégias avançadas
      const discoveryResult = await discoverBusinessIdAdvanced(whatsappToken)
      
      if (!discoveryResult.businessId) {
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
          `https://graph.facebook.com/v18.0/${discoveryResult.businessId}/message_templates`,
          { headers: { 'Authorization': `Bearer ${whatsappToken}` } }
        )
        
        if (response.ok) {
          const data = await response.json()
          
          // Atualizar cache
          businessIdCache = discoveryResult.businessId
          templatesCache = data.data || []
          cacheTimestamp = Date.now()
          
          return new Response(JSON.stringify({
            success: true,
            businessId: discoveryResult.businessId,
            templates: data.data || [],
            discoveryStrategies: discoveryResult.strategies,
            message: `Business ID descoberto: ${discoveryResult.businessId}`
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
    console.error(`❌ [${requestId}] Erro crítico no debug WhatsApp:`, error)
    console.error(`❌ [${requestId}] Stack trace:`, error.stack)
    console.error(`❌ [${requestId}] Tipo do erro:`, typeof error)
    console.error(`❌ [${requestId}] Dados do erro:`, JSON.stringify(error, Object.getOwnPropertyNames(error)))

    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Erro desconhecido',
      message: 'Erro durante o debug',
      requestId: requestId,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
