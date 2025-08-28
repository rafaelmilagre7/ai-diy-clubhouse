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

    // Ação: Buscar todos os templates
    if (action === 'get-all-templates') {
      const allTemplates = await getAllTemplates()
      return new Response(JSON.stringify(allTemplates), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Ação: Testar template específico
    if (action === 'test-template') {
      const { templateName, testPhone } = requestBody
      const testResult = await testSpecificTemplate(templateName, testPhone)
      return new Response(JSON.stringify(testResult), {
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
    // Verificar WHATSAPP_BUSINESS_TOKEN
    const accessToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
    console.log('🔑 Verificando token:', { hasToken: !!accessToken, length: accessToken?.length });
    if (accessToken && accessToken.length > 50) {
      result.credentials.access_token = true
      result.details.push('✅ WHATSAPP_BUSINESS_TOKEN configurado')
    } else {
      result.errors.push('❌ WHATSAPP_BUSINESS_TOKEN não encontrado ou inválido')
    }

    // Verificar WHATSAPP_BUSINESS_PHONE_ID
    const phoneNumberId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID')
    console.log('📱 Verificando phone ID:', { hasPhoneId: !!phoneNumberId, length: phoneNumberId?.length });
    if (phoneNumberId && phoneNumberId.length > 10) {
      result.credentials.phone_number_id = true
      result.details.push('✅ WHATSAPP_BUSINESS_PHONE_ID configurado')
    } else {
      result.errors.push('❌ WHATSAPP_BUSINESS_PHONE_ID não encontrado ou inválido')
    }

    // Verificar WHATSAPP_BUSINESS_ACCOUNT_ID
    const accountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')
    if (accountId && accountId.length > 10) {
      result.credentials.account_id = true
      result.details.push('✅ WHATSAPP_BUSINESS_ACCOUNT_ID configurado')
    } else {
      result.errors.push('❌ WHATSAPP_BUSINESS_ACCOUNT_ID não encontrado ou inválido')
    }

    result.success = result.credentials.access_token && result.credentials.phone_number_id && result.credentials.account_id

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

  const accessToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID')

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

  const accessToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
  const accountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')
  
  if (!accessToken) {
    result.errors.push('WHATSAPP_BUSINESS_TOKEN não configurado')
    return result
  }
  
  if (!accountId) {
    result.errors.push('WHATSAPP_BUSINESS_ACCOUNT_ID não configurado')
    return result
  }

  try {
    // Buscar templates diretamente do account ID configurado
    const templatesResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/message_templates?fields=name,status,language,category,components,quality_score&access_token=${accessToken}`
    )
    const templatesData = await templatesResponse.json()

    if (!templatesResponse.ok) {
      result.errors.push(`Erro ao buscar templates: ${templatesData.error?.message || 'Erro desconhecido'}`)
      return result
    }

    if (templatesData.data) {
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
      } else {
        result.errors.push('Template "convitevia" não encontrado')
        result.warnings.push('Certifique-se de que o template foi criado e enviado para aprovação')
      }
    } else {
      result.errors.push('Nenhum template encontrado no Business Account')
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

  const accessToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID')

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

// NOVA FUNÇÃO: Buscar todos os templates
async function getAllTemplates() {
  console.log('📋 Buscando todos os templates...')
  
  const result = {
    test: 'Todos os Templates',
    success: false,
    details: [],
    warnings: [],
    errors: [],
    templates: [],
    summary: {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      paused: 0
    }
  }

  const accessToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
  const accountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')
  
  if (!accessToken) {
    result.errors.push('WHATSAPP_BUSINESS_TOKEN não configurado')
    return result
  }
  
  if (!accountId) {
    result.errors.push('WHATSAPP_BUSINESS_ACCOUNT_ID não configurado')
    return result
  }

  try {
    console.log(`🔍 Buscando templates do Business Account: ${accountId}`)
    
    const templatesResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/message_templates?fields=name,status,language,category,components,quality_score,created_time,previous_category&limit=100&access_token=${accessToken}`
    )
    const templatesData = await templatesResponse.json()

    if (!templatesResponse.ok) {
      result.errors.push(`Erro ao buscar templates: ${templatesData.error?.message || 'Erro desconhecido'}`)
      console.error('❌ Erro na API:', templatesData.error)
      return result
    }

    if (templatesData.data && Array.isArray(templatesData.data)) {
      result.templates = templatesData.data
      result.summary.total = templatesData.data.length
      
      // Contar por status
      templatesData.data.forEach((template: any) => {
        switch (template.status) {
          case 'APPROVED':
            result.summary.approved++
            break
          case 'PENDING':
            result.summary.pending++
            break
          case 'REJECTED':
            result.summary.rejected++
            break
          case 'PAUSED':
            result.summary.paused++
            break
        }
      })

      result.success = true
      result.details.push(`✅ Encontrados ${result.summary.total} templates`)
      result.details.push(`✅ Aprovados: ${result.summary.approved}`)
      result.details.push(`⏳ Pendentes: ${result.summary.pending}`)
      result.details.push(`❌ Rejeitados: ${result.summary.rejected}`)
      result.details.push(`⏸️ Pausados: ${result.summary.paused}`)

      if (result.summary.approved === 0) {
        result.warnings.push('Nenhum template aprovado encontrado')
      }
      
    } else {
      result.errors.push('Nenhum template encontrado no Business Account')
    }

  } catch (error) {
    console.error('❌ Erro ao buscar templates:', error)
    result.errors.push(`Erro ao buscar templates: ${error.message}`)
  }

  return result
}

// Função para formatar número de telefone
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Se já tem código do país, usar como está
  if (cleanPhone.startsWith('55')) {
    return cleanPhone;
  }
  
  // Se tem 11 dígitos (celular brasileiro), adicionar 55
  if (cleanPhone.length === 11) {
    return '55' + cleanPhone;
  }
  
  // Se tem 10 dígitos (fixo brasileiro), adicionar 55
  if (cleanPhone.length === 10) {
    return '55' + cleanPhone;
  }
  
  // Caso contrário, retornar como está
  return cleanPhone;
}

// Mapeamento de templates conhecidos com seus parâmetros de teste
const TEMPLATE_TEST_MAPPING = {
  'convitevia': {
    parameterCount: 2,
    testValues: [
      { type: "text", text: "Teste Usuario" },
      { type: "text", text: "https://test.example.com/convite/TEST123" }
    ]
  },
  'fluxo_captacao': {
    parameterCount: 1,
    testValues: [
      { type: "text", text: "Teste Usuario" }
    ]
  },
  'anuncioclub_25_08': {
    parameterCount: 1,
    testValues: [
      { type: "text", text: "Teste Usuario" }
    ]
  },
  'ads_relatorio_day': {
    parameterCount: 0,
    testValues: []
  }
};

// NOVA FUNÇÃO: Testar template específico
async function testSpecificTemplate(templateName: string, testPhone: string) {
  console.log(`🧪 Testando template "${templateName}" para ${testPhone}...`)
  
  const result = {
    test: `Teste Template "${templateName}"`,
    success: false,
    details: [],
    warnings: [],
    errors: [],
    messageId: null,
    template: null
  }

  if (!templateName || !testPhone) {
    result.errors.push('Nome do template e telefone são obrigatórios')
    return result
  }

  const accessToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID')
  const accountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')
  
  if (!accessToken || !phoneNumberId || !accountId) {
    result.errors.push('Credenciais não configuradas completamente')
    return result
  }

  try {
    // Primeiro, buscar o template para verificar se existe e está aprovado
    const templatesResponse = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/message_templates?fields=name,status,language,category,components&access_token=${accessToken}`
    )
    const templatesData = await templatesResponse.json()

    if (!templatesResponse.ok) {
      result.errors.push(`Erro ao buscar template: ${templatesData.error?.message}`)
      return result
    }

    const template = templatesData.data?.find((t: any) => t.name === templateName)
    if (!template) {
      result.errors.push(`Template "${templateName}" não encontrado`)
      return result
    }

    if (template.status !== 'APPROVED') {
      result.errors.push(`Template "${templateName}" não está aprovado (status: ${template.status})`)
      return result
    }

    result.template = template
    result.details.push(`✅ Template encontrado: ${template.name}`)
    result.details.push(`📊 Status: ${template.status}`)
    result.details.push(`🌐 Idioma: ${template.language}`)

    // Buscar mapeamento do template ou usar fallback
    const templateConfig = TEMPLATE_TEST_MAPPING[templateName as keyof typeof TEMPLATE_TEST_MAPPING];
    
    let templateComponents = [];
    
    if (templateConfig) {
      // Usar configuração conhecida
      console.log(`📋 Usando configuração conhecida para template "${templateName}"`);
      result.details.push(`🔧 Parâmetros configurados: ${templateConfig.parameterCount}`);
      
      if (templateConfig.parameterCount > 0) {
        templateComponents = [{
          type: "body",
          parameters: templateConfig.testValues
        }];
      }
    } else {
      // Tentar detectar automaticamente (fallback)
      console.log(`⚠️ Template "${templateName}" não mapeado, tentando detectar parâmetros...`);
      result.warnings.push(`Template "${templateName}" não mapeado - usando detecção automática`);
      
      // Procurar por componentes body com variáveis
      const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');
      if (bodyComponent?.example?.body_text?.[0]?.length > 0) {
        const exampleText = bodyComponent.example.body_text[0][0];
        const parameterCount = (exampleText.match(/\{\{[0-9]+\}\}/g) || []).length;
        
        console.log(`🔍 Detectados ${parameterCount} parâmetros no template`);
        result.details.push(`🔍 Parâmetros detectados: ${parameterCount}`);
        
        if (parameterCount > 0) {
          templateComponents = [{
            type: "body",
            parameters: Array(parameterCount).fill(null).map((_, index) => ({
              type: "text",
              text: `Teste_${index + 1}`
            }))
          }];
        }
      }
    }

    // Preparar dados do template para envio
    const templateData = {
      messaging_product: "whatsapp",
      to: formatPhoneNumber(testPhone),
      type: "template",
      template: {
        name: templateName,
        language: {
          code: template.language || "pt_BR"
        },
        components: templateComponents
      }
    }

    console.log(`📤 Dados do template para envio:`, JSON.stringify(templateData, null, 2));
    result.details.push(`📤 Enviando para: ${templateData.to}`);

    // Enviar mensagem via API
    const sendResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      }
    )

    const sendData = await sendResponse.json()

    if (sendResponse.ok && sendData.messages?.[0]?.id) {
      result.success = true
      result.messageId = sendData.messages[0].id
      result.details.push('✅ Mensagem enviada com sucesso!')
      result.details.push(`📬 ID da mensagem: ${result.messageId}`)
      result.details.push(`📱 Número de destino: ${templateData.to}`)
    } else {
      result.errors.push(`Falha no envio: ${sendData.error?.message || 'Erro desconhecido'}`)
      if (sendData.error?.error_data) {
        result.errors.push(`Detalhes: ${JSON.stringify(sendData.error.error_data)}`)
      }
      console.error('❌ Erro no envio:', sendData)
    }

  } catch (error) {
    console.error('❌ Erro no teste do template:', error)
    result.errors.push(`Erro no teste: ${error.message}`)
  }

  return result
}