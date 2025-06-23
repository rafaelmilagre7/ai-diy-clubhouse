
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export interface HealthCheckInitResult {
  success: boolean;
  message: string;
  details: {
    activityDataPopulated: boolean;
    healthScoresCalculated: boolean;
    atRiskUsersDetected: boolean;
    totalUsers: number;
    errors: string[];
  };
}

export const initializeHealthCheckData = async (): Promise<HealthCheckInitResult> => {
  const errors: string[] = [];
  let activityDataPopulated = false;
  let healthScoresCalculated = false;
  let atRiskUsersDetected = false;
  let totalUsers = 0;

  try {
    logger.info('[HEALTH CHECK] Iniciando inicialização dos dados de health check');

    // 1. Popular dados de atividade dos usuários
    const { data: activityResult, error: activityError } = await supabase
      .rpc('populate_user_activity_data');

    if (activityError) {
      errors.push(`Erro ao popular dados de atividade: ${activityError.message}`);
      logger.error('[HEALTH CHECK] Erro ao popular atividades:', activityError);
    } else {
      activityDataPopulated = true;
      logger.info('[HEALTH CHECK] Dados de atividade populados:', activityResult);
    }

    // 2. Calcular health scores usando user_health_metrics
    const { data: scoresResult, error: scoresError } = await supabase
      .rpc('calculate_user_health_score');

    if (scoresError) {
      errors.push(`Erro ao calcular health scores: ${scoresError.message}`);
      logger.error('[HEALTH CHECK] Erro ao calcular scores:', scoresError);
    } else {
      healthScoresCalculated = true;
      totalUsers = scoresResult?.processed_users || 0;
      logger.info('[HEALTH CHECK] Health scores calculados:', scoresResult);
    }

    // 3. Detectar usuários em risco
    const { data: riskResult, error: riskError } = await supabase
      .rpc('detect_at_risk_users');

    if (riskError) {
      errors.push(`Erro ao detectar usuários em risco: ${riskError.message}`);
      logger.error('[HEALTH CHECK] Erro ao detectar riscos:', riskError);
    } else {
      atRiskUsersDetected = true;
      logger.info('[HEALTH CHECK] Usuários em risco detectados:', riskResult);
    }

    const success = activityDataPopulated && healthScoresCalculated && atRiskUsersDetected;

    return {
      success,
      message: success 
        ? 'Health Check inicializado com sucesso'
        : 'Health Check inicializado com alguns erros',
      details: {
        activityDataPopulated,
        healthScoresCalculated,
        atRiskUsersDetected,
        totalUsers,
        errors
      }
    };

  } catch (error: any) {
    logger.error('[HEALTH CHECK] Erro inesperado na inicialização:', error);
    errors.push(`Erro inesperado: ${error.message}`);

    return {
      success: false,
      message: 'Falha na inicialização do Health Check',
      details: {
        activityDataPopulated,
        healthScoresCalculated,
        atRiskUsersDetected,
        totalUsers,
        errors
      }
    };
  }
};
