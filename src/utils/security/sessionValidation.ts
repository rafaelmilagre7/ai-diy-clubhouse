import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { secureLogger } from './productionSafeLogging';

interface SessionValidationResult {
  isValid: boolean;
  reason?: string;
  shouldRefresh?: boolean;
}

/**
 * Valida se a sessão atual ainda é válida
 */
export const validateCurrentSession = async (): Promise<SessionValidationResult> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      secureLogger.warn({
        level: 'warn',
        message: 'Session validation error',
        data: { error: error.message }
      });
      return { isValid: false, reason: 'Session error' };
    }
    
    if (!session) {
      return { isValid: false, reason: 'No session found' };
    }
    
    // Verificar se o token está próximo do vencimento (30 minutos antes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    const thirtyMinutes = 30 * 60;
    
    if (timeUntilExpiry <= 0) {
      return { isValid: false, reason: 'Session expired' };
    }
    
    if (timeUntilExpiry <= thirtyMinutes) {
      return { 
        isValid: true, 
        shouldRefresh: true,
        reason: 'Session expires soon'
      };
    }
    
    return { isValid: true };
    
  } catch (error) {
    secureLogger.error({
      level: 'error',
      message: 'Critical error in session validation',
      data: { error }
    });
    return { isValid: false, reason: 'Validation failed' };
  }
};

/**
 * Configura validação automática de sessão
 */
export const setupSessionValidation = (onSessionInvalid: () => void) => {
  const validateInterval = setInterval(async () => {
    const result = await validateCurrentSession();
    
    if (!result.isValid) {
      secureLogger.warn({
        level: 'warn',
        message: 'Session invalidated during validation',
        data: { reason: result.reason }
      });
      onSessionInvalid();
      clearInterval(validateInterval);
    } else if (result.shouldRefresh) {
      secureLogger.info({
        level: 'info',
        message: 'Refreshing session token',
        data: { reason: result.reason }
      });
      
      // Tentar renovar o token
      try {
        await supabase.auth.refreshSession();
      } catch (error) {
        secureLogger.error({
          level: 'error',
          message: 'Failed to refresh session',
          data: { error }
        });
        onSessionInvalid();
        clearInterval(validateInterval);
      }
    }
  }, 5 * 60 * 1000); // Verificar a cada 5 minutos
  
  return () => clearInterval(validateInterval);
};

/**
 * Valida sessão antes de operações sensíveis
 */
export const validateSensitiveOperation = async (operationType: string): Promise<boolean> => {
  const result = await validateCurrentSession();
  
  if (!result.isValid) {
    secureLogger.security('Sensitive operation blocked - invalid session', undefined, {
      operation: operationType,
      reason: result.reason
    });
    return false;
  }
  
  secureLogger.info({
    level: 'info',
    message: 'Sensitive operation validated',
    data: { operation: operationType }
  });
  
  return true;
};

/**
 * Detecta múltiplas sessões ativas (básico)
 */
export const detectConcurrentSessions = async (userId: string): Promise<boolean> => {
  try {
    // Verificar logs de audit para detectar logins múltiplos recentes
    const { data: recentLogins, error } = await supabase
      .from('audit_logs')
      .select('session_id, timestamp')
      .eq('user_id', userId)
      .eq('event_type', 'auth')
      .eq('action', 'login')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(5);
    
    if (error || !recentLogins) {
      return false;
    }
    
    // Se há mais de 3 logins nas últimas 24h com sessões diferentes
    const uniqueSessions = new Set(recentLogins.map(log => log.session_id));
    const hasConcurrentSessions = uniqueSessions.size > 3;
    
    if (hasConcurrentSessions) {
      secureLogger.security('Multiple concurrent sessions detected', userId, {
        sessionCount: uniqueSessions.size,
        recentLogins: recentLogins.length
      });
    }
    
    return hasConcurrentSessions;
    
  } catch (error) {
    secureLogger.error({
      level: 'error',
      message: 'Error detecting concurrent sessions',
      userId,
      data: { error }
    });
    return false;
  }
};