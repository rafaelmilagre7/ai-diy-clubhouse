
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
  related_logs: string[]; // Adicionado para compatibilidade
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeIncidents: number;
  anomaliesDetected: number;
  lastUpdate: Date;
}

export const useRealTimeSecurityMonitor = () => {
  const { isAdmin } = useAuth();
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

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);

      // Carregar eventos recentes (últimas 24h)
      const { data: eventsData, error: eventsError } = await supabase
        .from('security_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(100);

      if (eventsError) throw eventsError;

      // Carregar incidentes ativos
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('security_incidents')
        .select('*')
        .in('status', ['open', 'investigating'])
        .order('created_at', { ascending: false });

      if (incidentsError) throw incidentsError;

      // Carregar métricas
      const { data: metricsData, error: metricsError } = await supabase
        .from('security_metrics')
        .select('*')
        .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      if (metricsError) throw metricsError;

      setEvents(eventsData || []);
      
      // Transformar incidentes para incluir propriedades necessárias
      const transformedIncidents = (incidentsData || []).map(incident => ({
        ...incident,
        related_logs: incident.related_logs || [],
        updated_at: incident.updated_at || incident.created_at
      }));
      
      setIncidents(transformedIncidents);

      // Calcular métricas
      const totalEvents = eventsData?.length || 0;
      const criticalEvents = eventsData?.filter(e => e.severity === 'critical').length || 0;
      const activeIncidents = transformedIncidents.length;
      const anomaliesMetric = metricsData?.find(m => m.metric_name === 'anomalies_detected_24h');
      const anomaliesDetected = anomaliesMetric?.metric_value || 0;

      setMetrics({
        totalEvents,
        criticalEvents,
        activeIncidents,
        anomaliesDetected: Number(anomaliesDetected),
        lastUpdate: new Date()
      });

    } catch (err: any) {
      console.error('Erro ao carregar dados de segurança:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Configurar realtime subscriptions
  useEffect(() => {
    if (!isAdmin) return;

    loadInitialData();

    // Subscription para novos eventos de segurança
    const eventsChannel = supabase
      .channel('security-events-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_logs'
        },
        (payload) => {
          const newEvent = payload.new as SecurityEvent;
          setEvents(prev => [newEvent, ...prev.slice(0, 99)]);
          
          // Atualizar métricas em tempo real
          setMetrics(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1,
            criticalEvents: newEvent.severity === 'critical' 
              ? prev.criticalEvents + 1 
              : prev.criticalEvents,
            lastUpdate: new Date()
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_incidents'
        },
        (payload) => {
          const newIncident = payload.new as any;
          const transformedIncident: SecurityIncident = {
            ...newIncident,
            related_logs: newIncident.related_logs || [],
            updated_at: newIncident.updated_at || newIncident.created_at
          };
          setIncidents(prev => [transformedIncident, ...prev]);
          setMetrics(prev => ({
            ...prev,
            activeIncidents: prev.activeIncidents + 1,
            lastUpdate: new Date()
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'security_incidents'
        },
        (payload) => {
          const updatedIncident = payload.new as any;
          const transformedIncident: SecurityIncident = {
            ...updatedIncident,
            related_logs: updatedIncident.related_logs || [],
            updated_at: updatedIncident.updated_at || updatedIncident.created_at
          };
          
          setIncidents(prev => 
            prev.map(incident => 
              incident.id === transformedIncident.id ? transformedIncident : incident
            )
          );
          
          // Se incidente foi resolvido, decrementar contador
          if (['resolved', 'false_positive'].includes(transformedIncident.status)) {
            setMetrics(prev => ({
              ...prev,
              activeIncidents: Math.max(0, prev.activeIncidents - 1),
              lastUpdate: new Date()
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, [isAdmin, loadInitialData]);

  // Função para disparar análise de anomalias
  const triggerAnomalyDetection = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase.functions.invoke('anomaly-detector');
      if (error) throw error;
      
      // Recarregar dados após análise
      await loadInitialData();
    } catch (err: any) {
      console.error('Erro ao disparar detecção de anomalias:', err);
      setError(err.message);
    }
  }, [isAdmin, loadInitialData]);

  // Função para processar logs em lote
  const processSecurityLogs = useCallback(async (logs: any[]) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase.functions.invoke('security-log-processor', {
        body: { logs }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Erro ao processar logs de segurança:', err);
      setError(err.message);
    }
  }, [isAdmin]);

  return {
    events,
    incidents,
    metrics,
    isLoading,
    error,
    triggerAnomalyDetection,
    processSecurityLogs,
    refreshData: loadInitialData
  };
};
