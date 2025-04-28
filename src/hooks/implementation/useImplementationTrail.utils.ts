
import { ImplementationTrail } from "./useImplementationTrail";

/**
 * Sanitiza os dados de trilha para garantir estrutura consistente
 */
export function sanitizeTrailData(trailData: any): ImplementationTrail | null {
  if (!trailData) return null;

  const sanitized: ImplementationTrail = {
    priority1: [],
    priority2: [],
    priority3: []
  };

  try {
    // Garantir que cada propriedade de prioridade tenha uma estrutura consistente
    if (trailData.priority1 && Array.isArray(trailData.priority1)) {
      sanitized.priority1 = trailData.priority1.map(item => ({
        solutionId: item.solutionId || '',
        justification: item.justification || 'Solução recomendada para seu negócio.'
      }));
    }

    if (trailData.priority2 && Array.isArray(trailData.priority2)) {
      sanitized.priority2 = trailData.priority2.map(item => ({
        solutionId: item.solutionId || '',
        justification: item.justification || 'Solução recomendada para seu negócio.'
      }));
    }

    if (trailData.priority3 && Array.isArray(trailData.priority3)) {
      sanitized.priority3 = trailData.priority3.map(item => ({
        solutionId: item.solutionId || '',
        justification: item.justification || 'Solução recomendada para seu negócio.'
      }));
    }

    return sanitized;
  } catch (error) {
    console.error("Erro ao sanitizar dados da trilha:", error);
    // Return empty trail structure as fallback
    return {
      priority1: [],
      priority2: [],
      priority3: []
    };
  }
}
