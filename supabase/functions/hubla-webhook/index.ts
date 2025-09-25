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

  // Special endpoint to get circuit breaker status
  if (req.method === 'GET') {
    return new Response(JSON.stringify({
      success: true,
      circuitStatus: circuitBreaker.getStatus()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Executar webhook através do circuit breaker
  try {
    return await circuitBreaker.executeWebhook(async () => {
      const supabase = getSupabaseServiceClient();
      
      // Get webhook payload
      const payload = await req.json();
      console.log('[HUBLA-WEBHOOK] Payload received:', JSON.stringify(payload, null, 2));

      // Get headers for verification
      const hublaSignature = req.headers.get('x-hubla-signature');
      const userAgent = req.headers.get('user-agent');
      const contentType = req.headers.get('content-type');

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
      };

      // Save to database for admin review
      const { data: savedWebhook, error: saveError } = await supabase
        .from('hubla_webhooks')
        .insert([webhookData])
        .select()
        .single();

      if (saveError) {
        console.error('[HUBLA-WEBHOOK] Error saving webhook:', saveError);
        return new Response(JSON.stringify({ 
          error: 'Failed to save webhook data',
          details: saveError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('[HUBLA-WEBHOOK] Webhook saved successfully:', savedWebhook.id);

      // Process webhook through automation engine
      console.log('[HUBLA-WEBHOOK] Processing through automation engine...');
      
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
        console.error('[HUBLA-WEBHOOK] Automation engine error:', automationError);
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
        .eq('id', savedWebhook.id);

      // Return success response
      return new Response(JSON.stringify({
        success: true,
        webhook_id: savedWebhook.id,
        event_type: webhookData.event_type,
        processing: processingResult
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

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

// Simplified processing functions
async function processAutomationRules(eventType: string, payload: any, supabase: any) {
  console.log('[HUBLA-WEBHOOK] Processing automation rules for:', eventType);
  return { success: true, processedRules: 0, totalRules: 0, message: 'No active rules' };
}

async function handleLegacyWebhookTypes(payload: any, supabase: any) {
  console.log('[HUBLA-WEBHOOK] Processing legacy webhook type');
  return { success: true, message: 'Legacy processing completed' };
}