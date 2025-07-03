import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Nova API para validação de configuração (usada pelo WhatsApp Debug Center)
async function handleNewConfigAPI(parsed: any, requestId: string, corsHeaders: any) {
  console.log(`🆕 [${requestId}] Processando nova API de configuração`)
  
  const { config } = parsed
  if (!config) {
    throw new Error('Objeto de configuração não fornecido')
  }

  console.log(`📋 [${requestId}] Configuração recebida:`, {
    hasPhoneNumberId: !!config.phone_number_id,
    hasAccessToken: !!config.access_token,
    hasBusinessAccountId: !!config.business_account_id
  })

  const diagnostics = {
    timestamp: new Date().toISOString(),
    results: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  }

  console.log('🧪 Iniciando diagnósticos...')

  // Diagnóstico 1: Validação Básica de Configuração
  const basicValidation = await validateBasicConfig(config)
  diagnostics.results.push(basicValidation)
  
  // Diagnóstico 2: Teste de Token de Acesso
  const tokenTest = await testAccessToken(config)
  diagnostics.results.push(tokenTest)
  
  // Diagnóstico 3: Verificação de Business Account
  const businessTest = await verifyBusinessAccount(config)
  diagnostics.results.push(businessTest)
  
  // Diagnóstico 4: Teste de Phone Number
  const phoneTest = await testPhoneNumber(config)
  diagnostics.results.push(phoneTest)

  // Calcular resumo
  diagnostics.summary.total = diagnostics.results.length
  diagnostics.results.forEach(result => {
    if (result.success) {
      diagnostics.summary.passed++
    } else {
      diagnostics.summary.failed++
    }
    if (result.warning) {
      diagnostics.summary.warnings++
    }
  })

  console.log(`✅ [${requestId}] Diagnósticos concluídos:`, diagnostics.summary)

  return new Response(
    JSON.stringify(diagnostics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Funções de validação básica
async function validateBasicConfig(config: any) {
  console.log('🔍 Validando configuração básica...')
  
  const result = {
    test: 'Validação Básica',
    success: true,
    details: [],
    warnings: [],
    errors: []
  }

  // Verificar campos obrigatórios
  if (!config.phone_number_id) {
    result.success = false
    result.errors.push('Phone Number ID não fornecido')
  } else if (config.phone_number_id.length < 10) {
    result.warnings.push('Phone Number ID parece muito curto')
  }

  if (!config.access_token) {
    result.success = false
    result.errors.push('Access Token não fornecido')
  } else if (config.access_token.length < 50) {
    result.warnings.push('Access Token parece muito curto')
  }

  if (!config.business_account_id) {
    result.warnings.push('Business Account ID não fornecido (pode ser descoberto automaticamente)')
  }

  result.details.push(`Phone Number ID: ${config.phone_number_id ? '✓' : '✗'}`)
  result.details.push(`Access Token: ${config.access_token ? '✓' : '✗'}`)
  result.details.push(`Business Account ID: ${config.business_account_id ? '✓' : '⚠️'}`)

  console.log('📋 Validação básica concluída:', result.success ? 'PASSOU' : 'FALHOU')
  return result
}

async function testAccessToken(config: any) {
  console.log('🔑 Testando Access Token...')
  
  const result = {
    test: 'Teste de Access Token',
    success: false,
    details: [],
    warnings: [],
    errors: []
  }

  if (!config.access_token) {
    result.errors.push('Access Token não fornecido')
    return result
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${config.access_token}`)
    const data = await response.json()

    if (response.ok) {
      result.success = true
      result.details.push(`Token válido para usuário: ${data.name || data.id}`)
      
      // Testar permissões específicas
      const debugResponse = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${config.access_token}&access_token=${config.access_token}`
      )
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json()
        const scopes = debugData.data?.scopes || []
        
        const requiredScopes = ['whatsapp_business_management', 'business_management']
        const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope))
        
        if (missingScopes.length > 0) {
          result.warnings.push(`Permissões em falta: ${missingScopes.join(', ')}`)
        }
        
        result.details.push(`Permissões: ${scopes.join(', ')}`)
      }
    } else {
      result.errors.push(`Token inválido: ${data.error?.message || 'Erro desconhecido'}`)
    }
  } catch (error) {
    result.errors.push(`Erro na verificação: ${error.message}`)
  }

  console.log('🔑 Teste de token concluído:', result.success ? 'PASSOU' : 'FALHOU')
  return result
}

async function verifyBusinessAccount(config: any) {
  console.log('🏢 Verificando Business Account...')
  
  const result = {
    test: 'Verificação de Business Account',
    success: false,
    details: [],
    warnings: [],
    errors: []
  }

  if (!config.access_token) {
    result.errors.push('Access Token necessário para verificação')
    return result
  }

  try {
    // Tentar buscar business accounts
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/businesses?access_token=${config.access_token}`
    )
    const data = await response.json()

    if (response.ok && data.data && data.data.length > 0) {
      result.success = true
      result.details.push(`${data.data.length} Business Account(s) encontrado(s)`)
      
      if (config.business_account_id) {
        const found = data.data.find((b: any) => b.id === config.business_account_id)
        if (found) {
          result.details.push(`Business Account configurado encontrado: ${found.name}`)
        } else {
          result.warnings.push('Business Account ID configurado não encontrado na lista')
        }
      } else {
        result.details.push(`Primeiro Business Account: ${data.data[0].name} (${data.data[0].id})`)
        result.warnings.push('Considere configurar o Business Account ID')
      }
    } else {
      result.warnings.push('Nenhum Business Account encontrado ou erro na busca')
      if (data.error) {
        result.errors.push(`Erro: ${data.error.message}`)
      }
    }
  } catch (error) {
    result.errors.push(`Erro na verificação: ${error.message}`)
  }

  console.log('🏢 Verificação de business concluída:', result.success ? 'PASSOU' : 'FALHOU')
  return result
}

async function testPhoneNumber(config: any) {
  console.log('📱 Testando Phone Number...')
  
  const result = {
    test: 'Teste de Phone Number',
    success: false,
    details: [],
    warnings: [],
    errors: []
  }

  if (!config.access_token || !config.phone_number_id) {
    result.errors.push('Access Token e Phone Number ID necessários')
    return result
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.phone_number_id}?access_token=${config.access_token}`
    )
    const data = await response.json()

    if (response.ok) {
      result.success = true
      result.details.push(`Phone Number válido: ${data.display_phone_number || data.id}`)
      
      if (data.verified_name) {
        result.details.push(`Nome verificado: ${data.verified_name}`)
      }
      
      if (data.code_verification_status) {
        result.details.push(`Status de verificação: ${data.code_verification_status}`)
      }
      
      if (data.quality_rating) {
        result.details.push(`Qualidade: ${data.quality_rating}`)
      }
    } else {
      result.errors.push(`Phone Number inválido: ${data.error?.message || 'Erro desconhecido'}`)
    }
  } catch (error) {
    result.errors.push(`Erro na verificação: ${error.message}`)
  }

  console.log('📱 Teste de phone concluído:', result.success ? 'PASSOU' : 'FALHOU')
  return result
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

// Nova função para lidar com diagnósticos avançados
async function handleAdvancedDiagnostics(parsed: any, requestId: string, corsHeaders: any) {
  console.log(`🔬 [${requestId}] Iniciando diagnóstico avançado com descoberta automática`)
  
  const { config } = parsed
  if (!config || !config.access_token) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Access Token é obrigatório para descoberta automática de Business ID',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    results: [],
    businessId: null,
    discoveryStrategies: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  }

  try {
    // 1. Executar diagnósticos padrão
    console.log(`📋 [${requestId}] Executando diagnósticos padrão...`)
    
    const basicValidation = await validateBasicConfig(config)
    diagnostics.results.push(basicValidation)
    
    const tokenTest = await testAccessToken(config)
    diagnostics.results.push(tokenTest)
    
    const businessTest = await verifyBusinessAccount(config)
    diagnostics.results.push(businessTest)
    
    const phoneTest = await testPhoneNumber(config)
    diagnostics.results.push(phoneTest)

    // 2. Descoberta automática de Business ID
    console.log(`🔍 [${requestId}] Iniciando descoberta automática de Business ID...`)
    
    const discoveryResult = await discoverBusinessIdAdvanced(config.access_token)
    diagnostics.discoveryStrategies = discoveryResult.strategies
    
    if (discoveryResult.businessId) {
      diagnostics.businessId = discoveryResult.businessId
      console.log(`✅ [${requestId}] Business ID descoberto: ${discoveryResult.businessId}`)
      
      // Adicionar resultado de descoberta aos diagnósticos
      diagnostics.results.push({
        test: 'Descoberta Automática de Business ID',
        success: true,
        details: [
          `Business ID descoberto: ${discoveryResult.businessId}`,
          `Estratégias testadas: ${discoveryResult.strategies.length}`,
          `Estratégia bem-sucedida: ${discoveryResult.strategies.find(s => s.success)?.name || 'N/A'}`
        ],
        warnings: [],
        errors: []
      })
    } else {
      console.log(`❌ [${requestId}] Falha na descoberta automática`)
      
      diagnostics.results.push({
        test: 'Descoberta Automática de Business ID',
        success: false,
        details: [`Estratégias testadas: ${discoveryResult.strategies.length}`],
        warnings: [
          'Não foi possível descobrir o Business ID automaticamente',
          'Verifique as permissões do token ou configure manualmente'
        ],
        errors: discoveryResult.strategies
          .filter(s => !s.success && s.error)
          .map(s => `${s.name}: ${s.error}`)
      })
    }

    // Calcular resumo
    diagnostics.summary.total = diagnostics.results.length
    diagnostics.results.forEach(result => {
      if (result.success) {
        diagnostics.summary.passed++
      } else {
        diagnostics.summary.failed++
      }
      if (result.warnings && result.warnings.length > 0) {
        diagnostics.summary.warnings++
      }
    })

    console.log(`✅ [${requestId}] Diagnóstico avançado concluído`)

    return new Response(
      JSON.stringify(diagnostics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`❌ [${requestId}] Erro no diagnóstico avançado:`, error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
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
    
    let parsed
    
    try {
      parsed = JSON.parse(body)
      console.log(`✅ [${requestId}] JSON parseado com sucesso`)
    } catch (e) {
      console.error(`❌ [${requestId}] Erro ao parsear JSON:`, e)
      throw new Error('JSON inválido')
    }

    console.log(`⏱️ [${requestId}] Tempo de parse: ${Date.now() - startTime}ms`)

    // Verificar se é requisição nova API (config object no body)
    if (typeof parsed === 'object' && parsed.config) {
      console.log(`🆕 [${requestId}] Detectada nova API com objeto config`)
      return await handleNewConfigAPI(parsed, requestId, corsHeaders)
    }

    // Verificar se é ação de diagnóstico avançado
    if (parsed.action === 'advanced_diagnostics') {
      console.log(`🔍 [${requestId}] Executando diagnóstico avançado com descoberta de Business ID`)
      return await handleAdvancedDiagnostics(parsed, requestId, corsHeaders)
    }

    // API legada para compatibilidade
    const { action, phone, templateName, businessIdToTest } = parsed
    console.log(`🔍 [${requestId}] WhatsApp Debug - Ação: ${action}`)

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

    throw new Error('Ação não reconhecida ou não implementada')

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico no debug WhatsApp:`, error)

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