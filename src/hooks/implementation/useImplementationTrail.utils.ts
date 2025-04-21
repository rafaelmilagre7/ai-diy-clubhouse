
/**
 * Funções utilitárias para useImplementationTrail
 */

import { ImplementationTrail } from "./useImplementationTrail";

export const hasTrailContent = (trailData: ImplementationTrail | null): boolean => {
  if (!trailData) return false;
  return Object.values(trailData).some(
    arr => Array.isArray(arr) && arr.length > 0
  );
};
