import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { Resend } from 'npm:resend@4.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'

// Import email templates
import { SuggestionNewEmail } from '../shared/email-templates/suggestions-new.tsx'
import { SuggestionCommentEmail } from '../shared/email-templates/suggestion-comment.tsx'
import { SuggestionApprovedEmail } from '../shared/email-templates/suggestion-approved.tsx'
import { NetworkingConnectionEmail } from '../shared/email-templates/networking-connection.tsx'
import { GamificationBadgeEmail } from '../shared/email-templates/gamification-badge.tsx'
import { LearningNewLessonEmail } from '../shared/email-templates/learning-new-lesson.tsx'
import { SystemWelcomeEmail } from '../shared/email-templates/system-welcome.tsx'
import { WeeklyDigestEmail } from '../shared/email-templates/weekly-digest.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationEmailRequest {
  notificationId: string
  userId: string
  category: string
  type: string
  title: string
  message: string
  metadata?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body: NotificationEmailRequest = await req.json()
    console.log('📧 [NOTIFICATION-EMAIL] Processando:', body)

    // Buscar dados do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', body.userId)
      .single()

    if (profileError || !profile?.email) {
      throw new Error(`Usuário não encontrado ou sem email: ${profileError?.message}`)
    }

    console.log('👤 [NOTIFICATION-EMAIL] Destinatário:', profile.email)

    // Determinar qual template usar baseado na categoria e tipo
    let emailHtml: string
    let subject: string

    const templateKey = `${body.category}_${body.type}`
    
    switch (templateKey) {
      case 'suggestions_new':
        emailHtml = await renderAsync(
          React.createElement(SuggestionNewEmail, {
            userName: profile.full_name || 'Usuário',
            suggestionTitle: body.metadata?.suggestionTitle || body.title,
            suggestionDescription: body.metadata?.suggestionDescription || body.message,
            suggestionAuthor: body.metadata?.authorName || 'Usuário',
            suggestionUrl: body.metadata?.url || 'https://viverdeia.ai',
            categoryName: body.metadata?.categoryName || 'Geral',
          })
        )
        subject = `💡 Nova sugestão: ${body.metadata?.suggestionTitle || body.title}`
        break

      case 'suggestions_comment':
        emailHtml = await renderAsync(
          React.createElement(SuggestionCommentEmail, {
            userName: profile.full_name || 'Usuário',
            suggestionTitle: body.metadata?.suggestionTitle || body.title,
            commenterName: body.metadata?.commenterName || 'Usuário',
            commentText: body.metadata?.commentText || body.message,
            suggestionUrl: body.metadata?.url || 'https://viverdeia.ai',
          })
        )
        subject = `💬 Novo comentário na sua sugestão`
        break

      case 'suggestions_approved':
        emailHtml = await renderAsync(
          React.createElement(SuggestionApprovedEmail, {
            userName: profile.full_name || 'Usuário',
            suggestionTitle: body.metadata?.suggestionTitle || body.title,
            approverName: body.metadata?.approverName || 'Administrador',
            approvalMessage: body.metadata?.approvalMessage,
            suggestionUrl: body.metadata?.url || 'https://viverdeia.ai',
            votesCount: body.metadata?.votesCount || 0,
          })
        )
        subject = `✅ Sua sugestão foi aprovada!`
        break

      case 'networking_connection':
        emailHtml = await renderAsync(
          React.createElement(NetworkingConnectionEmail, {
            userName: profile.full_name || 'Usuário',
            senderName: body.metadata?.senderName || 'Novo Contato',
            senderAvatar: body.metadata?.senderAvatar,
            senderCompany: body.metadata?.senderCompany,
            senderPosition: body.metadata?.senderPosition,
            connectionUrl: body.metadata?.url || 'https://viverdeia.ai',
          })
        )
        subject = `🤝 Nova solicitação de conexão`
        break

      case 'gamification_badge':
        emailHtml = await renderAsync(
          React.createElement(GamificationBadgeEmail, {
            userName: profile.full_name || 'Usuário',
            badgeName: body.metadata?.badgeName || body.title,
            badgeDescription: body.metadata?.badgeDescription || body.message,
            badgeIcon: body.metadata?.badgeIcon || '🏆',
            badgeUrl: body.metadata?.url || 'https://viverdeia.ai',
            totalPoints: body.metadata?.totalPoints || 0,
            currentLevel: body.metadata?.currentLevel || 1,
          })
        )
        subject = `🏆 Você conquistou um novo badge!`
        break

      case 'learning_new_lesson':
        emailHtml = await renderAsync(
          React.createElement(LearningNewLessonEmail, {
            userName: profile.full_name || 'Usuário',
            lessonTitle: body.metadata?.lessonTitle || body.title,
            lessonDescription: body.metadata?.lessonDescription || body.message,
            courseName: body.metadata?.courseName || 'Curso',
            instructorName: body.metadata?.instructorName,
            lessonUrl: body.metadata?.url || 'https://viverdeia.ai',
            estimatedDuration: body.metadata?.estimatedDuration,
          })
        )
        subject = `📚 Nova aula disponível: ${body.metadata?.lessonTitle || body.title}`
        break

      case 'system_welcome':
        emailHtml = await renderAsync(
          React.createElement(SystemWelcomeEmail, {
            userName: profile.full_name || 'Usuário',
            userEmail: profile.email,
            dashboardUrl: 'https://viverdeia.ai/dashboard',
          })
        )
        subject = `🚀 Bem-vindo ao Viver de IA!`
        break

      case 'digest_weekly':
        emailHtml = await renderAsync(
          React.createElement(WeeklyDigestEmail, {
            userName: profile.full_name || 'Usuário',
            weekNumber: body.metadata?.weekNumber || 1,
            year: body.metadata?.year || new Date().getFullYear(),
            highlights: body.metadata?.highlights || [],
            topSuggestion: body.metadata?.topSuggestion,
            newConnections: body.metadata?.newConnections || 0,
            coursesCompleted: body.metadata?.coursesCompleted || 0,
            badgesEarned: body.metadata?.badgesEarned || 0,
            dashboardUrl: 'https://viverdeia.ai/dashboard',
          })
        )
        subject = `📊 Seu resumo semanal Viver de IA`
        break

      default:
        // Template genérico para notificações sem template específico
        emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto;">
                <h2>${body.title}</h2>
                <p>${body.message}</p>
              </div>
            </body>
          </html>
        `
        subject = body.title
    }

    // Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Viver de IA <notifications@viverdeia.ai>',
      to: [profile.email],
      subject,
      html: emailHtml,
    })

    if (error) {
      throw error
    }

    console.log('✅ [NOTIFICATION-EMAIL] Email enviado:', data)

    // Registrar envio na tabela de delivery
    await supabase
      .from('notification_delivery')
      .insert({
        notification_id: body.notificationId,
        channel: 'email',
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider: 'resend',
        provider_id: data.id,
        metadata: {
          templateKey,
          recipient: profile.email,
        },
      })

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('❌ [NOTIFICATION-EMAIL] Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
