
import { supabase } from '@/lib/supabase';

export const initializeHealthCheckData = async () => {
  try {
    console.log('Inicializando dados do Health Check...');
    
    // 1. Popular dados de atividade dos usuários
    const { error: populateError } = await supabase.rpc('populate_user_activity_data');
    if (populateError) {
      console.error('Erro ao popular dados de atividade:', populateError);
      return { success: false, error: populateError.message };
    }
    
    // 2. Detectar usuários em risco (isso também calcula os scores)
    const { error: detectError } = await supabase.rpc('detect_at_risk_users');
    if (detectError) {
      console.error('Erro ao detectar usuários em risco:', detectError);
      return { success: false, error: detectError.message };
    }
    
    console.log('Health Check inicializado com sucesso!');
    return { success: true };
    
  } catch (error: any) {
    console.error('Erro na inicialização do Health Check:', error);
    return { success: false, error: error.message };
  }
};

export const recalculateUserHealthScore = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('calculate_user_health_score', {
      p_user_id: userId
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true, score: data };
  } catch (error: any) {
    console.error('Erro ao recalcular score do usuário:', error);
    return { success: false, error: error.message };
  }
};

export const trackUserActivity = async (userId: string, activityData: {
  lastLoginAt?: string;
  pagesVisited?: Record<string, number>;
  actionsPerformed?: Record<string, number>;
  sessionDuration?: number;
}) => {
  try {
    const { error } = await supabase
      .from('user_activity_tracking')
      .upsert({
        user_id: userId,
        last_login_at: activityData.lastLoginAt || new Date().toISOString(),
        pages_visited: activityData.pagesVisited || {},
        actions_performed: activityData.actionsPerformed || {},
        total_sessions: 1, // Incrementar via trigger seria ideal
        total_time_minutes: activityData.sessionDuration || 0,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao rastrear atividade do usuário:', error);
    return { success: false, error: error.message };
  }
};
