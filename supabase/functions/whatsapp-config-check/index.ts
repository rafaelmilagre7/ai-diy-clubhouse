import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache para evitar requests desnecessários
let businessIdCache: string | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
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

// Funções auxiliares para diagnósticos avançados
async function handleAdvancedDiagnostics(parsed: any, requestId: string, corsHeaders: any) {
  console.log(`🔍 [${requestId}] Executando diagnósticos avançados`)
  
  // Implementação futura de diagnósticos avançados
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Diagnósticos avançados não implementados ainda',
      requestId
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 501 }
  )
}

async function handleSupabaseSecretsCheck(requestId: string, corsHeaders: any) {
  console.log(`🔐 [${requestId}] Verificando secrets do Supabase`)
  
  const secrets = {
    whatsapp_token: !!Deno.env.get('WHATSAPP_ACCESS_TOKEN'),
    whatsapp_phone: !!Deno.env.get('WHATSAPP_PHONE_NUMBER_ID'),
    whatsapp_business: !!Deno.env.get('WHATSAPP_BUSINESS_ID')
  }
  
  return new Response(
    JSON.stringify({
      success: true,
      secrets,
      message: 'Verificação de secrets concluída',
      requestId
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
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
    if (parsed.action === 'search-templates' || parsed.search_templates) {
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