
/**
 * Verifica se a trilha de implementação contém dados válidos
 */
export const hasTrailContent = (trail: any): boolean => {
  if (!trail) return false;
  
  try {
    // Verificações básicas para conteúdo da trilha
    const priority1 = Array.isArray(trail.priority1) && trail.priority1.length > 0;
    const priority2 = Array.isArray(trail.priority2) && trail.priority2.length > 0;
    const priority3 = Array.isArray(trail.priority3) && trail.priority3.length > 0;
    
    return priority1 || priority2 || priority3;
  } catch (error) {
    console.error("Erro ao verificar conteúdo da trilha:", error);
    return false;
  }
};

/**
 * Verifica se a API está demorando muito para responder
 */
export const isApiTimeout = (startTime: number | null, timeout = 15000): boolean => {
  if (!startTime) return false;
  return (Date.now() - startTime) > timeout;
};

/**
 * Extrai mensagem de erro para exibição ao usuário
 */
export const extractErrorMessage = (error: any): string => {
  if (!error) return "Erro desconhecido";
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.error) return typeof error.error === 'string' 
    ? error.error 
    : JSON.stringify(error.error);
  
  try {
    return JSON.stringify(error);
  } catch (e) {
    return "Erro não formatável";
  }
};

/**
 * Limpa dados da trilha para garantir um formato consistente
 */
export const sanitizeTrailData = (trail: any): any => {
  if (!trail) return null;
  
  try {
    // Garantir que todas as prioridades são arrays
    return {
      priority1: Array.isArray(trail.priority1) ? trail.priority1.filter(item => item && item.solutionId) : [],
      priority2: Array.isArray(trail.priority2) ? trail.priority2.filter(item => item && item.solutionId) : [],
      priority3: Array.isArray(trail.priority3) ? trail.priority3.filter(item => item && item.solutionId) : []
    };
  } catch (error) {
    console.error("Erro ao sanitizar dados da trilha:", error);
    return {
      priority1: [],
      priority2: [],
      priority3: []
    };
  }
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
