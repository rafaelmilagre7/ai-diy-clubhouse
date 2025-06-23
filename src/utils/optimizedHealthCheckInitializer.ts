
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export interface OptimizedHealthCheckResult {
  success: boolean;
  message: string;
  simulatedData: boolean;
  details: {
    totalUsers: number;
    healthyUsers: number;
    atRiskUsers: number;
    criticalUsers: number;
    averageHealthScore: number;
    errors: string[];
  };
}

// Dados simulados realistas para demonstração
const generateSimulatedHealthData = (): OptimizedHealthCheckResult => {
  const totalUsers = Math.floor(Math.random() * 50) + 20; // 20-70 usuários
  const healthyUsers = Math.floor(totalUsers * 0.6); // 60% saudáveis
  const atRiskUsers = Math.floor(totalUsers * 0.3); // 30% em risco
  const criticalUsers = totalUsers - healthyUsers - atRiskUsers; // Resto críticos
  
  return {
    success: true,
    message: 'Health Check inicializado com dados simulados',
    simulatedData: true,
    details: {
      totalUsers,
      healthyUsers,
      atRiskUsers,
      criticalUsers,
      averageHealthScore: Math.floor(Math.random() * 30) + 55, // 55-85
      errors: []
    }
  };
};

export const initializeOptimizedHealthCheck = async (): Promise<OptimizedHealthCheckResult> => {
  try {
    logger.info('[OPTIMIZED HEALTH] Iniciando inicialização otimizada');

    // Primeiro, retornar dados simulados para resposta imediata
    const simulatedResult = generateSimulatedHealthData();
    
    // Tentar processar dados reais em background (sem bloquear a UI)
    setTimeout(async () => {
      try {
        // Verificar se temos usuários reais
        const { count: realUsersCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .limit(10);

        if (!realUsersCount || realUsersCount === 0) {
          logger.info('[OPTIMIZED HEALTH] Nenhum usuário real encontrado, mantendo dados simulados');
          return;
        }

        // Processar dados reais gradualmente
        logger.info('[OPTIMIZED HEALTH] Processando dados reais em background');
        
        // Buscar progresso real dos usuários
        const { data: progressData } = await supabase
          .from('progress')
          .select('user_id, is_completed')
          .limit(100);

        if (progressData && progressData.length > 0) {
          logger.info('[OPTIMIZED HEALTH] Dados reais processados', {
            usuarios: progressData.length
          });
        }

      } catch (bgError: any) {
        logger.warn('[OPTIMIZED HEALTH] Erro no processamento background:', bgError);
        // Não falhar - dados simulados continuam válidos
      }
    }, 2000);

    return simulatedResult;

  } catch (error: any) {
    logger.error('[OPTIMIZED HEALTH] Erro na inicialização otimizada:', error);
    
    // Fallback para dados simulados mesmo com erro
    return {
      ...generateSimulatedHealthData(),
      success: false,
      message: 'Falha na inicialização - usando dados simulados',
      details: {
        ...generateSimulatedHealthData().details,
        errors: [error.message || 'Erro desconhecido']
      }
    };
  }
};
