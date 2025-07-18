import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

// FASE 5: CAMADAS DE SEGURANÇA ADICIONAIS
// =======================================

interface SecurityMetrics {
  loginAttempts: number;
  lastLoginAttempt: number;
  suspiciousActivity: number;
  blockedUntil?: number;
}

export const useSecurityEnforcement = () => {
  const { user, isLoading } = useAuth();
  const securityMetrics = useRef<SecurityMetrics>({
    loginAttempts: 0,
    lastLoginAttempt: 0,
    suspiciousActivity: 0
  });

  // Log de tentativas de acesso não autorizado
  useEffect(() => {
    if (!isLoading && !user) {
      const now = Date.now();
      const metrics = securityMetrics.current;
      
      // Detectar múltiplas tentativas em pouco tempo
      if (now - metrics.lastLoginAttempt < 5000) { // 5 segundos
        metrics.loginAttempts += 1;
        metrics.suspiciousActivity += 1;
        
        logger.warn('[SECURITY] Múltiplas tentativas de acesso detectadas', {
          attempts: metrics.loginAttempts,
          suspicious: metrics.suspiciousActivity,
          url: window.location.href,
          userAgent: navigator.userAgent.substring(0, 100),
          timestamp: new Date().toISOString()
        });

        // Bloquear temporariamente após muitas tentativas
        if (metrics.loginAttempts >= 5) {
          metrics.blockedUntil = now + 30000; // 30 segundos
          logger.error('[SECURITY] Usuário bloqueado temporariamente', {
            blockedUntil: new Date(metrics.blockedUntil).toISOString(),
            reason: 'too_many_attempts'
          });
        }
      }
      
      metrics.lastLoginAttempt = now;
    }
  }, [user, isLoading]);

  // Função para logar acessos críticos a dados
  const logDataAccess = useCallback(async (
    tableName: string, 
    operation: string, 
    resourceId?: string,
    additionalData?: any
  ) => {
    if (!user) {
      logger.warn('[SECURITY] Tentativa de log sem usuário autenticado', {
        tableName,
        operation,
        resourceId
      });
      return;
    }

    try {
      // Usar a nova função de rate limiting segura
      const { data: rateLimitResult } = await supabase.rpc('check_rate_limit_safe', {
        p_action: `data_access_${tableName}`,
        p_limit_per_hour: 300,
        p_limit_per_minute: 20
      });

      if (!rateLimitResult?.allowed) {
        logger.error('[SECURITY] Rate limit excedido para acesso a dados', {
          tableName,
          operation,
          rateLimitResult
        });
        throw new Error('Rate limit excedido');
      }

      // Log de auditoria usando a tabela audit_logs
      const { error } = await supabase.from('audit_logs').insert({
        user_id: user.id,
        event_type: 'data_access',
        action: operation,
        resource_id: resourceId,
        details: {
          table_name: tableName,
          timestamp: new Date().toISOString(),
          ip_address: await getUserIP(),
          user_agent: navigator.userAgent.substring(0, 200),
          additional_data: additionalData
        },
        severity: 'info'
      });

      if (error) throw error;

      logger.info('[SECURITY] Acesso a dados registrado', {
        tableName,
        operation,
        resourceId,
        userId: user.id
      });

    } catch (error) {
      // Falhar silenciosamente para não quebrar a experiência do usuário
      logger.error('[SECURITY] Erro ao registrar log de auditoria:', error);
    }
  }, [user]);

  // Função para verificar permissões antes de operações críticas
  const enforceUserDataAccess = useCallback((
    dataUserId: string, 
    operation: string = 'read',
    additionalChecks?: () => boolean
  ) => {
    if (!user) {
      logger.error('[SECURITY] Tentativa de acesso a dados sem autenticação', {
        operation,
        dataUserId,
        currentUrl: window.location.href
      });
      throw new Error('Acesso negado: usuário não autenticado');
    }

    // Verificar se está bloqueado temporariamente
    const now = Date.now();
    if (securityMetrics.current.blockedUntil && now < securityMetrics.current.blockedUntil) {
      logger.error('[SECURITY] Tentativa de acesso durante bloqueio', {
        userId: user.id,
        blockedUntil: new Date(securityMetrics.current.blockedUntil).toISOString()
      });
      throw new Error('Acesso temporariamente bloqueado');
    }

    // Verificar se é o próprio usuário ou admin
    if (user.id !== dataUserId) {
      logger.error('[SECURITY] Tentativa de acesso a dados de outro usuário', {
        currentUserId: user.id,
        targetUserId: dataUserId,
        operation,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
      throw new Error('Acesso negado: dados de outro usuário');
    }

    // Verificações adicionais se fornecidas
    if (additionalChecks && !additionalChecks()) {
      logger.error('[SECURITY] Verificação de segurança adicional falhou', {
        userId: user.id,
        operation,
        dataUserId
      });
      throw new Error('Acesso negado: verificação de segurança falhou');
    }

    // Log do acesso autorizado
    logDataAccess('user_data', operation, dataUserId, {
      access_type: 'own_data',
      verification_passed: true
    });

  }, [user, logDataAccess]);

  // Função para validar tokens de sessão
  const validateSession = useCallback(async () => {
    try {
      if (!user) return false;

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        logger.warn('[SECURITY] Sessão inválida detectada', {
          userId: user.id,
          error: error?.message
        });
        return false;
      }

      // Verificar se o token não está próximo do vencimento
      const now = Date.now() / 1000;
      const expiresAt = session.expires_at || 0;
      
      if (expiresAt - now < 300) { // 5 minutos
        logger.info('[SECURITY] Token próximo do vencimento, renovando...', {
          userId: user.id,
          expiresAt: new Date(expiresAt * 1000).toISOString()
        });
        
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          logger.error('[SECURITY] Erro ao renovar sessão:', refreshError);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('[SECURITY] Erro na validação de sessão:', error);
      return false;
    }
  }, [user]);

  // Função para detectar atividade suspeita
  const detectSuspiciousActivity = useCallback(() => {
    const metrics = securityMetrics.current;
    
    // Critérios de atividade suspeita
    const isSuspicious = 
      metrics.loginAttempts > 3 ||
      metrics.suspiciousActivity > 5 ||
      (metrics.blockedUntil && Date.now() < metrics.blockedUntil);

    if (isSuspicious) {
      logger.warn('[SECURITY] Atividade suspeita detectada', {
        metrics,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    }

    return isSuspicious;
  }, [user]);

  return {
    logDataAccess,
    enforceUserDataAccess,
    validateSession,
    detectSuspiciousActivity,
    isAuthenticated: !!user,
    isBlocked: securityMetrics.current.blockedUntil ? 
      Date.now() < securityMetrics.current.blockedUntil : false,
    securityMetrics: securityMetrics.current
  };
};

// Função auxiliar para obter IP (approximado)
async function getUserIP(): Promise<string> {
  try {
    // Em produção, isso seria obtido do servidor
    // Para desenvolvimento, retorna um placeholder
    return 'client-side-ip';
  } catch {
    return 'unknown';
  }
}