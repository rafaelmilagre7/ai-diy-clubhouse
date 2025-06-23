
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

export interface UserHealthMetrics {
  user_id: string;
  health_score: number;
  engagement_score: number;
  progress_score: number;
  activity_score: number;
  last_calculated_at: string;
  user_profile?: {
    name: string;
    email: string;
    role: string;
  };
}

export interface HealthCheckStats {
  totalUsers: number;
  healthyUsers: number;
  atRiskUsers: number;
  criticalUsers: number;
  averageHealthScore: number;
  averageEngagementScore: number;
  lastUpdated: string;
}

export const useHealthCheckData = () => {
  const { isAdmin } = useAuth();
  const [healthMetrics, setHealthMetrics] = useState<UserHealthMetrics[]>([]);
  const [stats, setStats] = useState<HealthCheckStats | null>(null);
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

      // Buscar métricas de saúde dos usuários usando user_health_metrics
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

      const formattedMetrics: UserHealthMetrics[] = (metricsData || []).map(metric => ({
        user_id: metric.user_id,
        health_score: metric.health_score || 0,
        engagement_score: metric.engagement_score || 0,
        progress_score: metric.progress_score || 0,
        activity_score: metric.activity_score || 0,
        last_calculated_at: metric.last_calculated_at,
        user_profile: metric.profiles ? {
          name: metric.profiles.name || 'Usuário sem nome',
          email: metric.profiles.email || 'Email não disponível',
          role: metric.profiles.role || 'member'
        } : undefined
      }));

      setHealthMetrics(formattedMetrics);

      // Calcular estatísticas
      if (formattedMetrics.length > 0) {
        const totalUsers = formattedMetrics.length;
        const healthyUsers = formattedMetrics.filter(m => m.health_score >= 70).length;
        const atRiskUsers = formattedMetrics.filter(m => m.health_score >= 30 && m.health_score < 70).length;
        const criticalUsers = formattedMetrics.filter(m => m.health_score < 30).length;
        
        const averageHealthScore = Math.round(
          formattedMetrics.reduce((sum, m) => sum + m.health_score, 0) / totalUsers
        );
        
        const averageEngagementScore = Math.round(
          formattedMetrics.reduce((sum, m) => sum + m.engagement_score, 0) / totalUsers
        );

        const lastUpdated = formattedMetrics
          .sort((a, b) => new Date(b.last_calculated_at).getTime() - new Date(a.last_calculated_at).getTime())[0]
          ?.last_calculated_at || new Date().toISOString();

        setStats({
          totalUsers,
          healthyUsers,
          atRiskUsers,
          criticalUsers,
          averageHealthScore,
          averageEngagementScore,
          lastUpdated
        });
      }

      logger.info('[HEALTH CHECK] Dados carregados:', {
        metricsCount: formattedMetrics.length,
        hasStats: !!stats
      });

    } catch (error: any) {
      logger.error('[HEALTH CHECK] Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao carregar dados de saúde');
    } finally {
      setLoading(false);
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

      logger.info('[HEALTH CHECK] Scores recalculados:', result);
      
      // Recarregar dados após recálculo
      await fetchHealthData();
      
    } catch (error: any) {
      logger.error('[HEALTH CHECK] Erro ao recalcular:', error);
      setError(error.message || 'Erro ao recalcular health scores');
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [isAdmin]);

  return {
    healthMetrics,
    stats,
    loading,
    error,
    refetch: fetchHealthData,
    recalculateHealthScores
  };
};
