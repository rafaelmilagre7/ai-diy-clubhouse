
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface ConnectionEmailRequest {
  recipientEmail: string
  recipientName: string
  requesterName: string
  requesterCompany?: string
  requesterPosition?: string
  connectionId: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não configurada')
    }

    const supabaseUrl = Deno.env.get('PROJECT_URL') || Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('PRIVATE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração de ambiente Supabase incompleta')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const {
      recipientEmail,
      recipientName,
      requesterName,
      requesterCompany,
      requesterPosition,
      connectionId
    }: ConnectionEmailRequest = await req.json()

    if (!recipientEmail || !requesterName || !connectionId) {
      throw new Error('Dados obrigatórios não fornecidos')
    }

    console.log(`📧 Enviando notificação de conexão para: ${recipientEmail}`)

    // Construir URL da plataforma
    const baseUrl = Deno.env.get('APP_URL') || 'https://app.viverdeia.ai'
    const connectionsUrl = `${baseUrl}/networking/connections`

    // Template do e-mail
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nova Solicitação de Conexão</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">VIVER DE IA Club</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Networking Inteligente</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Nova Solicitação de Conexão!</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Olá <strong>${recipientName}</strong>,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              <strong>${requesterName}</strong> quer se conectar com você no VIVER DE IA Club.
            </p>
            
            ${requesterPosition || requesterCompany ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="margin-top: 0; color: #495057;">Informações do Solicitante:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  <li style="margin-bottom: 8px;"><strong>Nome:</strong> ${requesterName}</li>
                  ${requesterPosition ? `<li style="margin-bottom: 8px;"><strong>Posição:</strong> ${requesterPosition}</li>` : ''}
                  ${requesterCompany ? `<li style="margin-bottom: 8px;"><strong>Empresa:</strong> ${requesterCompany}</li>` : ''}
                </ul>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${connectionsUrl}" 
                 style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Ver Solicitação
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6c757d; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              Você pode aceitar ou rejeitar esta solicitação acessando sua área de conexões na plataforma.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="font-size: 12px; color: #adb5bd; margin: 0;">
                Este e-mail foi enviado pelo sistema VIVER DE IA Club<br>
                Se você não esperava este e-mail, pode ignorá-lo com segurança.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Enviar e-mail via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get("FROM_EMAIL") || 'VIVER DE IA Club <rafael@viverdeia.ai>',
        to: [recipientEmail],
        subject: 'Nova solicitação de conexão no VIVER DE IA Club',
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('❌ Erro do Resend:', errorData)
      throw new Error(`Erro do Resend: ${errorData}`)
    }

    const emailData = await emailResponse.json()
    console.log('✅ E-mail enviado com sucesso:', emailData.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'E-mail de conexão enviado com sucesso',
        emailId: emailData.id
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error: any) {
    console.error('❌ Erro ao enviar e-mail de conexão:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro ao enviar e-mail de conexão',
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
