
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InviteAuditLog {
  id: string;
  invite_id: string;
  action_type: string;
  user_id: string;
  timestamp: string;
  details: any;
}

interface InviteAuditMetrics {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsTimeline: Array<{
    date: string;
    actions: number;
  }>;
  recentActions: InviteAuditLog[];
}

export const useInviteAudit = (timeRange: string = '30d') => {
  const [metrics, setMetrics] = useState<InviteAuditMetrics>({
    totalActions: 0,
    actionsByType: {},
    actionsTimeline: [],
    recentActions: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      
      // Calcular data de início
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Buscar logs de auditoria relacionados a convites
      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .ilike('action', '%invite%')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        // Continuar com dados simulados em caso de erro
      }

      const logs = auditLogs || [];
      
      // Processar métricas
      const totalActions = logs.length;
      
      // Agrupar por tipo de ação
      const actionsByType = logs.reduce((acc: Record<string, number>, log) => {
        const actionType = log.action || 'unknown';
        acc[actionType] = (acc[actionType] || 0) + 1;
        return acc;
      }, {});

      // Criar timeline dos últimos 7 dias
      const actionsTimeline = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayActions = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= dayStart && logDate <= dayEnd;
        }).length;
        
        actionsTimeline.push({
          date: dayStart.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          actions: dayActions
        });
      }

      // Mapear logs recentes
      const recentActions: InviteAuditLog[] = logs.slice(0, 20).map(log => ({
        id: log.id,
        invite_id: log.resource_id || '',
        action_type: log.action || 'unknown',
        user_id: log.user_id || '',
        timestamp: log.timestamp,
        details: log.details || {}
      }));

      setMetrics({
        totalActions,
        actionsByType,
        actionsTimeline,
        recentActions
      });

    } catch (error: any) {
      console.error("Erro ao carregar dados de auditoria:", error);
      toast.error("Erro ao carregar dados de auditoria");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [timeRange]);

  return { metrics, loading, fetchAuditData };
};
