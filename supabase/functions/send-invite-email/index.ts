
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { format } from 'https://esm.sh/date-fns@3.6.0'
import { ptBR } from 'https://esm.sh/date-fns@3.6.0/locale/pt-BR'
import { Resend } from 'https://esm.sh/resend@2.0.0'

// Configuração de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lidar com requisição OPTIONS para CORS
Deno.serve(async (req) => {
  // Esta função de edge aceita requisições POST apenas
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Obter segredos da configuração com suporte a múltiplos nomes de variáveis
    const supabaseUrl = Deno.env.get('PROJECT_URL') || Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('PRIVATE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    // Log para diagnóstico das variáveis disponíveis
    console.log('Variáveis de ambiente disponíveis:',
      {
        supabaseUrl: supabaseUrl ? 'Configurado' : 'Não configurado',
        supabaseServiceKey: supabaseServiceKey ? 'Configurado' : 'Não configurado',
        resendApiKey: resendApiKey ? 'Configurado' : 'Não configurado',
      }
    )
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Erro de configuração: URLs do Supabase ausentes', {
        PROJECT_URL: Deno.env.get('PROJECT_URL') ? 'Configurado' : 'Não configurado',
        SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'Configurado' : 'Não configurado',
        PRIVATE_SERVICE_ROLE_KEY: Deno.env.get('PRIVATE_SERVICE_ROLE_KEY') ? 'Configurado' : 'Não configurado',
        SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Configurado' : 'Não configurado'
      })
      throw new Error('Configuração de ambiente Supabase incompleta')
    }
    
    if (!resendApiKey) {
      console.error('Erro de configuração: Chave da API do Resend ausente')
      throw new Error('Configuração de Resend incompleta')
    }
    
    // Inicializar cliente Supabase
    let supabase = null
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey)
      console.log('Cliente Supabase inicializado com sucesso')
    } catch (supabaseError) {
      console.error('Erro ao inicializar cliente Supabase:', supabaseError)
      // Continuar com a execução - não bloquear o envio de email se o Supabase falhar
    }
    
    // Inicializar cliente Resend
    const resend = new Resend(resendApiKey)
    
    // Obter dados do corpo da requisição
    const requestData = await req.json()
    const { email, inviteUrl, roleName, expiresAt, senderName, notes, inviteId } = requestData
    
    console.log(`Preparando envio de convite para ${email} com papel ${roleName}`)
    
    // Verificar dados obrigatórios
    if (!email || !inviteUrl) {
      throw new Error('Email e URL do convite são obrigatórios')
    }
    
    // Validação básica de URL
    const urlRegex = new RegExp('^https?://[a-z0-9-]+(\\.[a-z0-9-]+)+([/?].*)?$', 'i')
    if (!urlRegex.test(inviteUrl)) {
      throw new Error('URL do convite inválida')
    }
    
    // Formatar a data de expiração
    let formattedExpiresAt = 'Em 7 dias'
    if (expiresAt) {
      try {
        formattedExpiresAt = format(new Date(expiresAt), 'dd MMMM yyyy', { locale: ptBR })
      } catch (err) {
        console.error('Erro ao formatar data de expiração:', err)
      }
    }
    
    // Preparar o HTML do email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Convite para o VIVER DE IA Club</title>
        <style>
          @media only screen and (max-width: 620px) {
            table.body h1 {
              font-size: 28px !important;
              margin-bottom: 10px !important;
            }
            table.body p,
            table.body ul,
            table.body ol,
            table.body td,
            table.body span,
            table.body a {
              font-size: 16px !important;
            }
            table.body .wrapper,
            table.body .article {
              padding: 10px !important;
            }
            table.body .content {
              padding: 0 !important;
            }
            table.body .container {
              padding: 0 !important;
              width: 100% !important;
            }
            table.body .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }
            table.body .btn table {
              width: 100% !important;
            }
            table.body .btn a {
              width: 100% !important;
            }
            table.body .img-responsive {
              height: auto !important;
              max-width: 100% !important;
              width: auto !important;
            }
          }
          
          body {
            background-color: #f6f6f6;
            font-family: sans-serif;
            -webkit-font-smoothing: antialiased;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
          }
          
          table {
            border-collapse: separate;
            width: 100%;
          }
          
          table td {
            font-family: sans-serif;
            font-size: 14px;
            vertical-align: top;
          }
          
          .body {
            background-color: #f6f6f6;
            width: 100%;
          }
          
          .container {
            display: block;
            margin: 0 auto !important;
            max-width: 580px;
            padding: 10px;
            width: 580px;
          }
          
          .content {
            box-sizing: border-box;
            display: block;
            margin: 0 auto;
            max-width: 580px;
            padding: 10px;
          }
          
          .main {
            background: #ffffff;
            border-radius: 3px;
            width: 100%;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          }
          
          .wrapper {
            box-sizing: border-box;
            padding: 20px;
          }
          
          .content-block {
            padding-bottom: 10px;
            padding-top: 10px;
          }
          
          .footer {
            clear: both;
            margin-top: 10px;
            text-align: center;
            width: 100%;
          }
          
          .footer td,
          .footer p,
          .footer span,
          .footer a {
            color: #999999;
            font-size: 12px;
            text-align: center;
          }
          
          h1,
          h2,
          h3,
          h4 {
            color: #000000;
            font-family: sans-serif;
            font-weight: 600;
            line-height: 1.4;
            margin: 0 0 30px;
          }
          
          h1 {
            font-size: 35px;
            font-weight: 300;
            text-align: center;
            text-transform: capitalize;
          }
          
          p,
          ul,
          ol {
            font-family: sans-serif;
            font-size: 14px;
            font-weight: normal;
            margin: 0 0 15px;
          }
          
          p li,
          ul li,
          ol li {
            list-style-position: inside;
            margin-left: 5px;
          }
          
          a {
            color: #3498db;
            text-decoration: none;
          }
          
          .btn {
            box-sizing: border-box;
            width: 100%;
          }
          
          .btn > tbody > tr > td {
            padding-bottom: 15px;
          }
          
          .btn table {
            width: auto;
          }
          
          .btn table td {
            background-color: #ffffff;
            border-radius: 5px;
            text-align: center;
          }
          
          .btn a {
            background-color: #ffffff;
            border: solid 1px #3498db;
            border-radius: 5px;
            box-sizing: border-box;
            color: #3498db;
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
            font-weight: bold;
            margin: 0;
            padding: 12px 25px;
            text-decoration: none;
          }
          
          .btn-primary table td {
            background-color: #3498db;
          }
          
          .btn-primary a {
            background-color: #3498db;
            border-color: #3498db;
            color: #ffffff;
          }
          
          .preheader {
            color: transparent;
            display: none;
            height: 0;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
            visibility: hidden;
            width: 0;
          }
          
          .highlight {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
          }
          
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .logo {
            max-width: 200px;
            height: auto;
          }
          
          .expires {
            color: #718096;
            font-size: 13px;
            margin-top: 15px;
          }
          
          .notes {
            background-color: #f8fbfd;
            border-left: 3px solid #63b3ed;
            padding: 10px 15px;
            margin: 20px 0;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <span class="preheader">Você foi convidado para se juntar ao VIVER DE IA Club.</span>
        <table role="presentation" class="body">
          <tr>
            <td>&nbsp;</td>
            <td class="container">
              <div class="content">
                <div class="logo-container">
                  <img src="https://viverdeia.ai/images/logo.png" alt="VIVER DE IA" class="logo" />
                </div>
                
                <!-- START MAIN CONTENT AREA -->
                <table role="presentation" class="main">
                  <tr>
                    <td class="wrapper">
                      <table role="presentation">
                        <tr>
                          <td>
                            <h2>Você foi convidado para o VIVER DE IA Club</h2>
                            <p>Olá,</p>
                            <p>
                              ${senderName ? `${senderName} convidou você` : 'Você foi convidado'} 
                              para se juntar ao VIVER DE IA Club como <strong>${roleName || 'membro'}</strong>.
                            </p>
                            
                            ${notes ? `<div class="notes">${notes}</div>` : ''}
                            
                            <div class="highlight">
                              <p>Para aceitar este convite, clique no botão abaixo:</p>
                              <table role="presentation" class="btn btn-primary">
                                <tbody>
                                  <tr>
                                    <td align="center">
                                      <table role="presentation">
                                        <tbody>
                                          <tr>
                                            <td>
                                              <a href="${inviteUrl}" target="_blank">Aceitar Convite</a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <p class="expires">Este convite expira em: ${formattedExpiresAt}</p>
                            </div>
                            
                            <p>
                              Se você tiver problemas para clicar no botão "Aceitar Convite", 
                              copie e cole este link em seu navegador:
                            </p>
                            <p style="word-break: break-all;">${inviteUrl}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <!-- END MAIN CONTENT AREA -->
                
                <!-- START FOOTER -->
                <div class="footer">
                  <table role="presentation">
                    <tr>
                      <td class="content-block">
                        <span class="apple-link">VIVER DE IA Club</span>
                        <br />
                        <span>Este email foi enviado automaticamente, por favor não responda.</span>
                      </td>
                    </tr>
                  </table>
                </div>
                <!-- END FOOTER -->
              </div>
            </td>
            <td>&nbsp;</td>
          </tr>
        </table>
      </body>
      </html>
    `
    
    // Enviar o email usando o Resend
    const sendEmailWithResend = async () => {
      try {
        console.log('Enviando email via Resend');
        
        // Modificar o endereço de email para usar o domínio verificado
        const fromEmail = "VIVER DE IA Club <no-reply@inteligenciapraviver.com>";
        
        console.log('Usando endereço de remetente:', fromEmail);
        
        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: `Convite para o VIVER DE IA Club - Acesso como ${roleName || 'membro'}`,
          html: emailHtml,
          text: `Você foi convidado para o VIVER DE IA Club como ${roleName || 'membro'}. Acesse o link para aceitar: ${inviteUrl}`,
          reply_to: "no-reply@inteligenciapraviver.com" // Também modificado para usar o domínio verificado
        });
        
        console.log('Resposta do Resend:', emailResponse);
        
        return {
          success: true,
          messageId: emailResponse.id || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        };
      } catch (error) {
        console.error('Erro durante envio de email com Resend:', error);
        // Melhorar o log para capturar mais detalhes sobre erros específicos do Resend
        if (error.response) {
          console.error('Detalhes da resposta de erro:', {
            status: error.response.status,
            data: error.response.data
          });
        }
        throw error;
      }
    };
    
    // Tentar enviar o email
    let emailResponse = null;
    try {
      console.log(`Enviando email para: ${email}`);
      emailResponse = await sendEmailWithResend();
      console.log('Email enviado com sucesso:', emailResponse);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      throw new Error(`Falha ao enviar email: ${emailError.message}`);
    }
    
    // Atualizar estatísticas de envio do convite se temos um ID
    if (supabase && inviteId) {
      try {
        console.log(`Atualizando estatísticas do convite ${inviteId}`);
        
        // Chamar a função RPC específica para atualização das estatísticas
        await supabase.functions.invoke('update_invite_send_stats', {
          body: { invite_id: inviteId }
        });
        
        console.log(`Estatísticas do convite ${inviteId} atualizadas com sucesso`);
      } catch (statsError) {
        console.error('Erro ao atualizar estatísticas do convite:', statsError);
        // Não lançar erro aqui, pois o email já foi enviado com sucesso
      }
    } else if (inviteId) {
      console.warn('Não foi possível atualizar estatísticas: Cliente Supabase não inicializado');
    }
    
    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email de convite enviado com sucesso',
        emailId: emailResponse?.messageId || null,
        fromEmail: "no-reply@inteligenciapraviver.com" // Adicionar para diagnóstico
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Erro ao enviar email de convite:', error);
    
    // Retornar erro detalhado para facilitar o diagnóstico
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro ao enviar email de convite',
        error: error.message || 'Erro desconhecido',
        stack: error.stack,
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
