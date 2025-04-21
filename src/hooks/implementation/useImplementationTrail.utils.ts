
import { ImplementationTrail } from "./useImplementationTrail";

export const sanitizeTrailData = (trailData: ImplementationTrail | null): ImplementationTrail | null => {
  if (!trailData) return null;
  
  // Garantir que todas as propriedades existam
  const sanitized: ImplementationTrail = {
    priority1: Array.isArray(trailData.priority1) ? trailData.priority1 : [],
    priority2: Array.isArray(trailData.priority2) ? trailData.priority2 : [],
    priority3: Array.isArray(trailData.priority3) ? trailData.priority3 : []
  };
  
  return sanitized;
};
