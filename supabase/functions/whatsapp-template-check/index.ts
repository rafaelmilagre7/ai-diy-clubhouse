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
    console.log('🔍 [TEMPLATE-CHECK] Verificando status do template WhatsApp...')
    
    const whatsappToken = Deno.env.get('WHATSAPP_BUSINESS_TOKEN')
    const businessAccountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')

    if (!whatsappToken || !businessAccountId) {
      throw new Error('Credenciais WhatsApp não configuradas')
    }

    // Verificar template "convitevia"
    const templateResponse = await fetch(
      `https://graph.facebook.com/v18.0/${businessAccountId}/message_templates?name=convitevia`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        }
      }
    )

    const templateData = await templateResponse.json()

    console.log('📱 [TEMPLATE-STATUS] Resposta da API:', {
      status: templateResponse.status,
      data: JSON.stringify(templateData, null, 2)
    })

    if (!templateResponse.ok) {
      console.error('❌ [TEMPLATE-ERROR] Erro ao verificar template:', templateData)
      throw new Error(`Erro ao verificar template: ${templateData.error?.message}`)
    }

    const templates = templateData.data || []
    const conviteTemplate = templates.find((t: any) => t.name === 'convitevia')

    const result = {
      templateExists: !!conviteTemplate,
      templateStatus: conviteTemplate?.status || 'NOT_FOUND',
      templateData: conviteTemplate,
      allTemplates: templates.map((t: any) => ({
        name: t.name,
        status: t.status,
        language: t.language
      })),
      timestamp: new Date().toISOString()
    }

    console.log('✅ [TEMPLATE-CHECK] Resultado:', result)

    // Salvar resultado no banco para auditoria
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase.from('audit_logs').insert({
      event_type: 'whatsapp_template_check',
      action: 'template_status_verification',
      details: result,
      severity: conviteTemplate?.status === 'APPROVED' ? 'info' : 'warning'
    })

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ [TEMPLATE-CHECK] Erro:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      templateExists: false,
      templateStatus: 'ERROR'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})