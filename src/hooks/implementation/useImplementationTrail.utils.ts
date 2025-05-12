
import { ImplementationTrail } from "./useImplementationTrail";

export const sanitizeTrailData = (trailData: ImplementationTrail | null): ImplementationTrail | null => {
  if (!trailData) return null;
  
  // Garantir que todas as propriedades existam e sejam arrays
  const sanitized: ImplementationTrail = {
    priority1: Array.isArray(trailData.priority1) ? trailData.priority1 : [],
    priority2: Array.isArray(trailData.priority2) ? trailData.priority2 : [],
    priority3: Array.isArray(trailData.priority3) ? trailData.priority3 : []
  };

  // Garantir que cada item em cada array tenha as propriedades necessárias
  ['priority1', 'priority2', 'priority3'].forEach(key => {
    sanitized[key as keyof ImplementationTrail] = sanitized[key as keyof ImplementationTrail].map(item => ({
      solutionId: item.solutionId || '',
      justification: item.justification || 'Recomendação personalizada'
    }));
  });
  
  return sanitized;
};

// Função para extrair IDs válidos das recomendações
export const extractValidIds = (trail: ImplementationTrail | null): string[] => {
  if (!trail) return [];
  
  const allRecommendations = [
    ...(trail.priority1 || []),
    ...(trail.priority2 || []),
    ...(trail.priority3 || [])
  ];
  
  return allRecommendations
    .filter(rec => rec.solutionId && rec.solutionId !== 'mock-solution-1' && rec.solutionId !== 'default-solution-1')
    .map(rec => rec.solutionId);
};

// Função para validar a estrutura da trilha
export const isValidTrail = (trail: ImplementationTrail | null): boolean => {
  if (!trail) return false;
  
  // Verificar se pelo menos uma das prioridades tem soluções
  const hasContent = 
    (Array.isArray(trail.priority1) && trail.priority1.length > 0) ||
    (Array.isArray(trail.priority2) && trail.priority2.length > 0) ||
    (Array.isArray(trail.priority3) && trail.priority3.length > 0);
    
  return hasContent;
};
