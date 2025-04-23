
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

/**
 * Registra um evento de progresso para fins de análise
 * @param userId ID do usuário
 * @param solutionId ID da solução
 * @param event Nome do evento
 * @param details Detalhes adicionais do evento
 */
export const logProgressEvent = async (
  userId: string,
  solutionId: string,
  event: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    console.log(`Registrando evento de progresso: ${event}`, { 
      userId, 
      solutionId, 
      ...details 
    });
    // Aqui poderíamos implementar um registro real no banco de dados
    // ou enviar para um serviço de análise
  } catch (error) {
    console.error("Erro ao registrar evento de progresso:", error);
  }
};
