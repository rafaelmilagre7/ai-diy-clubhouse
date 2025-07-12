/**
 * SISTEMA DE MONITORAMENTO DE SEGURANÇA EM TEMPO REAL
 * ====================================================
 * 
 * Este hook monitora continuamente as métricas de segurança e detecta
 * atividades suspeitas em tempo real.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface SecurityMetrics {
  totalViolations: number;
  recentViolations: number;
  failedLogins: number;
  suspiciousIPs: string[];
  blockedUsers: number;
  lastSecurityScan: Date | null;
}

interface SecurityAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
  action?: string;
}

export function useSecurityMonitoring() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalViolations: 0,
    recentViolations: 0,
    failedLogins: 0,
    suspiciousIPs: [],
    blockedUsers: 0,
    lastSecurityScan: null
  });
  
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Buscar métricas de segurança do banco
  const fetchSecurityMetrics = useCallback(async () => {
    if (!user) return;

    try {
      // Buscar violações de segurança recentes (últimas 24h)
      const { data: recentViolations, error: violationsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('event_type', 'security_violation')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (violationsError) {
        console.error('Erro ao buscar violações:', violationsError);
        return;
      }

      // Buscar total de violações
      const { count: totalCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'security_violation');

      // Buscar falhas de login recentes
      const { data: failedLogins, error: loginError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('event_type', 'auth_failure')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (loginError) {
        console.error('Erro ao buscar falhas de login:', loginError);
      }

      // Extrair IPs suspeitos
      const suspiciousIPs = new Set<string>();
      recentViolations?.forEach(violation => {
        if (violation.ip_address) {
          suspiciousIPs.add(violation.ip_address);
        }
      });

      setMetrics({
        totalViolations: totalCount || 0,
        recentViolations: recentViolations?.length || 0,
        failedLogins: failedLogins?.length || 0,
        suspiciousIPs: Array.from(suspiciousIPs),
        blockedUsers: 0, // TODO: Implementar sistema de bloqueio
        lastSecurityScan: new Date()
      });

      // Gerar alertas baseados nas métricas
      generateSecurityAlerts(recentViolations || [], failedLogins || []);

    } catch (error) {
      console.error('Erro ao buscar métricas de segurança:', error);
    }
  }, [user]);

  // Gerar alertas de segurança
  const generateSecurityAlerts = (violations: any[], failedLogins: any[]) => {
    const newAlerts: SecurityAlert[] = [];

    // Alerta para múltiplas violações
    if (violations.length >= 5) {
      newAlerts.push({
        id: `violations-${Date.now()}`,
        type: 'critical',
        message: `${violations.length} violações de segurança detectadas nas últimas 24h`,
        timestamp: new Date(),
        action: 'Revisar logs de auditoria'
      });
    }

    // Alerta para múltiplas falhas de login
    if (failedLogins.length >= 10) {
      newAlerts.push({
        id: `failed-logins-${Date.now()}`,
        type: 'high',
        message: `${failedLogins.length} tentativas de login falharam nas últimas 24h`,
        timestamp: new Date(),
        action: 'Verificar ataques de força bruta'
      });
    }

    // Alerta para IPs suspeitos
    const uniqueIPs = new Set(violations.map(v => v.ip_address).filter(Boolean));
    if (uniqueIPs.size >= 3) {
      newAlerts.push({
        id: `suspicious-ips-${Date.now()}`,
        type: 'medium',
        message: `${uniqueIPs.size} IPs diferentes envolvidos em violações`,
        timestamp: new Date(),
        action: 'Considerar bloqueio de IPs'
      });
    }

    setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)); // Manter apenas 10 alertas mais recentes
  };

  // Configurar monitoramento em tempo real
  useEffect(() => {
    if (!user || !user.id) return;

    // Verificar se o usuário é admin
    const checkAdminAccess = async () => {
      const { data, error } = await supabase.rpc('is_user_admin', { user_id: user.id });
      
      if (error || !data) {
        console.log('Usuário não é admin, monitoramento desabilitado');
        return;
      }

      setIsMonitoring(true);
      
      // Buscar métricas iniciais
      fetchSecurityMetrics();

      // Configurar atualização periódica (a cada 5 minutos)
      const interval = setInterval(fetchSecurityMetrics, 5 * 60 * 1000);

      // Configurar listener em tempo real para novos logs de auditoria
      const channel = supabase
        .channel('security-monitoring')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'audit_logs',
            filter: 'event_type=in.(security_violation,auth_failure,role_change)'
          },
          (payload) => {
            console.log('📊 Nova atividade de segurança detectada:', payload);
            
            // Atualizar métricas imediatamente
            setTimeout(fetchSecurityMetrics, 1000);
            
            // Gerar alerta imediato para violações críticas
            if (payload.new.event_type === 'security_violation') {
              setAlerts(prev => [{
                id: `realtime-${Date.now()}`,
                type: 'high' as const,
                message: `Nova violação de segurança: ${payload.new.action}`,
                timestamp: new Date(),
                action: 'Investigar imediatamente'
              }, ...prev].slice(0, 10));
            }
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    };

    checkAdminAccess();
  }, [user, fetchSecurityMetrics]);

  // Função para marcar alerta como lido
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Função para executar varredura manual de segurança
  const runSecurityScan = useCallback(async () => {
    if (!user) return;

    console.log('🔍 Iniciando varredura de segurança...');
    
    // Log da varredura
    await supabase.rpc('log_security_access', {
      p_table_name: 'security_scan',
      p_operation: 'manual_scan',
      p_resource_id: 'system'
    });

    // Atualizar métricas
    await fetchSecurityMetrics();
    
    console.log('✅ Varredura de segurança concluída');
  }, [user, fetchSecurityMetrics]);

  // Função para bloquear IP suspeito
  const blockSuspiciousIP = useCallback(async (ip: string) => {
    if (!user) return;

    try {
      // Log da ação de bloqueio
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        event_type: 'security_action',
        action: 'block_ip',
        resource_id: ip,
        details: {
          ip_address: ip,
          blocked_by: user.id,
          timestamp: new Date().toISOString(),
          reason: 'suspicious_activity'
        },
        severity: 'high'
      });

      // TODO: Implementar bloqueio real do IP
      console.log(`🚫 IP ${ip} marcado para bloqueio`);
      
      // Atualizar métricas
      await fetchSecurityMetrics();
      
    } catch (error) {
      console.error('Erro ao bloquear IP:', error);
    }
  }, [user, fetchSecurityMetrics]);

  return {
    metrics,
    alerts,
    isMonitoring,
    dismissAlert,
    runSecurityScan,
    blockSuspiciousIP,
    fetchSecurityMetrics
  };
}