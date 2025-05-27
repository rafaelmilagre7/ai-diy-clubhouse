
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { Resend } from 'npm:resend@2.0.0'

// Configuração de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteEmailRequest {
  email: string
  inviteUrl: string
  roleName: string
  expiresAt: string
  senderName?: string
  notes?: string
  inviteId?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  console.log(`[${new Date().toISOString()}] Iniciando envio de convite por email`)

  try {
    // Verificar configuração do Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY não configurado')
      throw new Error('Configuração de email não encontrada')
    }

    const resend = new Resend(resendApiKey)
    console.log('✅ Cliente Resend inicializado')

    const supabaseUrl = Deno.env.get('PROJECT_URL') || Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('PRIVATE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração de Supabase incompleta')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse do request com validação robusta
    let requestBody: InviteEmailRequest
    try {
      const rawBody = await req.text()
      console.log('📄 Raw body recebido:', rawBody.substring(0, 200) + '...')
      
      if (!rawBody) {
        throw new Error('Body vazio recebido')
      }
      
      requestBody = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError)
      throw new Error(`Erro ao processar dados: ${parseError.message}`)
    }

    const { email, inviteUrl, roleName, expiresAt, senderName, notes, inviteId } = requestBody

    console.log('📧 Dados do convite validados:', {
      email,
      roleName,
      hasInviteUrl: !!inviteUrl,
      inviteId,
      senderName
    })

    // Validações básicas
    if (!email || !inviteUrl || !roleName) {
      throw new Error('Dados obrigatórios ausentes: email, inviteUrl ou roleName')
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Formato de email inválido')
    }

    // Validar URL do convite
    try {
      new URL(inviteUrl)
    } catch {
      throw new Error('URL de convite inválida')
    }

    // Formatar data de expiração
    const expirationDate = new Date(expiresAt)
    const formattedExpiration = expirationDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Montar conteúdo do email
    const emailSubject = `Convite para Viver de IA - Papel: ${roleName}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite Viver de IA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Viver de IA</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Sua jornada na Inteligência Artificial começa aqui!</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">Você foi convidado!</h2>
          
          <p>Olá!</p>
          
          <p>${senderName ? `<strong>${senderName}</strong> convidou você para` : 'Você foi convidado para'} fazer parte da comunidade <strong>Viver de IA</strong> com o papel de <strong>${roleName}</strong>.</p>
          
          ${notes ? `<div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;"><p style="margin: 0;"><strong>Observações:</strong><br>${notes}</p></div>` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 5px; 
                      font-weight: bold; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ACEITAR CONVITE
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>⏰ Importante:</strong> Este convite expira em <strong>${formattedExpiration}</strong></p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
            <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            Este é um email automático. Se você não esperava receber este convite, pode ignorá-lo com segurança.
          </p>
        </div>
      </body>
      </html>
    `

    console.log('📤 Enviando email via Resend...')

    // Enviar email via Resend com configuração robusta
    const emailResponse = await resend.emails.send({
      from: 'Viver de IA <noreply@resend.dev>',
      to: [email],
      subject: emailSubject,
      html: emailHtml,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High'
      }
    })

    console.log('✅ Resposta do Resend:', {
      id: emailResponse.data?.id,
      success: !emailResponse.error
    })

    if (emailResponse.error) {
      console.error('❌ Erro do Resend:', emailResponse.error)
      throw new Error(`Falha no envio: ${emailResponse.error.message}`)
    }

    // Atualizar estatísticas do convite no banco usando método seguro
    if (inviteId) {
      console.log('📊 Atualizando estatísticas do convite...')
      
      try {
        // Buscar convite atual
        const { data: currentInvite } = await supabase
          .from('invites')
          .select('send_attempts')
          .eq('id', inviteId)
          .single()

        // Atualizar com incremento manual
        const newAttempts = (currentInvite?.send_attempts || 0) + 1
        
        const { error: updateError } = await supabase
          .from('invites')
          .update({
            last_sent_at: new Date().toISOString(),
            send_attempts: newAttempts
          })
          .eq('id', inviteId)

        if (updateError) {
          console.error('⚠️ Erro ao atualizar estatísticas:', updateError)
          // Não falhar o processo por causa disso
        } else {
          console.log('✅ Estatísticas atualizadas:', { attempts: newAttempts })
        }
      } catch (statsError) {
        console.error('⚠️ Erro ao atualizar estatísticas:', statsError)
        // Não falhar o processo por causa disso
      }
    }

    const duration = Date.now() - startTime
    console.log(`✅ Email enviado com sucesso em ${duration}ms`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email enviado com sucesso',
        emailId: emailResponse.data?.id,
        duration: `${duration}ms`
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ Erro no envio de email após ${duration}ms:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    // Retornar erro detalhado para debug
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro ao enviar email de convite',
        error: error.message,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
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
