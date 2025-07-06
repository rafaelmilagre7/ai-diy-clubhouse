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

  // Primeiro, tentar descoberta automática para melhorar validação básica
  let discoveredBusinessId = null
  if (config.access_token && !config.business_account_id) {
    console.log('🔍 Tentando descoberta automática de Business ID...')
    const discovery = await discoverBusinessIdAdvanced(config.access_token)
    discoveredBusinessId = discovery.businessId
    if (discoveredBusinessId) {
      console.log(`✅ Business ID descoberto: ${discoveredBusinessId}`)
    }
  }

  // Diagnóstico 1: Validação Básica de Configuração (com Business ID descoberto)
  const basicValidation = await validateBasicConfig(config, discoveredBusinessId)
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
async function validateBasicConfig(config: any, discoveredBusinessId?: string | null) {
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

  // Verificar Business ID - só mostrar aviso se não foi descoberto automaticamente
  if (!config.business_account_id && !discoveredBusinessId) {
    result.warnings.push('Business Account ID não fornecido (pode ser descoberto automaticamente)')
  } else if (discoveredBusinessId && !config.business_account_id) {
    result.details.push(`Business ID descoberto automaticamente: ${discoveredBusinessId}`)
  }

  result.details.push(`Phone Number ID: ${config.phone_number_id ? '✓' : '✗'}`)
  result.details.push(`Access Token: ${config.access_token ? '✓' : '✗'}`)
  result.details.push(`Business Account ID: ${config.business_account_id ? '✓' : (discoveredBusinessId ? '🔍' : '⚠️')}`)

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

// Nova função para buscar templates WhatsApp com Business ID manual
async function handleTemplatesSearch(parsed: any, requestId: string, corsHeaders: any) {
  console.log(`📋 [${requestId}] Iniciando busca avançada de templates WhatsApp`)
  
  try {
    const { config, filters = {} } = parsed
    
    if (!config?.access_token) {
      console.error(`❌ [${requestId}] Access Token não fornecido`)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Access Token é obrigatório para buscar templates',
          templates: [],
          stats: { total: 0, approved: 0, pending: 0, rejected: 0 },
          businessIds: [],
          timestamp: new Date().toISOString(),
          requestId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Usar Business ID manual com prioridade
    const manualBusinessId = config.manual_business_id
    const configBusinessId = config.business_account_id
    
    console.log(`🎯 [${requestId}] Business IDs disponíveis:`, {
      manual: manualBusinessId,
      config: configBusinessId
    })

    let allTemplates = []
    let discoveredBusinessIds = []
    let workingBusinessId = null

    // Estratégia 1: Tentar Business ID manual primeiro (prioridade)
    if (manualBusinessId) {
      console.log(`🎯 [${requestId}] Testando Business ID manual: ${manualBusinessId}`)
      const result = await searchTemplatesInBusiness(config.access_token, manualBusinessId, filters, requestId)
      
      discoveredBusinessIds.push({
        id: manualBusinessId,
        name: 'Manual (Prioritário)',
        templatesCount: result.templates.length,
        source: 'manual'
      })

      if (result.templates.length > 0) {
        console.log(`✅ [${requestId}] Sucesso com Business ID manual: ${result.templates.length} templates`)
        allTemplates = result.templates
        workingBusinessId = manualBusinessId
      }
    }

    // Estratégia 2: Se não achou no manual, tentar Business ID configurado
    if (allTemplates.length === 0 && configBusinessId && configBusinessId !== manualBusinessId) {
      console.log(`🎯 [${requestId}] Testando Business ID configurado: ${configBusinessId}`)
      const result = await searchTemplatesInBusiness(config.access_token, configBusinessId, filters, requestId)
      
      discoveredBusinessIds.push({
        id: configBusinessId,
        name: 'Configurado',
        templatesCount: result.templates.length,
        source: 'config'
      })

      if (result.templates.length > 0) {
        console.log(`✅ [${requestId}] Sucesso com Business ID configurado: ${result.templates.length} templates`)
        allTemplates = result.templates
        workingBusinessId = configBusinessId
      }
    }

    // Estratégia 3: Se ainda não achou, fazer descoberta automática
    if (allTemplates.length === 0) {
      console.log(`🔍 [${requestId}] Fazendo descoberta automática de Business IDs...`)
      const discovery = await discoverBusinessIdAdvanced(config.access_token)
      
      if (discovery.businessId) {
        console.log(`🎯 [${requestId}] Testando Business ID descoberto: ${discovery.businessId}`)
        const result = await searchTemplatesInBusiness(config.access_token, discovery.businessId, filters, requestId)
        
        discoveredBusinessIds.push({
          id: discovery.businessId,
          name: 'Descoberto Automaticamente',
          templatesCount: result.templates.length,
          source: 'discovered'
        })

        if (result.templates.length > 0) {
          console.log(`✅ [${requestId}] Sucesso com Business ID descoberto: ${result.templates.length} templates`)
          allTemplates = result.templates
          workingBusinessId = discovery.businessId
        }
      }

      // Adicionar todos os Business IDs testados durante a descoberta
      if (discovery.strategies) {
        discovery.strategies.forEach((strategy: any) => {
          if (strategy.businessId && strategy.businessId !== discovery.businessId) {
            discoveredBusinessIds.push({
              id: strategy.businessId,
              name: `Via ${strategy.name}`,
              templatesCount: 0, // Não testamos templates nestes
              source: 'strategy'
            })
          }
        })
      }
    }

    // Estratégia 4: Busca ampla em múltiplos Business IDs se ainda não encontrou
    if (allTemplates.length === 0) {
      console.log(`🔍 [${requestId}] Tentando busca ampla em múltiplos Business IDs...`)
      
      try {
        // Buscar todos os businesses acessíveis
        const businessResponse = await fetch(
          `https://graph.facebook.com/v18.0/me/businesses?access_token=${config.access_token}`
        )
        
        if (businessResponse.ok) {
          const businessData = await businessResponse.json()
          
          if (businessData.data && businessData.data.length > 0) {
            console.log(`🔍 [${requestId}] Encontrados ${businessData.data.length} Business IDs para testar`)
            
            // Testar cada Business ID
            for (const business of businessData.data.slice(0, 5)) { // Máximo 5 para evitar timeout
              if (business.id && !discoveredBusinessIds.find(b => b.id === business.id)) {
                console.log(`🎯 [${requestId}] Testando Business ID da lista: ${business.id}`)
                const result = await searchTemplatesInBusiness(config.access_token, business.id, filters, requestId)
                
                discoveredBusinessIds.push({
                  id: business.id,
                  name: business.name || 'Business Account',
                  templatesCount: result.templates.length,
                  source: 'business_list'
                })

                if (result.templates.length > 0 && allTemplates.length === 0) {
                  console.log(`✅ [${requestId}] Sucesso com Business ID da lista: ${result.templates.length} templates`)
                  allTemplates = result.templates
                  workingBusinessId = business.id
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ [${requestId}] Erro na busca ampla:`, error.message)
      }
    }

    // Calcular estatísticas
    const stats = {
      total: allTemplates.length,
      approved: allTemplates.filter((t: any) => t.status === 'APPROVED').length,
      pending: allTemplates.filter((t: any) => t.status === 'PENDING').length,
      rejected: allTemplates.filter((t: any) => t.status === 'REJECTED').length
    }

    console.log(`✅ [${requestId}] Busca concluída:`, {
      totalTemplates: allTemplates.length,
      businessIdsTested: discoveredBusinessIds.length,
      workingBusinessId
    })

    return new Response(
      JSON.stringify({
        success: true,
        templates: allTemplates,
        stats,
        businessIds: discoveredBusinessIds,
        workingBusinessId,
        timestamp: new Date().toISOString(),
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`❌ [${requestId}] Erro na busca de templates:`, error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        templates: [],
        stats: { total: 0, approved: 0, pending: 0, rejected: 0 },
        businessIds: [],
        timestamp: new Date().toISOString(),
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// Função para buscar templates em um Business ID específico
async function searchTemplatesInBusiness(accessToken: string, businessId: string, filters: any = {}, requestId: string) {
  console.log(`📋 [${requestId}] Buscando templates no Business ID: ${businessId}`)
  
  try {
    // Construir URL com filtros
    let url = `https://graph.facebook.com/v18.0/${businessId}/message_templates?access_token=${accessToken}&limit=100`
    
    // Adicionar filtros se especificados
    if (filters.status) {
      url += `&status=${filters.status}`
    }
    if (filters.category) {
      url += `&category=${filters.category}`
    }

    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.log(`❌ [${requestId}] Erro na busca (${businessId}):`, errorData.error?.message)
      return { templates: [], error: errorData.error?.message }
    }

    const data = await response.json()
    let templates = data.data || []

    // Aplicar filtro de busca por nome no cliente (pois a API não suporta)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      templates = templates.filter((template: any) => 
        template.name?.toLowerCase().includes(searchLower)
      )
    }

    console.log(`✅ [${requestId}] Encontrados ${templates.length} templates no Business ID: ${businessId}`)
    return { templates, error: null }

  } catch (error) {
    console.log(`❌ [${requestId}] Erro na busca no Business ID ${businessId}:`, error.message)
    return { templates: [], error: error.message }
  }
}
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Auto-descobrir Business ID se não fornecido
    let businessId = config.business_account_id
    if (!businessId) {
      console.log(`🔍 [${requestId}] Business ID não fornecido, tentando descoberta automática...`)
      try {
        const discovery = await discoverBusinessIdAdvanced(config.access_token)
        businessId = discovery.businessId
        if (!businessId) {
          console.error(`❌ [${requestId}] Não foi possível descobrir Business ID automaticamente`)
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Business ID não fornecido e não foi possível descobrir automaticamente',
              templates: [],
              stats: { total: 0, approved: 0, pending: 0, rejected: 0 },
              timestamp: new Date().toISOString(),
              requestId
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }
        console.log(`✅ [${requestId}] Business ID descoberto: ${businessId}`)
      } catch (discoveryError) {
        console.error(`❌ [${requestId}] Erro na descoberta de Business ID:`, discoveryError)
        return new Response(
          JSON.stringify({
            success: false,
            error: `Erro na descoberta de Business ID: ${discoveryError.message}`,
            templates: [],
            stats: { total: 0, approved: 0, pending: 0, rejected: 0 },
            timestamp: new Date().toISOString(),
            requestId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }
    
    console.log(`📋 [${requestId}] Buscando templates para Business ID: ${businessId}`)
    console.log(`📋 [${requestId}] Filtros aplicados:`, filters)
    
    // Buscar templates com a função melhorada
    const searchResult = await searchWhatsAppTemplates(config.access_token, businessId, filters)
    
    // Se não encontrar templates no Business ID principal, tentar descobrir outros
    if (!searchResult.success || searchResult.templates.length === 0) {
      console.log(`⚠️ [${requestId}] Nenhum template encontrado no Business ID ${businessId}, tentando descobrir outros...`)
      
      const multiDiscovery = await discoverMultipleBusinessIds(config.access_token)
      console.log(`🔍 [${requestId}] Descobertos ${multiDiscovery.totalFound} Business IDs para testar`)
      
      // Testar templates em cada Business ID descoberto
      const businessIdResults = []
      
      for (const altBusinessId of multiDiscovery.businessIds) {
        console.log(`🧪 [${requestId}] Testando templates no Business ID: ${altBusinessId}`)
        const altResult = await searchTemplatesForBusinessId(config.access_token, altBusinessId, {})
        
        businessIdResults.push({
          businessId: altBusinessId,
          success: altResult.success,
          templatesCount: altResult.templates?.length || 0,
          stats: altResult.stats,
          error: altResult.error,
          details: multiDiscovery.discoveryDetails.find(d => d.businessId === altBusinessId)
        })
        
        // Se encontrar templates, usar este resultado
        if (altResult.success && altResult.templates.length > 0) {
          console.log(`✅ [${requestId}] Encontrados ${altResult.templates.length} templates no Business ID: ${altBusinessId}`)
          
          // Aplicar filtros se fornecidos
          let filteredTemplates = altResult.templates
          if (filters.status && filters.status !== 'ALL') {
            filteredTemplates = filteredTemplates.filter(t => t.status === filters.status)
          }
          if (filters.name) {
            filteredTemplates = filteredTemplates.filter(t => 
              t.name.toLowerCase().includes(filters.name.toLowerCase())
            )
          }
          
          const enhancedResult = {
            ...altResult,
            templates: filteredTemplates,
            stats: {
              ...altResult.stats,
              filtered: filteredTemplates.length
            },
            debug: {
              originalBusinessId: businessId,
              discoveredBusinessId: altBusinessId,
              discoveryDetails: multiDiscovery.discoveryDetails,
              businessIdResults,
              filtersApplied: filters
            },
            requestId
          }
          
          console.log(`✅ [${requestId}] Busca de templates concluída com Business ID alternativo`)
          return new Response(
            JSON.stringify(enhancedResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
      
      // Se ainda não encontrou templates, retornar resultado detalhado
      searchResult.debug = {
        ...searchResult.debug,
        originalBusinessId: businessId,
        discoveryAttempted: true,
        discoveryDetails: multiDiscovery.discoveryDetails,
        businessIdResults,
        message: 'Nenhum template encontrado em nenhum Business ID descoberto'
      }
    }
    
    // Adicionar requestId ao resultado
    searchResult.requestId = requestId
    
    console.log(`✅ [${requestId}] Busca de templates concluída`)
    return new Response(
      JSON.stringify(searchResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error(`❌ [${requestId}] Erro inesperado na busca de templates:`, error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro inesperado: ${error.message}`,
        templates: [],
        stats: { total: 0, approved: 0, pending: 0, rejected: 0 },
        timestamp: new Date().toISOString(),
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

// Função melhorada para buscar templates do WhatsApp com descoberta automática
async function searchWhatsAppTemplates(token: string, businessId: string, filters: any = {}) {
  console.log(`📋 Buscando templates para Business ID: ${businessId}`)
  
  try {
    // 1. Primeiro, testar se o Business ID tem templates
    console.log(`🔍 Testando templates para Business ID: ${businessId}`)
    
    let url = `https://graph.facebook.com/v18.0/${businessId}/message_templates?limit=100`
    
    // Não aplicar filtros restritivos por padrão - buscar TODOS os templates primeiro
    console.log(`📡 URL da requisição: ${url}`)
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    console.log(`📥 Status da resposta: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error(`❌ Erro da API Facebook:`, errorData)
      
      // Se falhar, tentar descobrir outros Business IDs
      console.log(`🔍 Business ID ${businessId} falhou, tentando descobrir outros...`)
      const discovery = await discoverMultipleBusinessIds(token)
      
      if (discovery.businessIds.length > 0) {
        console.log(`🎯 Encontrados ${discovery.businessIds.length} Business IDs alternativos`)
        
        // Tentar cada Business ID encontrado
        for (const altBusinessId of discovery.businessIds) {
          if (altBusinessId !== businessId) {
            console.log(`🔄 Tentando Business ID alternativo: ${altBusinessId}`)
            const altResult = await searchTemplatesForBusinessId(token, altBusinessId, filters)
            if (altResult.success && altResult.templates.length > 0) {
              console.log(`✅ Sucesso com Business ID alternativo: ${altBusinessId}`)
              return altResult
            }
          }
        }
      }
      
      throw new Error(`Erro da API: ${errorData.error?.message || response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`📊 Resposta da API:`, {
      total: data.data?.length || 0,
      hasNext: !!data.paging?.next,
      sampleTemplates: data.data?.slice(0, 3)?.map(t => ({ name: t.name, status: t.status, category: t.category }))
    })
    
    let templates = data.data || []
    
    // Aplicar filtros DEPOIS de buscar todos os templates
    if (filters.status && filters.status !== 'ALL') {
      const originalCount = templates.length
      templates = templates.filter(t => t.status === filters.status)
      console.log(`🔍 Filtro por status '${filters.status}': ${originalCount} → ${templates.length}`)
    }
    
    if (filters.name) {
      const originalCount = templates.length
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(filters.name.toLowerCase())
      )
      console.log(`🔍 Filtro por nome '${filters.name}': ${originalCount} → ${templates.length}`)
    }
    
    if (filters.category && filters.category !== 'ALL') {
      const originalCount = templates.length
      templates = templates.filter(t => t.category === filters.category)
      console.log(`🔍 Filtro por categoria '${filters.category}': ${originalCount} → ${templates.length}`)
    }
    
    // Calcular estatísticas detalhadas
    const allTemplates = data.data || []
    const stats = {
      total: allTemplates.length,
      filtered: templates.length,
      approved: allTemplates.filter(t => t.status === 'APPROVED').length,
      pending: allTemplates.filter(t => t.status === 'PENDING').length,
      rejected: allTemplates.filter(t => t.status === 'REJECTED').length,
      categories: {
        MARKETING: allTemplates.filter(t => t.category === 'MARKETING').length,
        UTILITY: allTemplates.filter(t => t.category === 'UTILITY').length,
        AUTHENTICATION: allTemplates.filter(t => t.category === 'AUTHENTICATION').length
      },
      byStatus: {},
      templateNames: allTemplates.map(t => t.name)
    }
    
    // Contar por status
    allTemplates.forEach(t => {
      stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1
    })
    
    console.log(`📊 Templates encontrados: ${stats.total} total, ${stats.filtered} após filtros`)
    console.log(`📊 Por status: ${stats.approved} aprovados, ${stats.pending} pendentes, ${stats.rejected} rejeitados`)
    console.log(`📊 Nomes dos templates:`, stats.templateNames)
    
    return {
      success: true,
      businessId,
      templates,
      stats,
      debug: {
        url,
        businessIdTested: businessId,
        responseStatus: response.status,
        filtersApplied: filters,
        discoveryAttempted: false
      },
      pagination: {
        hasNext: !!data.paging?.next,
        next: data.paging?.next,
        total: templates.length
      },
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar templates:', error)
    return {
      success: false,
      error: error.message,
      businessId,
      templates: [],
      stats: { total: 0, approved: 0, pending: 0, rejected: 0 },
      debug: {
        businessIdTested: businessId,
        errorDetails: error.message
      },
      timestamp: new Date().toISOString()
    }
  }
}

// Nova função para buscar templates em um Business ID específico
async function searchTemplatesForBusinessId(token: string, businessId: string, filters: any = {}) {
  try {
    let url = `https://graph.facebook.com/v18.0/${businessId}/message_templates?limit=100`
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error?.message || response.statusText,
        businessId,
        templates: [],
        stats: { total: 0, approved: 0, pending: 0, rejected: 0 }
      }
    }
    
    const data = await response.json()
    const templates = data.data || []
    
    const stats = {
      total: templates.length,
      approved: templates.filter(t => t.status === 'APPROVED').length,
      pending: templates.filter(t => t.status === 'PENDING').length,
      rejected: templates.filter(t => t.status === 'REJECTED').length
    }
    
    return {
      success: true,
      businessId,
      templates,
      stats,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      businessId,
      templates: [],
      stats: { total: 0, approved: 0, pending: 0, rejected: 0 }
    }
  }
}

// Nova função para descobrir múltiplos Business IDs
async function discoverMultipleBusinessIds(token: string) {
  console.log('🔍 Descobrindo múltiplos Business IDs...')
  
  const businessIds = new Set<string>()
  const discoveryDetails = []
  
  const strategies = [
    {
      name: 'me/businesses', 
      url: 'https://graph.facebook.com/v18.0/me/businesses?fields=id,name,verification_status'
    },
    {
      name: 'me/accounts',
      url: 'https://graph.facebook.com/v18.0/me/accounts?fields=id,name'
    },
    {
      name: 'me (direct)',
      url: 'https://graph.facebook.com/v18.0/me'
    }
  ]
  
  for (const strategy of strategies) {
    try {
      console.log(`🎯 Tentando estratégia: ${strategy.name}`)
      
      const response = await fetch(strategy.url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (strategy.name === 'me (direct)' && data.id) {
          businessIds.add(data.id)
          discoveryDetails.push({
            strategy: strategy.name,
            success: true,
            businessId: data.id,
            name: data.name || 'Direct User ID'
          })
        } else if (data.data && Array.isArray(data.data)) {
          data.data.forEach((item: any) => {
            if (item.id) {
              businessIds.add(item.id)
              discoveryDetails.push({
                strategy: strategy.name,
                success: true,
                businessId: item.id,
                name: item.name || 'Unknown'
              })
            }
          })
        }
      } else {
        discoveryDetails.push({
          strategy: strategy.name,
          success: false,
          error: `${response.status} ${response.statusText}`
        })
      }
    } catch (error) {
      console.error(`❌ Erro em ${strategy.name}:`, error)
      discoveryDetails.push({
        strategy: strategy.name,
        success: false,
        error: error.message
      })
    }
  }
  
  const businessIdsArray = Array.from(businessIds)
  console.log(`📊 Descobertos ${businessIdsArray.length} Business IDs únicos:`, businessIdsArray)
  
  return {
    businessIds: businessIdsArray,
    discoveryDetails,
    totalFound: businessIdsArray.length
  }
}

// Nova função para testar secrets do Supabase
async function handleSupabaseSecretsCheck(requestId: string, corsHeaders: any) {
  console.log(`🔐 [${requestId}] Iniciando teste dos secrets do Supabase`)
  
  const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  const businessId = Deno.env.get('WHATSAPP_BUSINESS_ID')
  
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

  // Configuração baseada nos secrets do Supabase
  const config = {
    access_token: whatsappToken,
    phone_number_id: phoneNumberId,
    business_account_id: businessId
  }

  console.log(`📋 [${requestId}] Secrets disponíveis:`, {
    hasToken: !!whatsappToken,
    hasPhoneNumberId: !!phoneNumberId,
    hasBusinessId: !!businessId
  })

  // Executar os mesmos testes da nova API
  try {
    // Diagnóstico 1: Validação Básica
    const basicValidation = await validateBasicConfig(config)
    diagnostics.results.push(basicValidation)
    
    // Diagnóstico 2: Teste de Token de Acesso
    if (whatsappToken) {
      const tokenTest = await testAccessToken(config)
      diagnostics.results.push(tokenTest)
    } else {
      diagnostics.results.push({
        test: 'Teste de Access Token',
        success: false,
        details: [],
        warnings: [],
        errors: ['WHATSAPP_ACCESS_TOKEN não configurado no Supabase']
      })
    }
    
    // Diagnóstico 3: Verificação de Business Account
    if (whatsappToken) {
      const businessTest = await verifyBusinessAccount(config)
      diagnostics.results.push(businessTest)
    } else {
      diagnostics.results.push({
        test: 'Verificação de Business Account',
        success: false,
        details: [],
        warnings: [],
        errors: ['Access Token necessário para verificação']
      })
    }
    
    // Diagnóstico 4: Teste de Phone Number
    if (whatsappToken && phoneNumberId) {
      const phoneTest = await testPhoneNumber(config)
      diagnostics.results.push(phoneTest)
    } else {
      diagnostics.results.push({
        test: 'Teste de Phone Number',
        success: false,
        details: [],
        warnings: [],
        errors: [
          !whatsappToken ? 'WHATSAPP_ACCESS_TOKEN não configurado' : '',
          !phoneNumberId ? 'WHATSAPP_PHONE_NUMBER_ID não configurado' : ''
        ].filter(Boolean)
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

    console.log(`✅ [${requestId}] Teste de secrets concluído:`, diagnostics.summary)

    return new Response(
      JSON.stringify(diagnostics),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`❌ [${requestId}] Erro no teste de secrets:`, error)
    
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
    
    // Primeiro, tentar descoberta automática para melhorar validação básica
    let earlyDiscoveredBusinessId = null
    if (config.access_token && !config.business_account_id) {
      console.log(`🔍 [${requestId}] Descoberta prévia de Business ID...`)
      const discovery = await discoverBusinessIdAdvanced(config.access_token)
      earlyDiscoveredBusinessId = discovery.businessId
    }
    
    const basicValidation = await validateBasicConfig(config, earlyDiscoveredBusinessId)
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
  const requestId = Math.random().toString(36).substring(7)
  console.log(`🚀 [${requestId}] Nova requisição recebida`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    console.log(`📋 [${requestId}] Body da requisição:`, body)
    
    let parsed;
    try {
      parsed = JSON.parse(body)
    } catch (parseError) {
      console.error(`❌ [${requestId}] Erro no parse do JSON:`, parseError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'JSON inválido na requisição',
          requestId 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`🔍 [${requestId}] Dados parseados:`, JSON.stringify(parsed, null, 2))

    // Determinar o tipo de operação baseado nos parâmetros
    if (parsed.action === 'search-templates') {
      console.log(`📋 [${requestId}] Ação: Busca de templates`)
      return await handleTemplatesSearch(parsed, requestId, corsHeaders)
    } else if (parsed.config) {
      console.log(`⚙️ [${requestId}] Ação: Diagnósticos de configuração`)
      return await handleNewConfigAPI(parsed, requestId, corsHeaders)
    } else {
      // Fallback para compatibilidade com formato antigo
      console.log(`🔄 [${requestId}] Usando fallback para formato legado`)
      const legacyParsed = {
        config: {
          access_token: parsed.access_token,
          manual_business_id: parsed.manual_business_id,
          business_account_id: parsed.business_account_id
        }
      }
      
      if (parsed.search_templates) {
        return await handleTemplatesSearch({ 
          ...legacyParsed, 
          action: 'search-templates' 
        }, requestId, corsHeaders)
      } else {
        return await handleNewConfigAPI(legacyParsed, requestId, corsHeaders)
      }
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erro geral:`, error)
    return new Response(
      JSON.stringify({
        success: false,
        error: `Erro interno: ${error.message}`,
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
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

    // Verificar ações específicas primeiro (para evitar conflict com verificação genérica de config)
    
    // Verificar se é ação de busca de templates
    if (parsed.action === 'search-templates' || parsed.search_templates) {
      console.log(`📋 [${requestId}] Executando busca de templates WhatsApp`)
      return await handleTemplatesSearch(parsed, requestId, corsHeaders)
    }

    // Verificar se é ação de diagnóstico avançado
    if (parsed.action === 'advanced_diagnostics') {
      console.log(`🔍 [${requestId}] Executando diagnóstico avançado com descoberta de Business ID`)
      return await handleAdvancedDiagnostics(parsed, requestId, corsHeaders)
    }

    // Verificar se é ação de teste dos secrets do Supabase
    if (parsed.action === 'check-config') {
      console.log(`🔐 [${requestId}] Testando secrets do Supabase`)
      return await handleSupabaseSecretsCheck(requestId, corsHeaders)
    }

    // Verificar se é requisição nova API (config object no body) - como fallback
    if (typeof parsed === 'object' && parsed.config) {
      console.log(`🆕 [${requestId}] Detectada nova API com objeto config`)
      return await handleNewConfigAPI(parsed, requestId, corsHeaders)
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