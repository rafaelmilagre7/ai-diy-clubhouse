import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getSupabaseServiceClient, cleanupConnections } from '../_shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RATE LIMITER CRÍTICO - ANTI-COLAPSO
class EmergencyRateLimiter {
  private static instance: EmergencyRateLimiter;
  private logCount = 0;
  private readonly MAX_LOGS_PER_MINUTE = 200;
  private readonly BATCH_SIZE = 50;
  private logBatch: any[] = [];
  private readonly resetTime = Date.now() + 60000; // 1 minuto
  private isEmergencyMode = false;

  static getInstance(): EmergencyRateLimiter {
    if (!EmergencyRateLimiter.instance) {
      EmergencyRateLimiter.instance = new EmergencyRateLimiter();
    }
    return EmergencyRateLimiter.instance;
  }

  async logWithRateLimit(logData: any, supabase: any): Promise<boolean> {
    // Reset contador a cada minuto
    if (Date.now() > this.resetTime) {
      this.logCount = 0;
      this.isEmergencyMode = false;
      console.log('🔄 [RATE-LIMITER] Contador resetado');
    }

    // Verificar limite crítico
    if (this.logCount >= this.MAX_LOGS_PER_MINUTE) {
      if (!this.isEmergencyMode) {
        this.isEmergencyMode = true;
        console.error('🚨 [RATE-LIMITER] MODO EMERGÊNCIA ATIVADO - Logs em batch apenas');
        
        // Log crítico de emergência
        await supabase.from('audit_logs').insert({
          event_type: 'system_emergency',
          action: 'rate_limit_emergency_activated',
          details: {
            log_count: this.logCount,
            max_allowed: this.MAX_LOGS_PER_MINUTE,
            emergency_activated_at: new Date().toISOString()
          },
          severity: 'critical'
        });
      }
      return false; // Rejeitar log
    }

    // Adicionar ao batch
    this.logBatch.push(logData);
    this.logCount++;

    // Processar batch quando atingir tamanho
    if (this.logBatch.length >= this.BATCH_SIZE) {
      await this.flushBatch(supabase);
    }

    return true;
  }

  private async flushBatch(supabase: any) {
    if (this.logBatch.length === 0) return;

    try {
      console.log(`📦 [RATE-LIMITER] Processando batch de ${this.logBatch.length} logs`);
      
      await supabase.from('audit_logs').insert(this.logBatch);
      
      console.log(`✅ [RATE-LIMITER] Batch de ${this.logBatch.length} logs processado`);
      this.logBatch = [];
    } catch (error) {
      console.error('❌ [RATE-LIMITER] Erro no batch:', error);
      // Em caso de erro, descartar batch para evitar loop infinito
      this.logBatch = [];
    }
  }

  async forceBatchFlush(supabase: any) {
    await this.flushBatch(supabase);
  }

  getStatus() {
    return {
      logCount: this.logCount,
      maxLogsPerMinute: this.MAX_LOGS_PER_MINUTE,
      batchSize: this.logBatch.length,
      utilizationPercent: (this.logCount / this.MAX_LOGS_PER_MINUTE) * 100,
      isEmergencyMode: this.isEmergencyMode,
      timeToReset: Math.max(0, this.resetTime - Date.now())
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rateLimiter = EmergencyRateLimiter.getInstance();
    const supabase = getSupabaseServiceClient();
    
    const { action, logData } = await req.json();
    
    switch (action) {
      case 'log':
        const success = await rateLimiter.logWithRateLimit(logData, supabase);
        return new Response(JSON.stringify({
          success,
          status: rateLimiter.getStatus()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'flush':
        await rateLimiter.forceBatchFlush(supabase);
        return new Response(JSON.stringify({
          success: true,
          message: 'Batch flushed successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'status':
        return new Response(JSON.stringify({
          success: true,
          status: rateLimiter.getStatus()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({
          error: 'Invalid action'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('[EMERGENCY-RATE-LIMITER] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } finally {
    cleanupConnections();
  }
});