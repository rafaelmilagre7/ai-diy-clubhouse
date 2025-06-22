
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

interface HealthMetrics {
  totalUsers: number;
  healthyUsers: number;
  atRiskUsers: number;
  criticalUsers: number;
  averageHealthScore: number;
}

interface UserHealthData {
  id: string;
  email: string;
  name: string;
  overall_score: number;
  engagement_score: number;
  activity_score: number;
  progress_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_calculated_at: string;
  risk_factors: string[];
  recommendations: string[];
}

interface HealthAlert {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  status: 'active' | 'resolved' | 'dismissed';
  triggered_at: string;
  metadata: Record<string, any>;
}

export const useUserHealthDashboard = () => {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    totalUsers: 0,
    healthyUsers: 0,
    atRiskUsers: 0,
    criticalUsers: 0,
    averageHealthScore: 0
  });
  
  const [users, setUsers] = useState<UserHealthData[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { log, logError } = useLogging();

  const fetchHealthMetrics = useCallback(async () => {
    try {
      const { data: healthData, error: healthError } = await supabase
        .from('user_health_metrics')
        .select('overall_score, risk_level');

      if (healthError) {
        throw new Error(`Erro ao buscar métricas: ${healthError.message}`);
      }

      const totalUsers = healthData?.length || 0;
      let healthyUsers = 0;
      let atRiskUsers = 0;
      let criticalUsers = 0;
      let totalScore = 0;

      healthData?.forEach(user => {
        totalScore += user.overall_score;
        switch (user.risk_level) {
          case 'low':
            healthyUsers++;
            break;
          case 'medium':
            break;
          case 'high':
            atRiskUsers++;
            break;
          case 'critical':
            criticalUsers++;
            break;
        }
      });

      const averageHealthScore = totalUsers > 0 ? Math.round(totalScore / totalUsers) : 0;

      setMetrics({
        totalUsers,
        healthyUsers,
        atRiskUsers,
        criticalUsers,
        averageHealthScore
      });

    } catch (error: any) {
      logError('Erro ao buscar métricas de saúde', { error: error.message });
      setError(error.message);
    }
  }, [logError]);

  const fetchUsersHealth = useCallback(async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('user_health_metrics')
        .select(`
          *,
          profiles!user_health_metrics_user_id_fkey (
            email,
            name
          )
        `)
        .order('overall_score', { ascending: true });

      if (usersError) {
        throw new Error(`Erro ao buscar dados dos usuários: ${usersError.message}`);
      }

      const formattedUsers: UserHealthData[] = (usersData || []).map(user => ({
        id: user.user_id,
        email: user.profiles?.email || 'Email não encontrado',
        name: user.profiles?.name || 'Nome não encontrado',
        overall_score: user.overall_score,
        engagement_score: user.engagement_score,
        activity_score: user.activity_score,
        progress_score: user.progress_score,
        risk_level: user.risk_level,
        last_calculated_at: user.last_calculated_at,
        risk_factors: user.risk_factors || [],
        recommendations: user.recommendations || []
      }));

      setUsers(formattedUsers);

    } catch (error: any) {
      logError('Erro ao buscar dados dos usuários', { error: error.message });
      setError(error.message);
    }
  }, [logError]);

  const fetchHealthAlerts = useCallback(async () => {
    try {
      const { data: alertsData, error: alertsError } = await supabase
        .from('user_health_alerts')
        .select(`
          *,
          profiles!user_health_alerts_user_id_fkey (
            email,
            name
          )
        `)
        .eq('status', 'active')
        .order('triggered_at', { ascending: false })
        .limit(20);

      if (alertsError) {
        throw new Error(`Erro ao buscar alertas: ${alertsError.message}`);
      }

      const formattedAlerts: HealthAlert[] = (alertsData || []).map(alert => ({
        id: alert.id,
        user_id: alert.user_id,
        user_name: alert.profiles?.name || 'Nome não encontrado',
        user_email: alert.profiles?.email || 'Email não encontrado',
        alert_type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        status: alert.status,
        triggered_at: alert.triggered_at,
        metadata: alert.metadata || {}
      }));

      setAlerts(formattedAlerts);

    } catch (error: any) {
      logError('Erro ao buscar alertas de saúde', { error: error.message });
      setError(error.message);
    }
  }, [logError]);

  const recalculateHealthScores = useCallback(async () => {
    try {
      setLoading(true);
      log('Iniciando recálculo de scores de saúde...');

      const { error } = await supabase.rpc('detect_at_risk_users');

      if (error) {
        throw new Error(`Erro ao recalcular scores: ${error.message}`);
      }

      // Recarregar dados após recálculo
      await Promise.all([
        fetchHealthMetrics(),
        fetchUsersHealth(),
        fetchHealthAlerts()
      ]);

      log('Scores de saúde recalculados com sucesso');

    } catch (error: any) {
      logError('Erro ao recalcular scores de saúde', { error: error.message });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchHealthMetrics, fetchUsersHealth, fetchHealthAlerts, log, logError]);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('user_health_alerts')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        throw new Error(`Erro ao resolver alerta: ${error.message}`);
      }

      // Atualizar lista de alertas
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      log('Alerta resolvido com sucesso');

    } catch (error: any) {
      logError('Erro ao resolver alerta', { error: error.message });
      setError(error.message);
    }
  }, [log, logError]);

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('user_health_alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId);

      if (error) {
        throw new Error(`Erro ao dispensar alerta: ${error.message}`);
      }

      // Atualizar lista de alertas
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      log('Alerta dispensado com sucesso');

    } catch (error: any) {
      logError('Erro ao dispensar alerta', { error: error.message });
      setError(error.message);
    }
  }, [log, logError]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchHealthMetrics(),
          fetchUsersHealth(),
          fetchHealthAlerts()
        ]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchHealthMetrics, fetchUsersHealth, fetchHealthAlerts]);

  return {
    metrics,
    users,
    alerts,
    loading,
    error,
    recalculateHealthScores,
    resolveAlert,
    dismissAlert,
    refreshData: () => {
      fetchHealthMetrics();
      fetchUsersHealth();
      fetchHealthAlerts();
    }
  };
};
