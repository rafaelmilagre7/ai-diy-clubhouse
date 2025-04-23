
/**
 * Calcula a porcentagem de progresso com base nos módulos concluídos
 * @param completedModules Array de índices dos módulos concluídos
 * @param totalModules Número total de módulos
 * @returns Porcentagem de conclusão (0-100)
 */
export const calculateProgressPercentage = (
  completedModules: number[],
  totalModules: number
): number => {
  if (!completedModules || !Array.isArray(completedModules) || totalModules <= 0) {
    return 0;
  }
  
  const uniqueCompleted = new Set(completedModules).size;
  return Math.min(100, Math.round((uniqueCompleted / totalModules) * 100));
};
