
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
  forceResend?: boolean
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 [SEND-INVITE-EMAIL] Iniciando processamento...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestData: InviteEmailRequest = await req.json()
    console.log('📧 [SEND-INVITE-EMAIL] Dados recebidos:', {
      email: requestData.email,
      roleName: requestData.roleName,
      hasInviteUrl: !!requestData.inviteUrl,
      inviteId: requestData.inviteId
    })

    // Validações básicas
    if (!requestData.email || !requestData.inviteUrl) {
      throw new Error('Email e URL do convite são obrigatórios')
    }

    // Registrar tentativa de envio na tabela
    if (requestData.inviteId) {
      console.log('📝 [SEND-INVITE-EMAIL] Registrando tentativa de envio...')
      
      const { error: attemptError } = await supabaseClient
        .from('invite_send_attempts')
        .insert({
          invite_id: requestData.inviteId,
          email: requestData.email,
          method_attempted: 'resend_primary',
          status: 'attempting'
        })

      if (attemptError) {
        console.warn('⚠️ [SEND-INVITE-EMAIL] Erro ao registrar tentativa:', attemptError)
      }

      // Atualizar contador de tentativas no convite
      const { error: updateError } = await supabaseClient
        .rpc('update_invite_send_attempt', { invite_id: requestData.inviteId })

      if (updateError) {
        console.warn('⚠️ [SEND-INVITE-EMAIL] Erro ao atualizar tentativas:', updateError)
      }
    }

    // Estratégia 1: Tentar Resend (principal)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (resendApiKey) {
      console.log('📤 [SEND-INVITE-EMAIL] Tentando Resend...')
      
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Viver de IA <noreply@viverdeia.ai>',
            to: [requestData.email],
            subject: `Convite para ${requestData.roleName} - Viver de IA`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Você foi convidado para a Viver de IA!</h2>
                
                <p>Olá!</p>
                
                <p>Você recebeu um convite para participar da plataforma <strong>Viver de IA</strong> como <strong>${requestData.roleName}</strong>.</p>
                
                ${requestData.notes ? `<p><strong>Mensagem do convite:</strong><br>${requestData.notes}</p>` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${requestData.inviteUrl}" 
                     style="background-color: #2563eb; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 6px; display: inline-block;">
                    Aceitar Convite
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  Este convite expira em: ${new Date(requestData.expiresAt).toLocaleDateString('pt-BR')}
                </p>
                
                <p style="font-size: 14px; color: #666;">
                  Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
                  <a href="${requestData.inviteUrl}">${requestData.inviteUrl}</a>
                </p>
                
                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #999;">
                  © 2024 Viver de IA. Todos os direitos reservados.
                </p>
              </div>
            `
          })
        })

        if (resendResponse.ok) {
          const resendData = await resendResponse.json()
          console.log('✅ [SEND-INVITE-EMAIL] Resend bem-sucedido:', resendData.id)

          // Registrar sucesso
          if (requestData.inviteId) {
            await supabaseClient
              .from('invite_send_attempts')
              .update({
                status: 'sent',
                email_id: resendData.id,
                sent_at: new Date().toISOString()
              })
              .eq('invite_id', requestData.inviteId)
              .eq('method_attempted', 'resend_primary')
          }

          return new Response(JSON.stringify({
            success: true,
            message: 'Email enviado com sucesso via Resend',
            emailId: resendData.id,
            strategy: 'resend_primary',
            method: 'resend'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          const errorData = await resendResponse.text()
          throw new Error(`Resend falhou: ${resendResponse.status} - ${errorData}`)
        }
      } catch (resendError) {
        console.error('❌ [SEND-INVITE-EMAIL] Erro no Resend:', resendError.message)
        
        // Registrar falha
        if (requestData.inviteId) {
          await supabaseClient
            .from('invite_send_attempts')
            .update({
              status: 'failed',
              error_message: resendError.message
            })
            .eq('invite_id', requestData.inviteId)
            .eq('method_attempted', 'resend_primary')
        }
        
        // Tentar estratégia de fallback
        console.log('🔄 [SEND-INVITE-EMAIL] Tentando fallback via Supabase Auth...')
        
        try {
          // Estratégia 2: Supabase Auth invite
          const { error: authError } = await supabaseClient.auth.admin.inviteUserByEmail(
            requestData.email,
            {
              redirectTo: requestData.inviteUrl,
              data: {
                role: requestData.roleName,
                invite_notes: requestData.notes || '',
                invited_by: requestData.senderName || 'Viver de IA'
              }
            }
          )

          if (authError) {
            throw new Error(`Supabase Auth falhou: ${authError.message}`)
          }

          console.log('✅ [SEND-INVITE-EMAIL] Fallback Supabase Auth bem-sucedido')

          // Registrar sucesso do fallback
          if (requestData.inviteId) {
            await supabaseClient
              .from('invite_send_attempts')
              .insert({
                invite_id: requestData.inviteId,
                email: requestData.email,
                method_attempted: 'supabase_auth',
                status: 'sent',
                sent_at: new Date().toISOString()
              })
          }

          return new Response(JSON.stringify({
            success: true,
            message: 'Email enviado via sistema de backup (Supabase Auth)',
            strategy: 'supabase_auth',
            method: 'fallback'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (fallbackError) {
          console.error('❌ [SEND-INVITE-EMAIL] Fallback também falhou:', fallbackError.message)
          
          // Registrar falha completa
          if (requestData.inviteId) {
            await supabaseClient
              .from('invite_send_attempts')
              .insert({
                invite_id: requestData.inviteId,
                email: requestData.email,
                method_attempted: 'supabase_auth',
                status: 'failed',
                error_message: fallbackError.message
              })
          }

          throw new Error(`Todas as estratégias falharam. Resend: ${resendError.message}, Supabase: ${fallbackError.message}`)
        }
      }
    } else {
      console.log('⚠️ [SEND-INVITE-EMAIL] RESEND_API_KEY não configurada, usando apenas Supabase Auth')
      
      // Se não tem Resend, usar direto Supabase Auth
      const { error: authError } = await supabaseClient.auth.admin.inviteUserByEmail(
        requestData.email,
        {
          redirectTo: requestData.inviteUrl,
          data: {
            role: requestData.roleName,
            invite_notes: requestData.notes || '',
            invited_by: requestData.senderName || 'Viver de IA'
          }
        }
      )

      if (authError) {
        throw new Error(`Supabase Auth falhou: ${authError.message}`)
      }

      console.log('✅ [SEND-INVITE-EMAIL] Supabase Auth bem-sucedido (sem Resend)')

      return new Response(JSON.stringify({
        success: true,
        message: 'Email enviado via Supabase Auth',
        strategy: 'supabase_auth',
        method: 'supabase_only'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('❌ [SEND-INVITE-EMAIL] Erro crítico:', error.message)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Falha no envio do convite'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
