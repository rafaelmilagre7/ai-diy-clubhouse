
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

export interface UserHealthMetric {
  user_id: string;
  health_score: number;
  engagement_score: number;
  progress_score: number;
  activity_score: number;
  last_calculated_at: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  user_profile?: {
    name: string;
    email: string;
    role: string;
  };
}

export interface HealthAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  created_at: string;
  resolved_at?: string;
  user_profile?: {
    name: string;
    email: string;
  };
}

export interface HealthStats {
  totalUsers: number;
  healthyUsers: number;
  atRiskUsers: number;
  criticalUsers: number;
  averageHealthScore: number;
  totalAlerts: number;
  resolvedAlerts: number;
  activeAlerts: number;
}

export const useUserHealthDashboard = () => {
  const { isAdmin } = useAuth();
  const [healthMetrics, setHealthMetrics] = useState<UserHealthMetric[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    if (!isAdmin) {
      setError('Acesso negado - apenas administradores');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar métricas de saúde dos usuários
      const { data: metricsData, error: metricsError } = await supabase
        .from('user_health_metrics')
        .select(`
          user_id,
          health_score,
          engagement_score,
          progress_score,
          activity_score,
          last_calculated_at,
          profiles:user_id (
            name,
            email,
            role
          )
        `)
        .order('health_score', { ascending: true });

      if (metricsError) {
        throw new Error(`Erro ao buscar métricas: ${metricsError.message}`);
      }

      // Processar métricas
      const processedMetrics: UserHealthMetric[] = (metricsData || []).map(metric => {
        const profileData = Array.isArray(metric.profiles) ? metric.profiles[0] : metric.profiles;
        const healthScore = metric.health_score || 0;
        
        const risk_level: 'low' | 'medium' | 'high' | 'critical' = 
          healthScore < 30 ? 'critical' :
          healthScore < 50 ? 'high' :
          healthScore < 70 ? 'medium' : 'low';

        return {
          user_id: metric.user_id,
          health_score: healthScore,
          engagement_score: metric.engagement_score || 0,
          progress_score: metric.progress_score || 0,
          activity_score: metric.activity_score || 0,
          last_calculated_at: metric.last_calculated_at,
          risk_level,
          user_profile: profileData ? {
            name: profileData.name || 'Usuário sem nome',
            email: profileData.email || 'Email não disponível',
            role: profileData.role || 'member'
          } : undefined
        };
      });

      setHealthMetrics(processedMetrics);

      // Buscar alertas de saúde (criar tabela fictícia baseada em métricas)
      const alertsData: HealthAlert[] = processedMetrics
        .filter(metric => metric.risk_level === 'critical' || metric.risk_level === 'high')
        .map(metric => ({
          id: `alert_${metric.user_id}`,
          user_id: metric.user_id,
          alert_type: metric.risk_level === 'critical' ? 'health_critical' : 'health_warning',
          severity: metric.risk_level,
          message: metric.risk_level === 'critical' 
            ? `Usuário com score crítico de saúde (${metric.health_score})`
            : `Usuário em risco com score baixo de saúde (${metric.health_score})`,
          created_at: metric.last_calculated_at,
          user_profile: metric.user_profile ? {
            name: metric.user_profile.name,
            email: metric.user_profile.email
          } : undefined
        }));

      setHealthAlerts(alertsData);

      // Calcular estatísticas
      if (processedMetrics.length > 0) {
        const totalUsers = processedMetrics.length;
        const healthyUsers = processedMetrics.filter(m => m.health_score >= 70).length;
        const atRiskUsers = processedMetrics.filter(m => m.health_score >= 30 && m.health_score < 70).length;
        const criticalUsers = processedMetrics.filter(m => m.health_score < 30).length;
        
        const averageHealthScore = Math.round(
          processedMetrics.reduce((sum, m) => sum + m.health_score, 0) / totalUsers
        );

        const totalAlerts = alertsData.length;
        const resolvedAlerts = 0; // Simular - todos não resolvidos por enquanto
        const activeAlerts = totalAlerts;

        setHealthStats({
          totalUsers,
          healthyUsers,
          atRiskUsers,
          criticalUsers,
          averageHealthScore,
          totalAlerts,
          resolvedAlerts,
          activeAlerts
        });
      } else {
        // Dados padrão quando não há métricas
        setHealthStats({
          totalUsers: 0,
          healthyUsers: 0,
          atRiskUsers: 0,
          criticalUsers: 0,
          averageHealthScore: 0,
          totalAlerts: 0,
          resolvedAlerts: 0,
          activeAlerts: 0
        });
      }

      logger.info('[USER HEALTH] Dados de saúde carregados com sucesso', {
        metricsCount: processedMetrics.length,
        alertsCount: alertsData.length
      });

    } catch (error: any) {
      logger.error('[USER HEALTH] Erro ao carregar dados de saúde', error, {
        component: 'useUserHealthDashboard'
      });
      setError(error.message || 'Erro ao carregar dados de saúde');
    } finally {
      setLoading(false);
    }
  };

  const initializeHealthData = async () => {
    try {
      setLoading(true);
      
      // Executar inicialização dos dados de health check
      const { data: result, error } = await supabase
        .rpc('calculate_user_health_score');

      if (error) {
        throw new Error(`Erro ao inicializar dados: ${error.message}`);
      }

      logger.info('[USER HEALTH] Dados inicializados', { result });
      
      // Recarregar dados após inicialização
      await fetchHealthData();
      
    } catch (error: any) {
      logger.error('[USER HEALTH] Erro ao inicializar dados', error);
      setError(error.message || 'Erro ao inicializar dados de saúde');
    }
  };

  const recalculateHealthScores = async () => {
    try {
      setLoading(true);
      
      const { data: result, error } = await supabase
        .rpc('calculate_user_health_score');

      if (error) {
        throw new Error(`Erro ao recalcular scores: ${error.message}`);
      }

      logger.info('[USER HEALTH] Scores recalculados', { result });
      
      // Recarregar dados após recálculo
      await fetchHealthData();
      
    } catch (error: any) {
      logger.error('[USER HEALTH] Erro ao recalcular scores', error);
      setError(error.message || 'Erro ao recalcular health scores');
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [isAdmin]);

  return {
    healthMetrics,
    healthAlerts,
    healthStats,
    loading,
    error,
    refetch: fetchHealthData,
    initializeHealthData,
    recalculateHealthScores
  };
};
