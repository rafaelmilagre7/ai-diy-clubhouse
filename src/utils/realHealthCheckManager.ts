
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export interface RealHealthCheckResult {
  success: boolean;
  message: string;
  data: {
    totalUsers: number;
    averageScore: number;
    healthyUsers: number;
    atRiskUsers: number;
    criticalUsers: number;
  } | null;
  error?: string;
}

export async function calculateRealHealthMetrics(): Promise<RealHealthCheckResult> {
  try {
    logger.info('[REAL HEALTH] Calculando métricas reais dos usuários...');

    const { data: healthMetrics, error } = await supabase.rpc('calculate_user_health_score');

    if (error) {
      logger.error('[REAL HEALTH] Erro ao calcular métricas:', error);
      return {
        success: false,
        message: `Erro ao calcular métricas: ${error.message}`,
        data: null,
        error: error.message
      };
    }

    if (!healthMetrics || healthMetrics.length === 0) {
      logger.info('[REAL HEALTH] Nenhum usuário encontrado no sistema');
      return {
        success: true,
        message: 'Nenhum usuário encontrado no sistema',
        data: {
          totalUsers: 0,
          averageScore: 0,
          healthyUsers: 0,
          atRiskUsers: 0,
          criticalUsers: 0
        }
      };
    }

    const totalUsers = healthMetrics.length;
    const scores = healthMetrics.map((m: any) => m.health_score);
    const averageScore = Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / totalUsers);

    const healthyUsers = healthMetrics.filter((m: any) => m.health_score >= 70).length;
    const atRiskUsers = healthMetrics.filter((m: any) => m.health_score >= 40 && m.health_score < 70).length;
    const criticalUsers = healthMetrics.filter((m: any) => m.health_score < 40).length;

    logger.info('[REAL HEALTH] Métricas calculadas com sucesso:', {
      totalUsers,
      averageScore,
      healthyUsers,
      atRiskUsers,
      criticalUsers
    });

    return {
      success: true,
      message: `Métricas calculadas para ${totalUsers} usuários`,
      data: {
        totalUsers,
        averageScore,
        healthyUsers,
        atRiskUsers,
        criticalUsers
      }
    };

  } catch (error: any) {
    logger.error('[REAL HEALTH] Erro inesperado:', error);
    return {
      success: false,
      message: `Erro inesperado: ${error.message}`,
      data: null,
      error: error.message
    };
  }
}
