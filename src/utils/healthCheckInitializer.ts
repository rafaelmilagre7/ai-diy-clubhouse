
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export interface HealthCheckResult {
  success: boolean;
  message: string;
  details: {
    totalUsers: number;
    averageScore: number;
    healthyUsers: number;
    atRiskUsers: number;
    criticalUsers: number;
  };
}

export async function initializeHealthCheckData(): Promise<HealthCheckResult> {
  try {
    logger.info('[HEALTH INIT] Iniciando inicialização do Health Check...');

    // Primeiro, popular dados de atividade se necessário
    const { data: activityResult, error: activityError } = await supabase
      .rpc('populate_user_activity_data');

    if (activityError) {
      logger.warn('[HEALTH INIT] Erro ao popular atividades:', activityError);
    } else {
      logger.info('[HEALTH INIT] Dados de atividade populados:', activityResult);
    }

    // Calcular health scores para todos os usuários
    const { data: healthResult, error: healthError } = await supabase
      .rpc('calculate_user_health_score');

    if (healthError) {
      throw new Error(`Erro ao calcular health scores: ${healthError.message}`);
    }

    logger.info('[HEALTH INIT] Health scores calculados:', healthResult);

    // Buscar estatísticas finais
    const { data: stats, error: statsError } = await supabase
      .from('user_health_metrics')
      .select('health_score');

    if (statsError) {
      throw new Error(`Erro ao buscar estatísticas: ${statsError.message}`);
    }

    const totalUsers = stats?.length || 0;
    const averageScore = totalUsers > 0 
      ? Math.round(stats.reduce((sum, user) => sum + (user.health_score || 0), 0) / totalUsers)
      : 0;

    const healthyUsers = stats?.filter(u => (u.health_score || 0) >= 70).length || 0;
    const atRiskUsers = stats?.filter(u => {
      const score = u.health_score || 0;
      return score >= 30 && score < 70;
    }).length || 0;
    const criticalUsers = stats?.filter(u => (u.health_score || 0) < 30).length || 0;

    const result: HealthCheckResult = {
      success: true,
      message: `Health Check inicializado com sucesso! Processados ${totalUsers} usuários.`,
      details: {
        totalUsers,
        averageScore,
        healthyUsers,
        atRiskUsers,
        criticalUsers
      }
    };

    logger.info('[HEALTH INIT] Inicialização concluída:', result);
    return result;

  } catch (error: any) {
    logger.error('[HEALTH INIT] Erro na inicialização:', error);
    
    return {
      success: false,
      message: `Erro na inicialização: ${error.message}`,
      details: {
        totalUsers: 0,
        averageScore: 0,
        healthyUsers: 0,
        atRiskUsers: 0,
        criticalUsers: 0
      }
    };
  }
}

// Função para simular dados de demonstração
export function generateSimulatedHealthData() {
  const simulatedUsers = 44; // Baseado no número real de usuários
  const healthyUsers = Math.floor(simulatedUsers * 0.6); // 60% saudáveis
  const atRiskUsers = Math.floor(simulatedUsers * 0.3); // 30% em risco
  const criticalUsers = simulatedUsers - healthyUsers - atRiskUsers; // Resto críticos

  return {
    success: true,
    message: 'Dados simulados carregados para demonstração',
    details: {
      totalUsers: simulatedUsers,
      averageScore: 65,
      healthyUsers,
      atRiskUsers,
      criticalUsers
    }
  };
}
