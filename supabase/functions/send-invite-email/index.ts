
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

    // Assunto do email personalizado
    const emailSubject = `Você foi convidado para Viver de IA - ${roleName}`
    
    // Template de email moderno com as cores da plataforma
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite Viver de IA</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #F8FAFC;
            background-color: #0F111A;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(180deg, #0F111A 0%, #151823 100%);
          }
          
          .header {
            background: linear-gradient(135deg, #00EAD9 0%, #00BAB0 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
          }
          
          .logo {
            color: #0F111A;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 2;
          }
          
          .subtitle {
            color: #0F111A;
            font-size: 16px;
            font-weight: 500;
            opacity: 0.8;
            position: relative;
            z-index: 2;
          }
          
          .content {
            background: #151823;
            padding: 40px 30px;
            border-left: 1px solid #2E3346;
            border-right: 1px solid #2E3346;
          }
          
          .welcome-title {
            font-size: 28px;
            font-weight: 700;
            color: #F8FAFC;
            margin-bottom: 16px;
            text-align: center;
          }
          
          .welcome-text {
            font-size: 16px;
            color: #CDD5E0;
            margin-bottom: 32px;
            text-align: center;
            line-height: 1.7;
          }
          
          .role-badge {
            display: inline-block;
            background: linear-gradient(135deg, #00EAD9 0%, #00BAB0 100%);
            color: #0F111A;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin: 0 4px;
          }
          
          .invitation-card {
            background: linear-gradient(135deg, #1A1D2E 0%, #16213E 100%);
            border: 1px solid #2E3346;
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            position: relative;
            overflow: hidden;
          }
          
          .invitation-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #00EAD9 0%, #00BAB0 100%);
          }
          
          .notes-section {
            background: rgba(0, 234, 217, 0.1);
            border: 1px solid rgba(0, 234, 217, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
          
          .notes-title {
            color: #00EAD9;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .notes-text {
            color: #CDD5E0;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .cta-container {
            text-align: center;
            margin: 40px 0;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #00EAD9 0%, #00BAB0 100%);
            color: #0F111A;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 8px 32px rgba(0, 234, 217, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          
          .cta-button:hover {
            background: linear-gradient(135deg, #00D6C7 0%, #00A69D 100%);
            box-shadow: 0 12px 40px rgba(0, 234, 217, 0.4);
            transform: translateY(-2px);
          }
          
          .expiration-warning {
            background: rgba(254, 194, 96, 0.1);
            border: 1px solid rgba(254, 194, 96, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
          }
          
          .expiration-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          
          .expiration-text {
            color: #FEC260;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .expiration-date {
            color: #CDD5E0;
            font-size: 14px;
          }
          
          .link-section {
            background: #0F111A;
            border: 1px solid #2E3346;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
          
          .link-text {
            color: #657084;
            font-size: 14px;
            margin-bottom: 12px;
          }
          
          .link-url {
            color: #00EAD9;
            word-break: break-all;
            font-size: 14px;
            text-decoration: none;
          }
          
          .footer {
            background: #0F111A;
            padding: 30px;
            text-align: center;
            border: 1px solid #2E3346;
            border-top: none;
            border-radius: 0 0 16px 16px;
          }
          
          .footer-text {
            color: #657084;
            font-size: 12px;
            line-height: 1.6;
          }
          
          .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
            margin: 32px 0;
          }
          
          .benefit-item {
            background: rgba(0, 234, 217, 0.05);
            border: 1px solid rgba(0, 234, 217, 0.1);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          }
          
          .benefit-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          
          .benefit-title {
            color: #F8FAFC;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .benefit-desc {
            color: #657084;
            font-size: 12px;
          }
          
          @media (max-width: 640px) {
            .container {
              margin: 0;
            }
            
            .header, .content, .footer {
              padding: 24px 20px;
            }
            
            .welcome-title {
              font-size: 24px;
            }
            
            .cta-button {
              padding: 14px 24px;
              font-size: 14px;
            }
            
            .benefits-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo">Viver de IA</div>
            <div class="subtitle">Transforme seu negócio com Inteligência Artificial</div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <h1 class="welcome-title">Você foi convidado! 🎉</h1>
            
            <p class="welcome-text">
              ${senderName ? `<strong>${senderName}</strong> convidou você para` : 'Você foi convidado para'} 
              fazer parte da <strong>Viver de IA</strong> com o papel de 
              <span class="role-badge">${roleName}</span>
            </p>

            <!-- Benefits -->
            <div class="benefits-grid">
              <div class="benefit-item">
                <div class="benefit-icon">🤖</div>
                <div class="benefit-title">Soluções de IA</div>
                <div class="benefit-desc">Implemente IA no seu negócio</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">🚀</div>
                <div class="benefit-title">Trilhas Personalizadas</div>
                <div class="benefit-desc">Conteúdo sob medida para você</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">👥</div>
                <div class="benefit-title">Comunidade</div>
                <div class="benefit-desc">Conecte-se com especialistas</div>
              </div>
              <div class="benefit-item">
                <div class="benefit-icon">📚</div>
                <div class="benefit-title">Cursos Exclusivos</div>
                <div class="benefit-desc">Aprenda com os melhores</div>
              </div>
            </div>

            ${notes ? `
            <div class="notes-section">
              <div class="notes-title">💬 Mensagem pessoal:</div>
              <div class="notes-text">${notes}</div>
            </div>
            ` : ''}
            
            <!-- CTA -->
            <div class="cta-container">
              <a href="${inviteUrl}" class="cta-button">
                ✨ Aceitar Convite e Começar
              </a>
            </div>
            
            <!-- Expiration Warning -->
            <div class="expiration-warning">
              <div class="expiration-icon">⏰</div>
              <div class="expiration-text">Convite expira em:</div>
              <div class="expiration-date">${formattedExpiration}</div>
            </div>
            
            <!-- Link Section -->
            <div class="link-section">
              <div class="link-text">
                Se o botão não funcionar, copie e cole este link no seu navegador:
              </div>
              <a href="${inviteUrl}" class="link-url">${inviteUrl}</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-text">
              Este é um email automático da plataforma Viver de IA.<br>
              Se você não esperava receber este convite, pode ignorá-lo com segurança.
            </div>
          </div>
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
