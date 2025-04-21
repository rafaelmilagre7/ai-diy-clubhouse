
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
    
    // Verifica de forma mais detalhada o conteúdo da trilha para melhorar o diagnóstico
    if (!hasAnySolutions) {
      console.error("Trilha sem soluções válidas:", JSON.stringify(trail));
    }
    
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
  
  // Reduzimos para 10 segundos para detectar problemas de carregamento mais rapidamente
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
    
    // Verificar se ainda restam itens após a limpeza
    const isEmpty = sanitized.priority1.length === 0 && 
                   sanitized.priority2.length === 0 && 
                   sanitized.priority3.length === 0;
                   
    if (isEmpty) {
      console.error("Trilha sanitizada ficou vazia");
    }
    
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
 * Verifica se é seguro abortar a operação de carregamento atual
 */
export const isSafeToAbort = (loadStartTime: number | null): boolean => {
  // Se já se passaram mais de 5 segundos, é seguro abortar a operação atual
  return isApiTimeout(loadStartTime, 5000);
};

/**
 * Verifica se a tela está em estado de carregamento por tempo excessivo
 */
export const isCriticalTimeout = (startTime: number | null): boolean => {
  // Considera-se timeout crítico após 20 segundos
  return isApiTimeout(startTime, 20000);
};

/**
 * Limpa a trilha e reinicia o processo
 */
export const resetTrailState = async (clearTrailFn: Function, refreshTrailFn: Function): Promise<boolean> => {
  try {
    // Limpar a trilha existente
    await clearTrailFn();
    
    // Pequeno delay para garantir que a limpeza seja processada
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Tentar recarregar a trilha
    await refreshTrailFn(true);
    
    return true;
  } catch (error) {
    console.error("Erro ao resetar estado da trilha:", error);
    return false;
  }
};

/**
 * Detecta problemas comuns na geração da trilha
 */
export const detectTrailIssue = (error: any, trail: any): string => {
  if (!trail || !hasTrailContent(trail)) {
    return "Trilha vazia ou sem soluções válidas. Tente gerar novamente.";
  }
  
  if (error?.message?.includes("timeout") || error?.message?.includes("tempo limite")) {
    return "Tempo limite excedido. O servidor pode estar sobrecarregado.";
  }
  
  if (error?.message?.includes("network") || error?.message?.includes("rede")) {
    return "Problema de conexão. Verifique sua internet e tente novamente.";
  }
  
  return "Erro ao processar trilha. Tente novamente mais tarde.";
};
