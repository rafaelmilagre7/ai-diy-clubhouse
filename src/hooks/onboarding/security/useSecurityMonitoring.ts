
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface SecurityEvent {
  type: 'rate_limit' | 'integrity_issue' | 'duplicate_attempt' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  timestamp: string;
}

export const useSecurityMonitoring = () => {
  const { user, isAdmin } = useAuth();

  const handleSecurityEvent = useCallback((event: SecurityEvent) => {
    console.log('🚨 Evento de segurança detectado:', event);

    // Para admins, mostrar todos os eventos
    if (isAdmin) {
      const colors = {
        low: 'blue',
        medium: 'yellow', 
        high: 'orange',
        critical: 'red'
      };

      // Mostrar notificação apenas para eventos de alta gravidade
      if (event.severity === 'high' || event.severity === 'critical') {
        toast.error(`🚨 Evento de Segurança: ${event.type}`, {
          description: event.message,
          duration: 5000
        });
      }
    }

    // Para usuários normais, mostrar apenas eventos relacionados a eles
    if (user?.id === event.userId && event.severity !== 'low') {
      if (event.type === 'rate_limit') {
        toast.warning('Muitas tentativas detectadas', {
          description: 'Aguarde alguns minutos antes de tentar novamente.'
        });
      } else if (event.type === 'integrity_issue') {
        toast.info('Verificação de segurança em andamento', {
          description: 'Validando seus dados...'
        });
      }
    }
  }, [user?.id, isAdmin]);

  const startMonitoring = useCallback(() => {
    if (!user?.id) return;

    // Monitorar logs de auditoria em tempo real
    const auditChannel = supabase
      .channel('audit_logs_monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'onboarding_audit_logs',
          filter: user?.id ? `user_id=eq.${user.id}` : undefined
        },
        (payload) => {
          const log = payload.new as any;
          
          // Detectar eventos de segurança
          if (log.action_type.includes('blocked') || log.action_type.includes('error')) {
            handleSecurityEvent({
              type: log.action_type.includes('rate') ? 'rate_limit' : 'suspicious_activity',
              severity: 'high',
              message: log.error_details || 'Atividade suspeita detectada',
              userId: log.user_id,
              timestamp: log.created_at
            });
          }
        }
      )
      .subscribe();

    // Monitorar verificações de integridade
    const integrityChannel = supabase
      .channel('integrity_monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'onboarding_integrity_checks'
        },
        (payload) => {
          const check = payload.new as any;
          
          if (check.status === 'issues_found' && check.issues_found?.length > 0) {
            const criticalIssues = check.issues_found.filter((issue: any) => 
              issue.severity === 'critical'
            );
            
            if (criticalIssues.length > 0) {
              handleSecurityEvent({
                type: 'integrity_issue',
                severity: 'critical',
                message: `${criticalIssues.length} problema(s) crítico(s) detectado(s)`,
                userId: check.user_id,
                timestamp: check.created_at
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      auditChannel.unsubscribe();
      integrityChannel.unsubscribe();
    };
  }, [user?.id, handleSecurityEvent]);

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    handleSecurityEvent
  };
};
