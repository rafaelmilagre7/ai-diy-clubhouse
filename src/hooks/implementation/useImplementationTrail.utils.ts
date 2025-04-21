
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
