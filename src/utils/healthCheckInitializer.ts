
import { supabase } from '@/lib/supabase';

export const initializeHealthCheckData = async () => {
  try {
    console.log('🚀 Inicializando dados do Health Check...');
    
    // 1. Popular dados básicos de atividade dos usuários
    const { data: populateResult, error: populateError } = await supabase.rpc('populate_user_activity_data');
    
    if (populateError) {
      console.error('❌ Erro ao popular dados de atividade:', populateError);
      return { success: false, error: populateError.message };
    }
    
    console.log('✅ Resultado da população de dados:', populateResult);
    
    // 2. Detectar usuários em risco
    try {
      const { data: atRiskUsers, error: detectError } = await supabase.rpc('detect_at_risk_users');
      
      if (detectError) {
        console.warn('⚠️ Aviso ao detectar usuários em risco:', detectError.message);
      } else {
        console.log(`📊 Encontrados ${atRiskUsers?.length || 0} usuários em risco`);
      }
    } catch (error) {
      console.warn('⚠️ Função detect_at_risk_users não disponível:', error);
    }
    
    console.log('🎉 Health Check inicializado com sucesso!');
    return { success: true, data: populateResult };
    
  } catch (error: any) {
    console.error('💥 Erro na inicialização do Health Check:', error);
    return { success: false, error: error.message };
  }
};

export const recalculateUserHealthScore = async (userId: string) => {
  try {
    console.log(`🔄 Recalculando score para usuário: ${userId.substring(0, 8)}...`);
    
    const { data: score, error } = await supabase.rpc('calculate_user_health_score', {
      p_user_id: userId
    });
    
    if (error) {
      console.warn('⚠️ Erro ao calcular score:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log(`✅ Score calculado: ${score}`);
    return { success: true, score };
    
  } catch (error: any) {
    console.error('💥 Erro ao recalcular score do usuário:', error);
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
    console.log(`📝 Rastreando atividade para usuário: ${userId.substring(0, 8)}...`);
    
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
      // Atualizar registro existente
      const { error: updateError } = await supabase
        .from('user_activity_tracking')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(updateError.message);
      }
      
      console.log('✅ Atividade atualizada com sucesso');
    } else {
      // Criar novo registro
      const { error: insertError } = await supabase
        .from('user_activity_tracking')
        .insert({
          user_id: userId
        });

      if (insertError) {
        throw new Error(insertError.message);
      }
      
      console.log('✅ Nova atividade criada com sucesso');
    }
    
    // Recalcular score após atualizar atividade
    await recalculateUserHealthScore(userId);
    
    return { success: true };
  } catch (error: any) {
    console.error('💥 Erro ao rastrear atividade do usuário:', error);
    return { success: false, error: error.message };
  }
};

// Função para obter estatísticas do Health Check
export const getHealthCheckStats = async () => {
  try {
    console.log('📊 Obtendo estatísticas do Health Check...');
    
    // Buscar estatísticas de scores
    const { data: healthScores, error: scoresError } = await supabase
      .from('user_health_scores')
      .select('health_score, risk_level, factors');
    
    if (scoresError) {
      throw new Error(scoresError.message);
    }
    
    // Calcular métricas
    const totalUsers = healthScores?.length || 0;
    const averageScore = totalUsers > 0 
      ? Math.round(healthScores.reduce((sum, user) => sum + user.health_score, 0) / totalUsers)
      : 0;
    
    const riskDistribution = {
      low: healthScores?.filter(u => u.risk_level === 'low').length || 0,
      medium: healthScores?.filter(u => u.risk_level === 'medium').length || 0,
      high: healthScores?.filter(u => u.risk_level === 'high').length || 0
    };
    
    const stats = {
      totalUsers,
      averageScore,
      riskDistribution,
      healthyUsers: riskDistribution.low,
      atRiskUsers: riskDistribution.medium + riskDistribution.high
    };
    
    console.log('✅ Estatísticas obtidas:', stats);
    return { success: true, stats };
    
  } catch (error: any) {
    console.error('💥 Erro ao obter estatísticas:', error);
    return { success: false, error: error.message };
  }
};

// Função auxiliar para verificar a saúde geral do sistema
export const performSystemHealthCheck = async () => {
  try {
    console.log('🔍 Executando verificação de saúde do sistema...');
    
    // 1. Verificar conexão básica
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      return { success: false, error: 'Erro de conexão com o banco', details: profilesError };
    }

    // 2. Verificar se as tabelas de health check existem
    const healthTables = ['user_activity_tracking', 'user_health_scores'];
    const tableStatus: Record<string, string> = {};

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
    
    // 4. Obter estatísticas
    const statsResult = await getHealthCheckStats();

    console.log('✅ Verificação de saúde concluída');
    
    return {
      success: true,
      status: 'healthy',
      tableStatus,
      initializationResult: initResult,
      statistics: statsResult.success ? statsResult.stats : null,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('💥 Erro na verificação de saúde do sistema:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Função para popular dados de teste (útil para desenvolvimento)
export const populateTestData = async () => {
  try {
    console.log('🧪 Populando dados de teste...');
    
    // Buscar usuários existentes
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(10);
    
    if (usersError) {
      throw new Error(usersError.message);
    }
    
    if (!users || users.length === 0) {
      return { success: false, error: 'Nenhum usuário encontrado' };
    }
    
    // Simular atividade para alguns usuários
    let activitiesCreated = 0;
    for (const user of users.slice(0, 5)) {
      const result = await trackUserActivity(user.id, {
        lastLoginAt: new Date().toISOString(),
        sessionDuration: Math.floor(Math.random() * 3600) // Random session duration
      });
      
      if (result.success) {
        activitiesCreated++;
      }
    }
    
    console.log(`✅ Dados de teste criados: ${activitiesCreated} atividades`);
    return { success: true, activitiesCreated };
    
  } catch (error: any) {
    console.error('💥 Erro ao popular dados de teste:', error);
    return { success: false, error: error.message };
  }
};
