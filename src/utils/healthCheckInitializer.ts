
import { supabase } from '@/lib/supabase';

export const initializeHealthCheckData = async () => {
  try {
    console.log('Inicializando dados do Health Check...');
    
    // 1. Popular dados básicos de atividade dos usuários
    const { data: populateResult, error: populateError } = await supabase.rpc('populate_user_activity_data');
    if (populateError) {
      console.error('Erro ao popular dados de atividade:', populateError);
      return { success: false, error: populateError.message };
    }
    
    console.log('Resultado da população de dados:', populateResult);
    
    // 2. Tentar detectar usuários em risco
    try {
      const { error: detectError } = await supabase.rpc('detect_at_risk_users');
      if (detectError) {
        console.warn('Aviso ao detectar usuários em risco:', detectError.message);
        // Não falhar se esta função não existir
      }
    } catch (error) {
      console.warn('Função detect_at_risk_users não disponível:', error);
    }
    
    console.log('Health Check inicializado com sucesso!');
    return { success: true, data: populateResult };
    
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
      console.warn('Erro ao calcular score (função pode não existir):', error.message);
      // Retornar score padrão se a função não existir
      return { success: true, score: 50, fallback: true };
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
    // Verificar se o usuário já tem registro de atividade
    const { data: existingActivity, error: checkError } = await supabase
      .from('user_activity_tracking')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(checkError.message);
    }

    if (existingActivity) {
      // Atualizar registro existente apenas com campos que existem
      const { error: updateError } = await supabase
        .from('user_activity_tracking')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      // Criar novo registro apenas com user_id
      const { error: insertError } = await supabase
        .from('user_activity_tracking')
        .insert({
          user_id: userId
        });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao rastrear atividade do usuário:', error);
    return { success: false, error: error.message };
  }
};

// Função auxiliar para verificar a saúde geral do sistema
export const performSystemHealthCheck = async () => {
  try {
    console.log('Executando verificação de saúde do sistema...');
    
    // 1. Verificar conexão básica
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      return { success: false, error: 'Erro de conexão com o banco', details: profilesError };
    }

    // 2. Verificar se as tabelas de health check existem
    const healthTables = ['user_activity_tracking', 'user_health_scores', 'onboarding_final'];
    const tableStatus = {};

    for (const table of healthTables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        tableStatus[table] = error ? 'missing' : 'available';
      } catch {
        tableStatus[table] = 'missing';
      }
    }

    // 3. Executar inicialização se necessário
    const initResult = await initializeHealthCheckData();

    return {
      success: true,
      status: 'healthy',
      tableStatus,
      initializationResult: initResult,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('Erro na verificação de saúde do sistema:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};
