
/**
 * Verifica se a trilha de implementação contém dados válidos
 */
export const hasTrailContent = (trail: any): boolean => {
  if (!trail) return false;
  
  try {
    // Verificar se pelo menos uma das prioridades existe e tem pelo menos um item
    const priority1 = Array.isArray(trail.priority1) && trail.priority1.length > 0;
    const priority2 = Array.isArray(trail.priority2) && trail.priority2.length > 0;
    const priority3 = Array.isArray(trail.priority3) && trail.priority3.length > 0;
    
    // Verificar se cada solução tem um ID (garantir que não são objetos vazios)
    const hasSolutions = 
      (priority1 && trail.priority1.some((item: any) => item.solutionId)) || 
      (priority2 && trail.priority2.some((item: any) => item.solutionId)) || 
      (priority3 && trail.priority3.some((item: any) => item.solutionId));
    
    // Log para debug
    console.log("Verificação da trilha:", { 
      temPrioridade1: priority1, 
      temPrioridade2: priority2, 
      temPrioridade3: priority3,
      temSolucoesValidas: hasSolutions,
      trail 
    });
    
    return (priority1 || priority2 || priority3) && hasSolutions;
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
