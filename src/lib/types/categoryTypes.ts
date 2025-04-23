
/**
 * Este arquivo é mantido para compatibilidade com código existente.
 * Novas implementações devem usar src/lib/types/appTypes.ts
 */

import { 
  SolutionCategory, 
  isSolutionCategory, 
  toSolutionCategory, 
  getCategoryDisplayName, 
  getCategoryStyles 
} from './appTypes';

// Usando export type para re-exportar tipos quando isolatedModules está ativado
export type { SolutionCategory };
export { 
  isSolutionCategory,
  toSolutionCategory,
  getCategoryDisplayName,
  getCategoryStyles
};
