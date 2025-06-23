
import { supabase } from '@/lib/supabase';
import { auditLogger } from '@/utils/auditLogger';
import { logger } from '@/utils/logger';

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime?: Date;
  blocked?: boolean;
}

class SecureRateLimiting {
  private defaultConfig: RateLimitConfig = {
    maxAttempts: 5,
    windowMinutes: 15,
    blockDurationMinutes: 30
  };

  async checkRateLimit(
    identifier: string,
    action: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    try {
      // Buscar tentativas recentes
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - finalConfig.windowMinutes);
      
      const { data: attempts, error } = await supabase
        .from('rate_limit_attempts')
        .select('*')
        .eq('identifier', identifier)
        .eq('action', action)
        .gte('created_at', windowStart.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao verificar rate limit:', {
          component: 'RATE_LIMITING',
          error: error.message,
          identifier,
          action
        });
        // Em caso de erro, permitir a ação (fail-open)
        return { allowed: true, remaining: finalConfig.maxAttempts };
      }

      const recentAttempts = attempts || [];
      
      // Verificar se está bloqueado
      const latestAttempt = recentAttempts[0];
      if (latestAttempt?.blocked_until) {
        const blockedUntil = new Date(latestAttempt.blocked_until);
        if (blockedUntil > new Date()) {
          await auditLogger.logSecurityEvent('rate_limit_blocked', 'medium', {
            identifier,
            action,
            blockedUntil: blockedUntil.toISOString()
          });
          
          return {
            allowed: false,
            remaining: 0,
            resetTime: blockedUntil,
            blocked: true
          };
        }
      }

      // Contar tentativas na janela de tempo
      const validAttempts = recentAttempts.filter(
        attempt => !attempt.blocked_until
      );

      if (validAttempts.length >= finalConfig.maxAttempts) {
        // Bloquear por excesso de tentativas
        const blockUntil = new Date();
        blockUntil.setMinutes(blockUntil.getMinutes() + finalConfig.blockDurationMinutes);
        
        await this.recordAttempt(identifier, action, true, blockUntil);
        
        await auditLogger.logSecurityEvent('rate_limit_exceeded', 'high', {
          identifier,
          action,
          attempts: validAttempts.length,
          blockedUntil: blockUntil.toISOString()
        });
        
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockUntil,
          blocked: true
        };
      }

      // Registrar tentativa
      await this.recordAttempt(identifier, action);
      
      return {
        allowed: true,
        remaining: finalConfig.maxAttempts - validAttempts.length - 1
      };
      
    } catch (error) {
      logger.error('Erro inesperado no rate limiting:', {
        component: 'RATE_LIMITING',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        identifier,
        action
      });
      
      // Em caso de erro, permitir a ação (fail-open)
      return { allowed: true, remaining: finalConfig.maxAttempts };
    }
  }

  private async recordAttempt(
    identifier: string,
    action: string,
    blocked: boolean = false,
    blockedUntil?: Date
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_limit_attempts')
        .insert({
          identifier,
          action,
          blocked_until: blockedUntil?.toISOString() || null,
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Erro ao registrar tentativa de rate limit:', {
          component: 'RATE_LIMITING',
          error: error.message,
          identifier,
          action
        });
      }
    } catch (error) {
      logger.error('Erro inesperado ao registrar tentativa:', {
        component: 'RATE_LIMITING',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        identifier,
        action
      });
    }
  }

  async clearRateLimit(identifier: string, action: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_limit_attempts')
        .delete()
        .eq('identifier', identifier)
        .eq('action', action);

      if (error) {
        logger.error('Erro ao limpar rate limit:', {
          component: 'RATE_LIMITING',
          error: error.message,
          identifier,
          action
        });
      } else {
        await auditLogger.logSecurityEvent('rate_limit_cleared', 'low', {
          identifier,
          action
        });
      }
    } catch (error) {
      logger.error('Erro inesperado ao limpar rate limit:', {
        component: 'RATE_LIMITING',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        identifier,
        action
      });
    }
  }
}

export const secureRateLimiting = new SecureRateLimiting();
