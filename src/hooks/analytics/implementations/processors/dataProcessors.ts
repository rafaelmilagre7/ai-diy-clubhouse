
import { 
  extractSolutionDifficulty, 
  extractSolutionTitle, 
  extractUserName 
} from '../utils/dataExtractors';
import type { ImplementationData } from '../types/implementationTypes';

/**
 * Processa dados de taxa de conclusão de implementações
 */
export const processCompletionRate = (completionData: any[]) => {
  const completedCount = completionData?.filter(item => item.is_completed)?.length || 0;
  const inProgressCount = completionData?.filter(item => !item.is_completed)?.length || 0;
  
  return {
    completed: completedCount,
    inProgress: inProgressCount
  };
};

/**
 * Processa dados de implementações por dificuldade
 */
export const processDifficultyDistribution = (difficultyData: any[]) => {
  const difficultyMap: Record<string, number> = {};
  
  difficultyData?.forEach(item => {
    const difficulty = extractSolutionDifficulty(item);
    if (!difficultyMap[difficulty]) {
      difficultyMap[difficulty] = 0;
    }
    difficultyMap[difficulty]++;
  });
  
  return Object.entries(difficultyMap).map(([difficulty, count]) => ({
    difficulty,
    count
  }));
};

/**
 * Processa tempo médio de conclusão das implementações
 */
export const processCompletionTime = (timeData: any[]) => {
  const solutionCompletionTimes: Record<string, { totalDays: number; count: number; title: string }> = {};
  
  timeData?.forEach(item => {
    if (item.completed_at && item.created_at) {
      const startDate = new Date(item.created_at);
      const endDate = new Date(item.completed_at);
      const daysToComplete = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (!solutionCompletionTimes[item.solution_id]) {
        const title = extractSolutionTitle(item);
        solutionCompletionTimes[item.solution_id] = { 
          totalDays: 0, 
          count: 0, 
          title
        };
      }
      
      solutionCompletionTimes[item.solution_id].totalDays += daysToComplete;
      solutionCompletionTimes[item.solution_id].count += 1;
    }
  });
  
  return Object.entries(solutionCompletionTimes).map(([solutionId, data]) => ({
    solutionId,
    solutionTitle: data.title,
    avgDays: Math.round((data.totalDays / data.count) * 10) / 10, // Arredonda para 1 casa decimal
    count: data.count
  })).sort((a, b) => b.count - a.count).slice(0, 6); // Top 6 soluções mais implementadas
};

/**
 * Processa taxas de abandono por módulo
 */
export const processModuleAbandonment = (moduleData: any[], implementationData: any[]) => {
  if (!moduleData || !implementationData) return [];
  
  const abandonment = moduleData.map(module => {
    const moduleTitle = module.title || 'Módulo sem título';

    // Garantir que temos acesso ao solution_id
    if (!module.solution_id) return null;
    
    const totalStarts = implementationData?.filter(item => 
      item.solution_id === module.solution_id && 
      item.current_module >= module.module_order
    ).length || 0;
    
    const totalCompletions = implementationData?.filter(item => 
      item.solution_id === module.solution_id && 
      ((item.completed_modules && item.completed_modules.includes(module.module_order)) || item.is_completed)
    ).length || 0;
    
    let abandonmentRate = 0;
    if (totalStarts > 0) {
      abandonmentRate = Math.round(((totalStarts - totalCompletions) / totalStarts) * 100);
    }
    
    return {
      moduleOrder: module.module_order,
      moduleTitle,
      abandonmentRate,
      totalStarts
    };
  })
  .filter(Boolean as any) // Remover itens nulos
  .sort((a, b) => (b?.abandonmentRate || 0) - (a?.abandonmentRate || 0))
  .slice(0, 10); // Top 10 módulos com maior taxa de abandono
  
  return abandonment as ImplementationData['abandonmentByModule'];
};

/**
 * Processa implementações recentes
 */
export const processRecentImplementations = (recentData: any[]) => {
  if (!recentData) return [];
  
  return recentData.map(item => {
    const solutionTitle = extractSolutionTitle(item);
    const userName = extractUserName(item);
    
    // Calcular percentual completo com base nos módulos completados
    let percentComplete = 0;
    if (item.is_completed) {
      percentComplete = 100;
    } else if (item.completed_modules && item.completed_modules.length > 0) {
      // Se não foi possível determinar o total de módulos, assumir que current_module é o último
      const totalModules = item.current_module + 1;
      percentComplete = Math.round((item.completed_modules.length / totalModules) * 100);
    }
    
    return {
      id: item.id,
      solutionTitle,
      userName,
      status: item.is_completed ? 'Concluído' : 'Em andamento',
      lastActivity: new Date(item.last_activity).toLocaleDateString('pt-BR'),
      percentComplete
    };
  }) || [];
};
