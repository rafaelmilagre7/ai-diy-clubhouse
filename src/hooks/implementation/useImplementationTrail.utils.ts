
/**
 * Verifica se a trilha de implementação contém dados válidos
 */
export const hasTrailContent = (trail: any): boolean => {
  if (!trail) return false;
  
  // Verificar se pelo menos uma das prioridades tem conteúdo
  const priority1 = Array.isArray(trail.priority1) && trail.priority1.length > 0;
  const priority2 = Array.isArray(trail.priority2) && trail.priority2.length > 0;
  const priority3 = Array.isArray(trail.priority3) && trail.priority3.length > 0;
  
  return priority1 || priority2 || priority3;
};
