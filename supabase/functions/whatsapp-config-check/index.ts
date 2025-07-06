import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const requestBody = await req.json()
    const { action = 'check', testPhone } = requestBody

    console.log('🔍 [WHATSAPP-CHECK] Ação solicitada:', action)

    // Ação: Verificar configuração completa do Supabase
    if (action === 'check') {
      const diagnostics = await runCompleteDiagnostics()
      return new Response(JSON.stringify(diagnostics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Ação: Verificar template específico
    if (action === 'check-template') {
      const templateStatus = await checkConviteTemplate()
      return new Response(JSON.stringify(templateStatus), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Ação: Testar envio real
    if (action === 'test-send') {
      const testResult = await testWhatsAppSending(testPhone)
      return new Response(JSON.stringify(testResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Ação: Buscar logs recentes
    if (action === 'get-logs') {
      const logs = await getRecentWhatsAppLogs()
      return new Response(JSON.stringify(logs), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Ação não reconhecida' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })

  } catch (error) {
    console.error('❌ [WHATSAPP-CHECK] Erro:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// Função principal de diagnósticos
async function runCompleteDiagnostics() {
  console.log('🔍 Iniciando diagnósticos completos...')
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    overall_status: 'unknown',
    credentials: await checkSupabaseCredentials(),
    whatsapp_api: null,
    template_status: null,
    phone_number: null,
    summary: {
      total_checks: 4,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  }

  // Se as credenciais estão OK, testar APIs
  if (diagnostics.credentials.success) {
    diagnostics.whatsapp_api = await testWhatsAppAPI()
    diagnostics.template_status = await checkConviteTemplate()
    diagnostics.phone_number = await checkPhoneNumberStatus()
  }

  // Calcular resumo
  const checks = [
    diagnostics.credentials,
    diagnostics.whatsapp_api,
    diagnostics.template_status,
    diagnostics.phone_number
  ].filter(Boolean)

  diagnostics.summary.passed = checks.filter(c => c.success).length
  diagnostics.summary.failed = checks.filter(c => !c.success).length
  diagnostics.summary.warnings = checks.filter(c => c.warnings?.length > 0).length

  diagnostics.overall_status = diagnostics.summary.failed === 0 ? 'success' : 'error'

  console.log('✅ Diagnósticos concluídos:', diagnostics.summary)
  return diagnostics
}

// Verificar credenciais do Supabase
async function checkSupabaseCredentials() {
  console.log('🔑 Verificando credenciais do Supabase...')
  
  const result = {
    test: 'Credenciais Supabase',
    success: false,
    details: [],
    warnings: [],
    errors: [],
    credentials: {
      access_token: false,
      phone_number_id: false
    }
  }

  try {
    // Verificar WHATSAPP_ACCESS_TOKEN
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    if (accessToken && accessToken.length > 50) {
      result.credentials.access_token = true
      result.details.push('✅ WHATSAPP_ACCESS_TOKEN configurado')
    } else {
      result.errors.push('❌ WHATSAPP_ACCESS_TOKEN não encontrado ou inválido')
    }

    // Verificar WHATSAPP_PHONE_NUMBER_ID
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    if (phoneNumberId && phoneNumberId.length > 10) {
      result.credentials.phone_number_id = true
      result.details.push('✅ WHATSAPP_PHONE_NUMBER_ID configurado')
    } else {
      result.errors.push('❌ WHATSAPP_PHONE_NUMBER_ID não encontrado ou inválido')
    }

    result.success = result.credentials.access_token && result.credentials.phone_number_id

    if (result.success) {
      result.details.push('🎉 Todas as credenciais estão configuradas!')
    } else {
      result.errors.push('⚠️ Configure as credenciais em Supabase > Settings > Edge Functions')
    }

  } catch (error) {
    result.errors.push(`Erro ao verificar credenciais: ${error.message}`)
  }

  return result
}

// Testar API do WhatsApp
async function testWhatsAppAPI() {
  console.log('📱 Testando API do WhatsApp...')
  
  const result = {
    test: 'API WhatsApp',
    success: false,
    details: [],
    warnings: [],
    errors: []
  }

  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

  if (!accessToken || !phoneNumberId) {
    result.errors.push('Credenciais não configuradas')
    return result
  }

  try {
    // Testar validação do token
    const tokenResponse = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`)
    const tokenData = await tokenResponse.json()

    if (tokenResponse.ok && tokenData.data?.is_valid) {
      result.details.push('✅ Token válido')
      
      const scopes = tokenData.data.scopes || []
      const requiredScopes = ['whatsapp_business_management', 'business_management']
      const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope))
      
      if (missingScopes.length > 0) {
        result.warnings.push(`Permissões em falta: ${missingScopes.join(', ')}`)
      } else {
        result.details.push('✅ Permissões adequadas')
      }
    } else {
      result.errors.push('Token inválido ou expirado')
      return result
    }

    // Testar Phone Number
    const phoneResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}?access_token=${accessToken}`)
    const phoneData = await phoneResponse.json()

    if (phoneResponse.ok) {
      result.success = true
      result.details.push(`✅ Phone Number ativo: ${phoneData.display_phone_number || phoneNumberId}`)
      
      if (phoneData.verified_name) {
        result.details.push(`📝 Nome verificado: ${phoneData.verified_name}`)
      }
      
      if (phoneData.quality_rating) {
        result.details.push(`⭐ Qualidade: ${phoneData.quality_rating}`)
      }
    } else {
      result.errors.push(`Phone Number inválido: ${phoneData.error?.message || 'Erro desconhecido'}`)
    }

  } catch (error) {
    result.errors.push(`Erro na verificação da API: ${error.message}`)
  }

  return result
}

// Verificar template "convitevia"
async function checkConviteTemplate() {
  console.log('📋 Verificando template "convitevia"...')
  
  const result = {
    test: 'Template "convitevia"',
    success: false,
    details: [],
    warnings: [],
    errors: [],
    template: null
  }

  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  if (!accessToken) {
    result.errors.push('Access Token não configurado')
    return result
  }

  try {
    // Buscar business accounts
    const businessResponse = await fetch(`https://graph.facebook.com/v18.0/me/businesses?access_token=${accessToken}`)
    const businessData = await businessResponse.json()

    if (!businessResponse.ok || !businessData.data?.length) {
      result.errors.push('Nenhum Business Account encontrado')
      return result
    }

    // Procurar template em cada business account
    for (const business of businessData.data) {
      try {
        const templatesResponse = await fetch(
          `https://graph.facebook.com/v18.0/${business.id}/message_templates?fields=name,status,language,category,components,quality_score&access_token=${accessToken}`
        )
        const templatesData = await templatesResponse.json()

        if (templatesResponse.ok && templatesData.data) {
          const conviteTemplate = templatesData.data.find((t: any) => t.name === 'convitevia')
          
          if (conviteTemplate) {
            result.template = conviteTemplate
            result.success = conviteTemplate.status === 'APPROVED'
            
            result.details.push(`✅ Template encontrado: ${conviteTemplate.name}`)
            result.details.push(`📊 Status: ${conviteTemplate.status}`)
            result.details.push(`🌐 Idioma: ${conviteTemplate.language}`)
            result.details.push(`📁 Categoria: ${conviteTemplate.category}`)
            
            if (conviteTemplate.quality_score) {
              result.details.push(`⭐ Qualidade: ${conviteTemplate.quality_score.score}/5`)
            }

            if (conviteTemplate.status !== 'APPROVED') {
              result.warnings.push('Template não está aprovado pelo Facebook')
            }

            break
          }
        }
      } catch (error) {
        console.log(`Erro ao buscar templates para business ${business.id}:`, error.message)
      }
    }

    if (!result.template) {
      result.errors.push('Template "convitevia" não encontrado')
      result.warnings.push('Certifique-se de que o template foi criado e enviado para aprovação')
    }

  } catch (error) {
    result.errors.push(`Erro ao verificar template: ${error.message}`)
  }

  return result
}

// Verificar status do Phone Number
async function checkPhoneNumberStatus() {
  console.log('📞 Verificando status do Phone Number...')
  
  const result = {
    test: 'Status Phone Number',
    success: false,
    details: [],
    warnings: [],
    errors: []
  }

  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

  if (!accessToken || !phoneNumberId) {
    result.errors.push('Credenciais não configuradas')
    return result
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}?fields=id,verified_name,display_phone_number,quality_rating,code_verification_status,throughput&access_token=${accessToken}`
    )
    const data = await response.json()

    if (response.ok) {
      result.success = true
      result.details.push(`📱 Número: ${data.display_phone_number || phoneNumberId}`)
      
      if (data.verified_name) {
        result.details.push(`✅ Nome verificado: ${data.verified_name}`)
      } else {
        result.warnings.push('Nome não verificado')
      }
      
      if (data.code_verification_status) {
        result.details.push(`🔐 Verificação: ${data.code_verification_status}`)
      }
      
      if (data.quality_rating) {
        result.details.push(`⭐ Qualidade: ${data.quality_rating}`)
        if (data.quality_rating === 'RED') {
          result.warnings.push('Qualidade baixa - pode afetar entregas')
        }
      }

      if (data.throughput) {
        result.details.push(`📊 Throughput: ${data.throughput.level}`)
      }

    } else {
      result.errors.push(`Erro: ${data.error?.message || 'Erro desconhecido'}`)
    }

  } catch (error) {
    result.errors.push(`Erro ao verificar phone number: ${error.message}`)
  }

  return result
}

// Testar envio real de WhatsApp
async function testWhatsAppSending(testPhone?: string) {
  console.log('🧪 Testando envio real do WhatsApp...')
  
  const result = {
    test: 'Teste de Envio',
    success: false,
    details: [],
    warnings: [],
    errors: [],
    messageId: null
  }

  if (!testPhone) {
    result.errors.push('Número de teste não fornecido')
    return result
  }

  try {
    // Usar a função de envio existente
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase.functions.invoke('send-whatsapp-invite', {
      body: {
        phone: testPhone,
        inviteUrl: 'https://test.example.com/convite/TEST123',
        roleName: 'Teste Debug',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        senderName: 'Sistema de Debug',
        notes: 'Teste automatizado da página de debug'
      }
    })

    if (error) {
      result.errors.push(`Erro no envio: ${error.message}`)
    } else if (data?.success) {
      result.success = true
      result.messageId = data.whatsappId
      result.details.push('✅ Mensagem enviada com sucesso!')
      result.details.push(`📬 ID da mensagem: ${data.whatsappId}`)
      result.details.push(`📱 Número de destino: ${data.phone}`)
    } else {
      result.errors.push(`Falha no envio: ${data?.message || 'Erro desconhecido'}`)
    }

  } catch (error) {
    result.errors.push(`Erro no teste de envio: ${error.message}`)
  }

  return result
}

// Buscar logs recentes do WhatsApp
async function getRecentWhatsAppLogs() {
  console.log('📋 Buscando logs recentes...')
  
  try {
    // Aqui você pode implementar busca nos logs do Supabase
    // Por enquanto, retornar estrutura básica
    return {
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Sistema de logs em desenvolvimento',
          source: 'whatsapp-debug'
        }
      ],
      total: 1,
      filters: ['info', 'warning', 'error']
    }
  } catch (error) {
    return {
      logs: [],
      total: 0,
      error: error.message
    }
  }
}