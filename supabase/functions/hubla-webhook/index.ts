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

    switch (payload.event || payload.type) {
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
        console.log(`[Hubla Webhook] Unknown event type: ${payload.event || payload.type}`)
        processingResult = { success: true, message: `Unknown event type stored for review: ${payload.event || payload.type}` }
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