
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  action: string;
  resource_type?: string;
  timestamp: string;
  user_id?: string;
  details: Record<string, any>;
}

interface SecurityIncident {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  related_logs: string[];
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeIncidents: number;
  anomaliesDetected: number;
  lastUpdate: Date;
}

export const useOptimizedRealTimeSecurityMonitor = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    activeIncidents: 0,
    anomaliesDetected: 0,
    lastUpdate: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data removido - dados reais apenas

  // Carregar dados com fallback para mock
  const loadInitialData = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Tentar carregar dados reais primeiro
      const { data: eventsData, error: eventsError } = await supabase
        .from('audit_logs')
        .select(`
          id,
          event_type,
          action,
          user_id,
          timestamp,
          details,
          severity
        `)
        .in('event_type', ['security_event', 'system_event'])
        .order('timestamp', { ascending: false })
        .limit(50);

      // Se houver dados reais de audit_logs, usar eles
      if (!eventsError && eventsData) {
        const realEvents = eventsData.map(log => ({
          id: log.id,
          event_type: log.event_type,
          severity: log.severity || 'low',
          action: log.action,
          resource_type: 'system',
          timestamp: log.timestamp,
          user_id: log.user_id,
          details: log.details || {}
        }));

        // Para incidentes, usar dados de eventos agrupados
        const realIncidents = [{
          id: '1',
          title: 'Atividades de sistema recentes',
          description: `${realEvents.length} eventos registrados no sistema`,
          severity: realEvents.some(e => e.severity === 'high') ? 'medium' : 'low',
          status: 'monitoring',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: { 
            source: 'audit_logs',
            event_count: realEvents.length
          },
          related_logs: realEvents.slice(0, 5).map(e => e.id)
        }];

        setEvents(realEvents);
        setIncidents(realIncidents);
        setMetrics({
          totalEvents: realEvents.length,
          criticalEvents: realEvents.filter(e => e.severity === 'critical').length,
          activeIncidents: realIncidents.filter(i => i.status !== 'resolved').length,
          anomaliesDetected: realEvents.filter(e => e.severity === 'high').length,
          lastUpdate: new Date()
        });

        console.log('Dados de segurança carregados do audit_logs:', {
          events: realEvents.length,
          incidents: realIncidents.length
        });
        return;
      }

      // Falha ao carregar dados de segurança
      console.error('Falha ao carregar dados de segurança - verificar configuração');
      setError('Erro ao carregar dados de segurança');

    } catch (err: any) {
      console.error('Erro ao carregar dados de segurança:', err);
      setError(err.message || 'Erro desconhecido ao carregar segurança');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Configurar realtime com fallback
  useEffect(() => {
    if (!isAdmin) return;

    loadInitialData();

    // Tentar configurar realtime para audit_logs
    const channel = supabase
      .channel('security-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
          filter: 'event_type=in.(security_event,system_event)'
        },
        (payload) => {
          const newEvent = {
            id: payload.new.id,
            event_type: payload.new.event_type,
            severity: payload.new.severity || 'low',
            action: payload.new.action,
            resource_type: 'system',
            timestamp: payload.new.timestamp,
            user_id: payload.new.user_id,
            details: payload.new.details || {}
          };

          setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
          setMetrics(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
            criticalEvents: newEvent.severity === 'critical' ? 
              prev.criticalEvents + 1 : prev.criticalEvents,
            lastUpdate: new Date()
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, loadInitialData]);

  const refreshData = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    events,
    incidents,
    metrics,
    isLoading,
    error,
    isAdmin,
    refreshData
  };
};
