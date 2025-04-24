
// Utilidades (antes no .utils.ts)
import { ImplementationTrail } from "../useImplementationTrail";

export const sanitizeTrailData = (trailData: any): ImplementationTrail | null => {
  if (!trailData) return null;
  if (trailData.priority1 || trailData.priority2 || trailData.priority3) {
    return {
      priority1: Array.isArray(trailData.priority1) ? trailData.priority1 : [],
      priority2: Array.isArray(trailData.priority2) ? trailData.priority2 : [],
      priority3: Array.isArray(trailData.priority3) ? trailData.priority3 : []
    };
  }
  if (Array.isArray(trailData)) {
    const third = Math.ceil(trailData.length / 3);
    return {
      priority1: trailData.slice(0, third).map(item =>
        typeof item === 'object' 
          ? { solutionId: item.id || item.solutionId, justification: item.justification || 'Recomendação baseada no seu perfil' }
          : { solutionId: item, justification: 'Recomendação baseada no seu perfil' }),
      priority2: trailData.slice(third, third * 2).map(item =>
        typeof item === 'object' 
          ? { solutionId: item.id || item.solutionId, justification: item.justification || 'Recomendação complementar' }
          : { solutionId: item, justification: 'Recomendação complementar' }),
      priority3: trailData.slice(third * 2).map(item =>
        typeof item === 'object' 
          ? { solutionId: item.id || item.solutionId, justification: item.justification || 'Recomendação para exploração futura' }
          : { solutionId: item, justification: 'Recomendação para exploração futura' }),
    };
  }
  return {
    priority1: [],
    priority2: [],
    priority3: []
  };
};
