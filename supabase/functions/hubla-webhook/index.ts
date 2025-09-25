import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getSupabaseServiceClient, cleanupConnections } from '../_shared/supabase-client.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hubla-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const hublaToken = Deno.env.get('HUBLA_API_TOKEN')!

// CIRCUIT BREAKER HUBLA - PROTEÇÃO ANTI-COLAPSO
class HublaCircuitBreaker {
  private static instance: HublaCircuitBreaker;
  private activeWebhooks = 0;
  private readonly MAX_CONCURRENT = 5;
  private readonly QUEUE_TIMEOUT = 30000; // 30s
  private readonly RECOVERY_TIME = 120000; // 2min
  private isCircuitOpen = false;
  private lastFailure = 0;
  private failureCount = 0;
  private readonly FAILURE_THRESHOLD = 3;

  static getInstance(): HublaCircuitBreaker {
    if (!HublaCircuitBreaker.instance) {
      HublaCircuitBreaker.instance = new HublaCircuitBreaker();
    }
    return HublaCircuitBreaker.instance;
  }

  async executeWebhook<T>(operation: () => Promise<T>): Promise<T> {
    // Verificar se circuit está aberto
    if (this.isCircuitOpen) {
      if (Date.now() - this.lastFailure > this.RECOVERY_TIME) {
        console.log('🔄 [CIRCUIT-BREAKER] Tentando recuperação...');
        this.isCircuitOpen = false;
        this.failureCount = 0;
      } else {
        throw new Error('🚫 CIRCUIT BREAKER ATIVO - Sistema em proteção');
      }
    }

    // Verificar limite de webhooks simultâneos
    if (this.activeWebhooks >= this.MAX_CONCURRENT) {
      console.warn(`⚠️ [CIRCUIT-BREAKER] Limite atingido: ${this.activeWebhooks}/${this.MAX_CONCURRENT}`);
      throw new Error(`🔥 SOBRECARGA - Máximo ${this.MAX_CONCURRENT} webhooks simultâneos permitidos`);
    }

    this.activeWebhooks++;
    console.log(`📊 [CIRCUIT-BREAKER] Webhooks ativos: ${this.activeWebhooks}/${this.MAX_CONCURRENT}`);

    try {
      // Timeout para evitar webhooks presos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('⏰ TIMEOUT - Webhook excedeu 30s')), this.QUEUE_TIMEOUT);
      });

      const result = await Promise.race([operation(), timeoutPromise]) as T;
      
      // Reset failure count em sucesso
      this.failureCount = 0;
      return result;
    } catch (error) {
      this.failureCount++;
      console.error(`❌ [CIRCUIT-BREAKER] Falha ${this.failureCount}/${this.FAILURE_THRESHOLD}:`, error);
      
      if (this.failureCount >= this.FAILURE_THRESHOLD) {
        this.isCircuitOpen = true;
        this.lastFailure = Date.now();
        console.error('🚨 [CIRCUIT-BREAKER] CIRCUIT ABERTO - Sistema em proteção por 2min');
      }
      
      throw error;
    } finally {
      this.activeWebhooks--;
      console.log(`📉 [CIRCUIT-BREAKER] Webhooks ativos: ${this.activeWebhooks}/${this.MAX_CONCURRENT}`);
    }
  }

  getStatus() {
    return {
      activeWebhooks: this.activeWebhooks,
      maxConcurrent: this.MAX_CONCURRENT,
      isCircuitOpen: this.isCircuitOpen,
      failureCount: this.failureCount,
      utilizationPercent: (this.activeWebhooks / this.MAX_CONCURRENT) * 100
    };
  }
}

serve(async (req: Request) => {
  const circuitBreaker = HublaCircuitBreaker.getInstance();
  
  console.log(`🚀 [HUBLA-WEBHOOK] ${req.method} request received`);
  console.log(`📊 [CIRCUIT-STATUS]`, circuitBreaker.getStatus());

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Executar webhook através do circuit breaker
  try {
    return await circuitBreaker.executeWebhook(async () => {
      const supabase = getSupabaseServiceClient()
    
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

    // Process webhook through automation engine
    console.log('[Hubla Webhook] Processing through automation engine...');
    
    let processingResult;
    try {
      // Processar através do novo sistema de automações
      const automationResult = await processAutomationRules(payload.type || payload.event?.type || 'unknown', payload, supabase);
      
      if (automationResult && automationResult.processedRules > 0) {
        processingResult = {
          success: automationResult.success,
          message: `Processed ${automationResult.processedRules}/${automationResult.totalRules} automation rules`,
          automationResults: automationResult.results
        };
      } else {
        // Fallback para lógica legada se nenhuma regra for processada
        processingResult = await handleLegacyWebhookTypes(payload, supabase);
      }
    } catch (automationError) {
      console.error('[Hubla Webhook] Automation engine error:', automationError);
      // Fallback para lógica legada em caso de erro
      processingResult = await handleLegacyWebhookTypes(payload, supabase);
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
    });
  } catch (circuitError) {
    console.error('🔥 [CIRCUIT-BREAKER] Webhook rejeitado:', circuitError.message);
    
    return new Response(JSON.stringify({
      error: 'Service Temporarily Unavailable',
      message: circuitError.message,
      circuitStatus: circuitBreaker.getStatus()
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } finally {
    cleanupConnections();
  }
})

// Nova função para processar regras de automação
async function processAutomationRules(eventType: string, payload: any, supabase: any) {
  console.log('[Hubla Webhook] Processing automation rules for:', eventType);
  
  try {
    // Buscar regras ativas que correspondem ao evento
    const { data: rules, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)
      .eq('rule_type', 'webhook')
      .order('priority', { ascending: false });

    if (error) {
      console.error('[Hubla Webhook] Error fetching automation rules:', error);
      return { success: false, error: error.message };
    }

    if (!rules || rules.length === 0) {
      console.log('[Hubla Webhook] No active automation rules found');
      return { success: true, processedRules: 0, totalRules: 0, message: 'No active rules' };
    }

    let processedRules = 0;
    const results = [];
    const context = {
      webhookPayload: payload,
      eventType,
      triggeredAt: new Date()
    };

    // Processar cada regra
    for (const rule of rules) {
      try {
        console.log(`[Hubla Webhook] Processing rule: ${rule.name} (${rule.id})`);
        
        const startTime = Date.now();
        
        // Avaliar condições da regra
        const conditionsMet = await evaluateRuleConditions(rule.conditions, context);
        
        if (conditionsMet) {
          console.log(`[Hubla Webhook] Conditions met for rule: ${rule.name}`);
          
          // Executar ações da regra
          const actionResults = await executeRuleActions(rule.actions, context, rule, supabase);
          
          const executionTime = Date.now() - startTime;
          
          // Log da execução
          await logRuleExecution(rule.id, context, actionResults, executionTime, supabase);
          
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: actionResults.success,
            actions: actionResults.results,
            executionTime
          });
          
          processedRules++;
        } else {
          console.log(`[Hubla Webhook] Conditions not met for rule: ${rule.name}`);
        }
        
      } catch (ruleError) {
        console.error(`[Hubla Webhook] Error processing rule ${rule.name}:`, ruleError);
        
        // Log do erro
        await logRuleExecution(rule.id, context, {
          success: false,
          error: ruleError.message,
          results: []
        }, 0, supabase);
        
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          success: false,
          error: ruleError.message
        });
      }
    }

    console.log(`[Hubla Webhook] Processed ${processedRules} automation rules successfully`);
    
    return {
      success: true,
      processedRules,
      totalRules: rules.length,
      results
    };
    
  } catch (error) {
    console.error('[Hubla Webhook] Fatal error processing automation rules:', error);
    return { success: false, error: error.message };
  }
}

// Função para avaliar condições de uma regra
async function evaluateRuleConditions(conditions: any, context: any): Promise<boolean> {
  if (!conditions || typeof conditions !== 'object') {
    return true; // Sem condições = sempre executar
  }

  // Se é um grupo de condições com novo formato
  if ('conditions' in conditions && Array.isArray(conditions.conditions)) {
    return evaluateConditionGroup(conditions, context);
  }

  // Formato legado - compatibilidade
  if (conditions.event_types && Array.isArray(conditions.event_types)) {
    return conditions.event_types.includes(context.eventType);
  }

  if (conditions.products && Array.isArray(conditions.products)) {
    const productId = extractFieldValue('payload.product_id', context) || 
                     extractFieldValue('payload.event.groupId', context) ||
                     extractFieldValue('product_id', context);
    
    return conditions.products.includes('all') || conditions.products.includes(productId);
  }

  return true;
}

// Função para avaliar grupo de condições
function evaluateConditionGroup(group: any, context: any): boolean {
  if (!group.conditions || group.conditions.length === 0) {
    return true;
  }

  const results = group.conditions.map((condition: any) => {
    if ('conditions' in condition) {
      // É um subgrupo
      return evaluateConditionGroup(condition, context);
    } else {
      // É uma condição individual
      return evaluateCondition(condition, context);
    }
  });

  // Aplicar operador lógico
  return group.operator === 'AND' 
    ? results.every(result => result)
    : results.some(result => result);
}

// Função para avaliar condição individual
function evaluateCondition(condition: any, context: any): boolean {
  const value = extractFieldValue(condition.field, context);
  
  switch (condition.operator) {
    case 'equals':
      return value === condition.value;
    case 'not_equals':
      return value !== condition.value;
    case 'contains':
      return String(value).includes(String(condition.value));
    case 'not_contains':
      return !String(value).includes(String(condition.value));
    case 'starts_with':
      return String(value).startsWith(String(condition.value));
    case 'ends_with':
      return String(value).endsWith(String(condition.value));
    case 'empty':
      return !value || value === '' || value === null || value === undefined;
    case 'not_empty':
      return value && value !== '' && value !== null && value !== undefined;
    case 'greater_than':
      return Number(value) > Number(condition.value);
    case 'less_than':
      return Number(value) < Number(condition.value);
    case 'greater_equal':
      return Number(value) >= Number(condition.value);
    case 'less_equal':
      return Number(value) <= Number(condition.value);
    default:
      console.warn(`[Hubla Webhook] Unknown operator: ${condition.operator}`);
      return false;
  }
}

// Função para extrair valor de campo
function extractFieldValue(fieldPath: string, context: any): any {
  if (fieldPath === 'event_type') {
    return context.eventType;
  }

  // Navegar pelo payload usando notação de ponto
  const parts = fieldPath.split('.');
  let value = context.webhookPayload;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }

  return value;
}

// Função para executar ações de uma regra
async function executeRuleActions(actions: any[], context: any, rule: any, supabase: any) {
  if (!actions || actions.length === 0) {
    return { success: true, results: [], message: 'No actions to execute' };
  }

  const results = [];
  let allSuccessful = true;

  // Ordenar ações por ordem
  const sortedActions = [...actions].sort((a, b) => (a.order || 0) - (b.order || 0));

  for (const action of sortedActions) {
    if (action.enabled === false) {
      continue;
    }

    try {
      console.log(`[Hubla Webhook] Executing action: ${action.type}`);
      
      let actionResult;
      switch (action.type) {
        case 'send_invite':
          actionResult = await executeSendInviteAction(action, context, rule, supabase);
          break;
        default:
          actionResult = { success: false, message: `Unknown action type: ${action.type}` };
      }
      
      results.push({
        type: action.type,
        success: actionResult.success,
        message: actionResult.message,
        data: actionResult.data
      });

      if (!actionResult.success) {
        allSuccessful = false;
      }
      
    } catch (actionError) {
      console.error(`[Hubla Webhook] Error executing action ${action.type}:`, actionError);
      results.push({
        type: action.type,
        success: false,
        error: actionError.message
      });
      allSuccessful = false;
    }
  }

  return {
    success: allSuccessful,
    results,
    message: `Executed ${results.length} actions`
  };
}

// Função para executar ação de envio de convite
async function executeSendInviteAction(action: any, context: any, rule: any, supabase: any) {
  try {
    const payload = context.webhookPayload;
    
    // Extrair dados do usuário do payload
    const userEmail = payload.customer?.email || payload.event?.userEmail || payload.email;
    const userName = payload.customer?.name || payload.event?.userName || payload.name;
    const userPhone = payload.customer?.phone || payload.event?.userPhone || payload.phone;
    const productId = payload.product_id || payload.event?.groupId || payload.product?.id;

    if (!userEmail) {
      return { success: false, message: 'No user email found in payload' };
    }

    // Determinar role baseado no mapeamento
    let roleId = action.parameters.role_id || 'default';
    
    if (action.parameters.role_mapping && productId) {
      roleId = action.parameters.role_mapping[productId] || action.parameters.role_mapping.default || roleId;
    }

    // Buscar role ID real
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', roleId)
      .single();

    if (!roleData) {
      return { success: false, message: `Role not found: ${roleId}` };
    }

    // Verificar se já existe convite
    const { data: existingInvite } = await supabase
      .from('invites')
      .select('id')
      .eq('email', userEmail)
      .eq('role_id', roleData.id)
      .is('used_at', null)
      .limit(1);

    if (existingInvite && existingInvite.length > 0) {
      return { success: true, message: 'Invite already exists for this user' };
    }

    // Gerar token
    const { data: token } = await supabase.rpc('generate_invite_token');
    if (!token) {
      return { success: false, message: 'Failed to generate invite token' };
    }

    // Encontrar criador admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    let creatorId = null;
    if (adminRole) {
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role_id', adminRole.id)
        .limit(1);
      creatorId = adminProfiles?.[0]?.id;
    }

    if (!creatorId) {
      return { success: false, message: 'No admin found to create invite' };
    }

    // Formatar telefone se necessário
    const formattedPhone = userPhone ? formatBrazilianPhone(userPhone) : null;

    // Criar convite
    const inviteData = {
      email: userEmail,
      role_id: roleData.id,
      token,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: creatorId,
      notes: `Convite automático - Regra: ${rule.name} | Produto: ${productId}`,
      whatsapp_number: formattedPhone,
      preferred_channel: formattedPhone ? 'both' : 'email'
    };

    const { data: newInvite, error } = await supabase
      .from('invites')
      .insert([inviteData])
      .select()
      .single();

    if (error) {
      return { success: false, message: `Failed to create invite: ${error.message}` };
    }

    // Processar envio se configurado
    if (action.parameters.auto_send !== false) {
      try {
        const { error: processError } = await supabase.functions.invoke('process-invite', {
          body: { inviteId: newInvite.id }
        });

        if (processError) {
          return {
            success: true,
            message: `Invite created but failed to send: ${processError.message}`,
            data: { inviteId: newInvite.id }
          };
        }
      } catch (sendError) {
        return {
          success: true,
          message: `Invite created but failed to send: ${sendError.message}`,
          data: { inviteId: newInvite.id }
        };
      }
    }

    return {
      success: true,
      message: `Invite created and sent to ${userEmail}`,
      data: { inviteId: newInvite.id, email: userEmail, role: roleId }
    };

  } catch (error) {
    return { success: false, message: `Send invite error: ${error.message}` };
  }
}

// Função para registrar execução da regra
async function logRuleExecution(ruleId: string, context: any, result: any, executionTime: number, supabase: any) {
  try {
    await supabase
      .from('automation_logs')
      .insert([{
        rule_id: ruleId,
        trigger_data: {
          event_type: context.eventType,
          payload: context.webhookPayload,
          triggered_at: context.triggeredAt
        },
        executed_actions: result.results || [],
        status: result.success ? 'success' : 'failed',
        error_message: result.error || null,
        execution_time_ms: executionTime
      }]);
  } catch (logError) {
    console.error('[Hubla Webhook] Error logging rule execution:', logError);
  }
}

// Função para lógica legada (fallback)
async function handleLegacyWebhookTypes(payload: any, supabase: any) {
  switch (payload.type) {
    case 'NewSale':
    case 'NewUser':
      return await handleLovableCourseInvite(payload, supabase);
    
    case 'CanceledSale':
    case 'CanceledSubscription':
      return await handleCourseCancellation(payload, supabase);
    
    case 'payment.approved':
    case 'payment.completed':
      return await handlePaymentSuccess(payload, supabase);
    
    case 'payment.failed':
    case 'payment.declined':
      return await handlePaymentFailed(payload, supabase);
    
    case 'subscription.created':
      return await handleSubscriptionCreated(payload, supabase);
    
    case 'subscription.cancelled':
      return await handleSubscriptionCancelled(payload, supabase);
    
    default:
      console.log(`[Hubla Webhook] Unknown event type: ${payload.type}`);
      return { success: true, message: `Unknown event type stored for review` };
  }
}

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

    // Gerar token único para o convite
    const { data: generatedToken, error: tokenGenError } = await supabase.rpc('generate_invite_token')
    if (tokenGenError || !generatedToken) {
      console.error('[Hubla Webhook] Error generating invite token:', tokenGenError)
      return { success: false, message: `Failed to generate invite token: ${tokenGenError?.message || 'Unknown error'}` }
    }

    // Encontrar um criador válido (admin) para cumprir FK de invites.created_by
    const { data: adminRole, error: adminRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'admin')
      .single()

    let creatorId: string | null = null
    if (!adminRoleError && adminRole?.id) {
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role_id', adminRole.id)
        .order('created_at', { ascending: true })
        .limit(1)
      creatorId = adminProfiles?.[0]?.id ?? null
    }

    if (!creatorId) {
      console.error('[Hubla Webhook] No admin profile found to use as creator')
      return { success: false, message: 'Nenhum admin encontrado para vincular como criador do convite' }
    }

    // Criar convite automaticamente (com token e created_by válido)
    const inviteData = {
      email: userEmail,
      role_id: roleData.id,
      token: generatedToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      created_by: creatorId, // Criador administrativo
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
        body: { inviteId: newInvite.id }
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