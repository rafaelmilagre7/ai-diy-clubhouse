
// Função de utilidade para sanitizar e normalizar os dados da trilha
export const sanitizeTrailData = (trailData: any) => {
  // Se não houver dados, retornar null
  if (!trailData) return null;

  // Se trailData já tiver uma estrutura válida com priority1, priority2, priority3
  if (trailData.priority1 || trailData.priority2 || trailData.priority3) {
    return {
      priority1: Array.isArray(trailData.priority1) ? trailData.priority1 : [],
      priority2: Array.isArray(trailData.priority2) ? trailData.priority2 : [],
      priority3: Array.isArray(trailData.priority3) ? trailData.priority3 : []
    };
  }

  // Caso seja um array, tenta converter para o formato esperado
  if (Array.isArray(trailData)) {
    // Divisão em três grupos
    const third = Math.ceil(trailData.length / 3);
    return {
      priority1: trailData.slice(0, third).map(item => {
        // Garantir que cada item tenha o formato correto
        return typeof item === 'object' 
          ? { solutionId: item.id || item.solutionId, justification: item.justification || 'Recomendação baseada no seu perfil' }
          : { solutionId: item, justification: 'Recomendação baseada no seu perfil' };
      }),
      priority2: trailData.slice(third, third * 2).map(item => {
        return typeof item === 'object' 
          ? { solutionId: item.id || item.solutionId, justification: item.justification || 'Recomendação complementar' }
          : { solutionId: item, justification: 'Recomendação complementar' };
      }),
      priority3: trailData.slice(third * 2).map(item => {
        return typeof item === 'object' 
          ? { solutionId: item.id || item.solutionId, justification: item.justification || 'Recomendação para exploração futura' }
          : { solutionId: item, justification: 'Recomendação para exploração futura' };
      })
    };
  }

  // Para outros formatos, retornar um objeto vazio padronizado
  return {
    priority1: [],
    priority2: [],
    priority3: []
  };
};

// Função para validar se uma recomendação tem a estrutura correta
export const isValidRecommendation = (recommendation: any) => {
  return recommendation && 
         typeof recommendation === 'object' && 
         recommendation.solutionId && 
         typeof recommendation.solutionId === 'string';
};
