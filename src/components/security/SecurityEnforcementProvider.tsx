import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SecurityEvent {
  type: 'unauthorized_action' | 'privilege_escalation' | 'suspicious_activity' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details?: Record<string, any>;
}

interface SecurityEnforcementContextType {
  reportSecurityEvent: (event: SecurityEvent) => void;
  validateRoleChange: (targetUserId: string, newRoleId: string) => Promise<boolean>;
  enforceDataAccess: (dataUserId: string, operation?: string) => void;
  securityMetrics: {
    violationCount: number;
    lastViolation?: Date;
  };
}

const SecurityEnforcementContext = createContext<SecurityEnforcementContextType | undefined>(undefined);

interface SecurityEnforcementProviderProps {
  children: ReactNode;
}

export const SecurityEnforcementProvider: React.FC<SecurityEnforcementProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [securityMetrics, setSecurityMetrics] = useState({
    violationCount: 0,
    lastViolation: undefined as Date | undefined
  });

  // Monitor de tentativas de escalação de privilégios
  useEffect(() => {
    if (!user) return;

    const checkPrivilegeEscalation = async () => {
      try {
        const { data: recentAttempts } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('event_type', 'role_change')
          .eq('severity', 'high')
          .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false });

        if (recentAttempts && recentAttempts.length > 3) {
          reportSecurityEvent({
            type: 'privilege_escalation',
            severity: 'critical',
            description: 'Múltiplas tentativas de escalação de privilégios detectadas',
            details: {
              attempts: recentAttempts.length,
              timeWindow: '24 horas'
            }
          });
        }
      } catch (error) {
        console.error('Erro ao verificar escalação de privilégios:', error);
      }
    };

    const interval = setInterval(checkPrivilegeEscalation, 5 * 60 * 1000); // Verifica a cada 5 minutos
    return () => clearInterval(interval);
  }, [user]);

  const reportSecurityEvent = async (event: SecurityEvent) => {
    try {
      // Log no banco de dados
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          event_type: 'security_event',
          action: event.type,
          details: {
            ...event.details,
            severity: event.severity,
            description: event.description,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          },
          severity: event.severity
        });

      // Atualizar métricas locais
      setSecurityMetrics(prev => ({
        violationCount: prev.violationCount + 1,
        lastViolation: new Date()
      }));

      // Notificação visual para eventos críticos
      if (event.severity === 'critical' || event.severity === 'high') {
        toast.error('Violação de Segurança Detectada', {
          description: event.description,
          duration: 10000
        });
      }

      console.warn(`[SECURITY-EVENT] ${event.severity.toUpperCase()}: ${event.description}`, event.details);
    } catch (error) {
      console.error('Erro ao reportar evento de segurança:', error);
    }
  };

  const validateRoleChange = async (targetUserId: string, newRoleId: string): Promise<boolean> => {
    try {
      const { data: isValid, error } = await supabase.rpc('validate_role_change', {
        target_user_id: targetUserId,
        new_role_id: newRoleId,
        current_user_id: user?.id
      });

      if (error || !isValid) {
        reportSecurityEvent({
          type: 'unauthorized_action',
          severity: 'high',
          description: 'Tentativa de mudança de papel não autorizada',
          details: {
            targetUserId,
            newRoleId,
            error: error?.message
          }
        });
        return false;
      }

      return true;
    } catch (error) {
      reportSecurityEvent({
        type: 'policy_violation',
        severity: 'critical',
        description: 'Erro na validação de mudança de papel',
        details: {
          targetUserId,
          newRoleId,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      });
      return false;
    }
  };

  const enforceDataAccess = (dataUserId: string, operation: string = 'read') => {
    if (!user) {
      reportSecurityEvent({
        type: 'unauthorized_action',
        severity: 'high',
        description: 'Tentativa de acesso a dados sem autenticação',
        details: { operation, dataUserId }
      });
      throw new Error('Acesso negado: usuário não autenticado');
    }

    if (user.id !== dataUserId) {
      reportSecurityEvent({
        type: 'unauthorized_action',
        severity: 'high',
        description: 'Tentativa de acesso a dados de outro usuário',
        details: {
          currentUserId: user.id,
          targetUserId: dataUserId,
          operation
        }
      });
      throw new Error('Acesso negado: dados de outro usuário');
    }
  };

  const contextValue: SecurityEnforcementContextType = {
    reportSecurityEvent,
    validateRoleChange,
    enforceDataAccess,
    securityMetrics
  };

  return (
    <SecurityEnforcementContext.Provider value={contextValue}>
      {children}
    </SecurityEnforcementContext.Provider>
  );
};

export const useSecurityEnforcement = (): SecurityEnforcementContextType => {
  const context = useContext(SecurityEnforcementContext);
  if (context === undefined) {
    throw new Error('useSecurityEnforcement deve ser usado dentro de SecurityEnforcementProvider');
  }
  return context;
};