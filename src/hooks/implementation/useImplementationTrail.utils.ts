
/**
 * Verifica se a trilha de implementação contém dados válidos
 */
export const hasTrailContent = (trail: any): boolean => {
  if (!trail) return false;
  
  try {
    // Verificações mais robustas para garantir que a trilha tenha algum conteúdo válido
    const priority1 = Array.isArray(trail.priority1) && trail.priority1.length > 0;
    const priority2 = Array.isArray(trail.priority2) && trail.priority2.length > 0;
    const priority3 = Array.isArray(trail.priority3) && trail.priority3.length > 0;
    
    // Verificar se pelo menos uma prioridade existe e tem item com solutionId válido
    const hasSolutionInPriority1 = priority1 && trail.priority1.some((item: any) => item && item.solutionId);
    const hasSolutionInPriority2 = priority2 && trail.priority2.some((item: any) => item && item.solutionId);
    const hasSolutionInPriority3 = priority3 && trail.priority3.some((item: any) => item && item.solutionId);
    
    const hasAnySolutions = hasSolutionInPriority1 || hasSolutionInPriority2 || hasSolutionInPriority3;
    
    return hasAnySolutions;
  } catch (error) {
    console.error("Erro ao verificar conteúdo da trilha:", error);
    return false;
  }
};

/**
 * Verifica se uma trilha está em estado de carregamento perpétuo
 */
export const isTrailStuck = (lastLoadTime: number | null, loadingTime = 10000): boolean => {
  if (!lastLoadTime) return false;
  
  // Se estiver carregando há mais de X segundos (padrão 10s), consideramos travado
  const currentTime = Date.now();
  const loadingDuration = currentTime - lastLoadTime;
  
  return loadingDuration > loadingTime;
};

/**
 * Conta o número total de soluções em uma trilha
 */
export const countTrailSolutions = (trail: any): number => {
  if (!trail) return 0;
  
  try {
    let count = 0;
    
    if (Array.isArray(trail.priority1)) count += trail.priority1.filter((item: any) => item && item.solutionId).length;
    if (Array.isArray(trail.priority2)) count += trail.priority2.filter((item: any) => item && item.solutionId).length;
    if (Array.isArray(trail.priority3)) count += trail.priority3.filter((item: any) => item && item.solutionId).length;
    
    return count;
  } catch (error) {
    console.error("Erro ao contar soluções da trilha:", error);
    return 0;
  }
};

/**
 * Limpa dados da trilha para garantir um formato consistente
 */
export const sanitizeTrailData = (trail: any): any => {
  if (!trail) return null;
  
  try {
    // Garantir que todas as prioridades são arrays
    const sanitized = {
      priority1: Array.isArray(trail.priority1) ? trail.priority1 : [],
      priority2: Array.isArray(trail.priority2) ? trail.priority2 : [],
      priority3: Array.isArray(trail.priority3) ? trail.priority3 : []
    };
    
    // Filtrar itens inválidos de cada array (sem solutionId)
    sanitized.priority1 = sanitized.priority1.filter(item => item && item.solutionId);
    sanitized.priority2 = sanitized.priority2.filter(item => item && item.solutionId);
    sanitized.priority3 = sanitized.priority3.filter(item => item && item.solutionId);
    
    return sanitized;
  } catch (error) {
    console.error("Erro ao sanitizar dados da trilha:", error);
    return {
      priority1: [],
      priority2: [],
      priority3: []
    };
  }
};
