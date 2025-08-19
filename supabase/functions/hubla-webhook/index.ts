import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hubla-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const hublaToken = Deno.env.get('HUBLA_API_TOKEN')!

serve(async (req: Request) => {
  console.log(`[Hubla Webhook] ${req.method} request received`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get webhook payload
    const payload = await req.json()
    console.log('[Hubla Webhook] Payload received:', JSON.stringify(payload, null, 2))

    // Get headers for verification
    const hublaSignature = req.headers.get('x-hubla-signature')
    const userAgent = req.headers.get('user-agent')
    const contentType = req.headers.get('content-type')

    // Store webhook data for analysis
    const webhookData = {
      event_type: payload.event || payload.type || 'unknown',
      payload: payload,
      headers: {
        signature: hublaSignature,
        userAgent: userAgent,
        contentType: contentType
      },
      received_at: new Date().toISOString(),
      processed: false,
      processing_notes: null
    }

    // Save to database for admin review
    const { data: savedWebhook, error: saveError } = await supabase
      .from('hubla_webhooks')
      .insert([webhookData])
      .select()
      .single()

    if (saveError) {
      console.error('[Hubla Webhook] Error saving webhook:', saveError)
      return new Response(JSON.stringify({ 
        error: 'Failed to save webhook data',
        details: saveError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('[Hubla Webhook] Webhook saved successfully:', savedWebhook.id)

    // Process different webhook types
    let processingResult = { success: true, message: 'Webhook received and stored' }

    switch (payload.type) {
      case 'NewSale':
      case 'NewUser':
        processingResult = await handleLovableCourseInvite(payload, supabase)
        break
      
      case 'CanceledSale':
      case 'CanceledSubscription':
        processingResult = await handleCourseCancellation(payload, supabase)
        break
      
      case 'payment.approved':
      case 'payment.completed':
        processingResult = await handlePaymentSuccess(payload, supabase)
        break
      
      case 'payment.failed':
      case 'payment.declined':
        processingResult = await handlePaymentFailed(payload, supabase)
        break
      
      case 'subscription.created':
        processingResult = await handleSubscriptionCreated(payload, supabase)
        break
      
      case 'subscription.cancelled':
        processingResult = await handleSubscriptionCancelled(payload, supabase)
        break
      
      default:
        console.log(`[Hubla Webhook] Unknown event type: ${payload.type}`)
        processingResult = { success: true, message: `Unknown event type stored for review: [object Object]` }
    }

    // Update webhook record with processing result
    await supabase
      .from('hubla_webhooks')
      .update({
        processed: processingResult.success,
        processing_notes: processingResult.message
      })
      .eq('id', savedWebhook.id)

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      webhook_id: savedWebhook.id,
      event_type: webhookData.event_type,
      processing: processingResult
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Hubla Webhook] Unexpected error:', error)
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Função auxiliar para formatar telefone brasileiro
function formatBrazilianPhone(rawPhone: string): string {
  if (!rawPhone) return null
  
  // Remove espaços e caracteres especiais
  const cleaned = rawPhone.replace(/\D/g, '')
  
  // Se já tem 13 dígitos (55 + DDD + número), retorna com +
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return `+${cleaned}`
  }
  
  // Se tem 11 dígitos (DDD + número), adiciona +55
  if (cleaned.length === 11) {
    return `+55${cleaned}`
  }
  
  // Se tem 10 dígitos (DDD sem 9 + número), adiciona 9 e +55
  if (cleaned.length === 10) {
    const ddd = cleaned.substring(0, 2)
    const number = cleaned.substring(2)
    return `+55${ddd}9${number}`
  }
  
  // Formato não reconhecido, tenta adicionar +55 mesmo assim
  console.warn(`[Hubla Webhook] Unrecognized phone format: ${rawPhone}`)
  return `+55${cleaned}`
}

async function handlePaymentSuccess(payload: any, supabase: any) {
  console.log('[Hubla Webhook] Processing payment success:', payload.payment_id || payload.id)
  
  try {
    // Extract payment details
    const paymentId = payload.payment_id || payload.id
    const customerEmail = payload.customer?.email || payload.email
    const amount = payload.amount || payload.value
    const productId = payload.product_id || payload.product?.id
    
    // TODO: Implement your payment success logic here
    // Examples:
    // - Update user subscription status
    // - Grant access to courses/tools
    // - Send confirmation email
    // - Update user role
    
    console.log('[Hubla Webhook] Payment success processed:', {
      paymentId,
      customerEmail,
      amount,
      productId
    })
    
    return { success: true, message: 'Payment success processed successfully' }
    
  } catch (error) {
    console.error('[Hubla Webhook] Error processing payment success:', error)
    return { success: false, message: `Payment processing error: ${error.message}` }
  }
}

async function handlePaymentFailed(payload: any, supabase: any) {
  console.log('[Hubla Webhook] Processing payment failure:', payload.payment_id || payload.id)
  
  try {
    // Extract payment details
    const paymentId = payload.payment_id || payload.id
    const customerEmail = payload.customer?.email || payload.email
    const failureReason = payload.failure_reason || payload.error
    
    // TODO: Implement your payment failure logic here
    // Examples:
    // - Log failed payment
    // - Send failure notification
    // - Update payment status
    
    console.log('[Hubla Webhook] Payment failure processed:', {
      paymentId,
      customerEmail,
      failureReason
    })
    
    return { success: true, message: 'Payment failure processed successfully' }
    
  } catch (error) {
    console.error('[Hubla Webhook] Error processing payment failure:', error)
    return { success: false, message: `Payment failure processing error: ${error.message}` }
  }
}

async function handleSubscriptionCreated(payload: any, supabase: any) {
  console.log('[Hubla Webhook] Processing subscription creation:', payload.subscription_id || payload.id)
  
  try {
    // Extract subscription details
    const subscriptionId = payload.subscription_id || payload.id
    const customerEmail = payload.customer?.email || payload.email
    const planId = payload.plan_id || payload.plan?.id
    
    // TODO: Implement your subscription creation logic here
    // Examples:
    // - Update user role
    // - Grant premium access
    // - Send welcome email
    
    console.log('[Hubla Webhook] Subscription creation processed:', {
      subscriptionId,
      customerEmail,
      planId
    })
    
    return { success: true, message: 'Subscription creation processed successfully' }
    
  } catch (error) {
    console.error('[Hubla Webhook] Error processing subscription creation:', error)
    return { success: false, message: `Subscription creation processing error: ${error.message}` }
  }
}

async function handleLovableCourseInvite(payload: any, supabase: any) {
  console.log('[Hubla Webhook] Processing Lovable course purchase/user creation')
  
  try {
    const event = payload.event
    if (!event) {
      return { success: false, message: 'No event data found in payload' }
    }

    // Verificar se é o curso Lovable na Prática
    const isLovableCourse = event.groupId === '3rYUFiiBV8zHXFAjnEmZ' || 
                           event.groupName?.includes('Lovable na Prática')

    if (!isLovableCourse) {
      console.log('[Hubla Webhook] Not Lovable course, skipping invite creation')
      return { success: true, message: 'Not Lovable course - no action needed' }
    }

    const userEmail = event.userEmail
    const userName = event.userName
    const rawPhone = event.userPhone
    
    // Tratar formato do telefone brasileiro da Hubla
    const userPhone = rawPhone ? formatBrazilianPhone(rawPhone) : null

    if (!userEmail) {
      return { success: false, message: 'No user email found in event data' }
    }

    console.log('[Hubla Webhook] Creating invite for Lovable course:', {
      email: userEmail,
      name: userName,
      phone: userPhone,
      groupName: event.groupName
    })

    // Buscar role ID do lovable_course
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'lovable_course')
      .single()

    if (roleError || !roleData) {
      console.error('[Hubla Webhook] Error finding lovable_course role:', roleError)
      return { success: false, message: 'Failed to find lovable_course role' }
    }

    // Verificar se já existe um convite para este email
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id, used_at')
      .eq('email', userEmail)
      .eq('role_id', roleData.id)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingInvite && existingInvite.length > 0) {
      console.log('[Hubla Webhook] Invite already exists for this email and role')
      return { success: true, message: 'Invite already exists for this user' }
    }

    // Criar convite automaticamente
    const inviteData = {
      email: userEmail,
      role_id: roleData.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      created_by: null, // Sistema automático
      notes: `Convite automático - Compra do curso "${event.groupName}" via Hubla`,
      whatsapp_number: userPhone,
      preferred_channel: userPhone ? 'both' : 'email'
    }

    const { data: newInvite, error: inviteError } = await supabase
      .from('invites')
      .insert([inviteData])
      .select(`
        *,
        user_roles (name, description)
      `)
      .single()

    if (inviteError) {
      console.error('[Hubla Webhook] Error creating invite:', inviteError)
      return { success: false, message: `Failed to create invite: ${inviteError.message}` }
    }

    console.log('[Hubla Webhook] Invite created successfully:', newInvite.id)

    // Processar envio do convite (email + WhatsApp se disponível)
    try {
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-invite', {
        body: { invite_id: newInvite.id }
      })

      if (processError) {
        console.error('[Hubla Webhook] Error processing invite:', processError)
        return { 
          success: true, // Convite criado com sucesso, mas falha no envio
          message: `Invite created but failed to send: ${processError.message}` 
        }
      }

      console.log('[Hubla Webhook] Invite processed and sent successfully')
      return { 
        success: true, 
        message: `Lovable course invite created and sent to ${userEmail}${userPhone ? ' and ' + userPhone : ''}` 
      }

    } catch (processError) {
      console.error('[Hubla Webhook] Error in invite processing:', processError)
      return { 
        success: true,
        message: `Invite created but failed to send: ${processError.message}` 
      }
    }

  } catch (error) {
    console.error('[Hubla Webhook] Error in handleLovableCourseInvite:', error)
    return { success: false, message: `Course invite processing error: ${error.message}` }
  }
}

async function handleCourseCancellation(payload: any, supabase: any) {
  console.log('[Hubla Webhook] Processing course cancellation')
  
  try {
    const event = payload.event
    if (!event) {
      return { success: true, message: 'No event data found in payload' }
    }

    // Verificar se é o curso Lovable na Prática
    const isLovableCourse = event.groupId === '3rYUFiiBV8zHXFAjnEmZ' || 
                           event.groupName?.includes('Lovable na Prática')

    if (!isLovableCourse) {
      return { success: true, message: 'Not Lovable course - no action needed' }
    }

    const userEmail = event.userEmail

    if (!userEmail) {
      return { success: true, message: 'No user email found in event data' }
    }

    console.log('[Hubla Webhook] Processing cancellation for:', userEmail)

    // Buscar role ID do lovable_course
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'lovable_course')
      .single()

    if (!roleData) {
      return { success: true, message: 'lovable_course role not found' }
    }

    // 1. Expirar convites não utilizados
    const { data: invites } = await supabase
      .from('invites')
      .select('id')
      .eq('email', userEmail)
      .eq('role_id', roleData.id)
      .is('used_at', null)

    if (invites && invites.length > 0) {
      await supabase
        .from('invites')
        .update({ expires_at: new Date().toISOString() })
        .in('id', invites.map(i => i.id))

      console.log(`[Hubla Webhook] Expired ${invites.length} unused invites for ${userEmail}`)
    }

    // 2. REVOGAR ACESSO: Buscar usuário ativo com essa role e remover
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email, role_id, user_roles(name)')
      .eq('email', userEmail)
      .eq('role_id', roleData.id)
      .single()

    if (existingUser) {
      console.log(`[Hubla Webhook] Found active user with lovable_course role: ${existingUser.id}`)
      
      // Remover acesso completamente - sem fallback para outras roles
      const fallbackRoleId = null

      // Remover role do usuário (perda de acesso total)
      const { error: downgradeError } = await supabase
        .from('profiles')
        .update({ 
          role_id: null, // Remove acesso completamente
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)

      if (downgradeError) {
        console.error('[Hubla Webhook] Error removing user access:', downgradeError)
      } else {
        console.log(`[Hubla Webhook] User ${userEmail} access removed - no longer has lovable_course role`)
      }

      // Log da revogação para auditoria
      await supabase
        .from('audit_logs')
        .insert([{
          user_id: existingUser.id,
          event_type: 'role_revocation',
          action: 'course_cancellation',
          details: {
            reason: 'Hubla course cancellation',
            webhook_type: payload.type,
            course_group: event.groupName,
            previous_role: 'lovable_course',
            new_role: null // Acesso removido completamente
          },
          severity: 'info'
        }])
    }

    return { 
      success: true, 
      message: `Course cancellation processed for ${userEmail} - ${invites?.length || 0} invites expired${existingUser ? ', user access revoked' : ''}` 
    }

  } catch (error) {
    console.error('[Hubla Webhook] Error processing course cancellation:', error)
    return { success: false, message: `Course cancellation processing error: ${error.message}` }
  }
}

async function handleSubscriptionCancelled(payload: any, supabase: any) {
  console.log('[Hubla Webhook] Processing subscription cancellation:', payload.subscription_id || payload.id)
  
  try {
    // Extract subscription details
    const subscriptionId = payload.subscription_id || payload.id
    const customerEmail = payload.customer?.email || payload.email
    const cancellationReason = payload.cancellation_reason || payload.reason
    
    // TODO: Implement your subscription cancellation logic here
    // Examples:
    // - Downgrade user role
    // - Revoke premium access
    // - Send cancellation confirmation
    
    console.log('[Hubla Webhook] Subscription cancellation processed:', {
      subscriptionId,
      customerEmail,
      cancellationReason
    })
    
    return { success: true, message: 'Subscription cancellation processed successfully' }
    
  } catch (error) {
    console.error('[Hubla Webhook] Error processing subscription cancellation:', error)
    return { success: false, message: `Subscription cancellation processing error: ${error.message}` }
  }
}