
import { ImplementationTrail } from '@/types/implementation-trail';

/**
 * Sanitiza e valida os dados da trilha de implementação
 */
export const sanitizeTrailData = (trailData: any): ImplementationTrail | null => {
  if (!trailData || typeof trailData !== 'object') {
    return null;
  }

  try {
    // Garantir que as propriedades obrigatórias existem
    const sanitized: ImplementationTrail = {
      priority1: Array.isArray(trailData.priority1) ? trailData.priority1 : [],
      priority2: Array.isArray(trailData.priority2) ? trailData.priority2 : [],
      priority3: Array.isArray(trailData.priority3) ? trailData.priority3 : [],
      recommended_courses: Array.isArray(trailData.recommended_courses) ? trailData.recommended_courses : [],
      recommended_lessons: Array.isArray(trailData.recommended_lessons) ? trailData.recommended_lessons : []
    };

    // Validar estrutura dos itens de prioridade
    ['priority1', 'priority2', 'priority3'].forEach((key) => {
      const items = (sanitized as any)[key];
      (sanitized as any)[key] = items.filter((item: any) => 
        item && 
        typeof item === 'object' && 
        typeof item.solutionId === 'string' && 
        item.solutionId.trim() !== ''
      );
    });

    return sanitized;
  } catch (error) {
    console.error('Erro ao sanitizar dados da trilha:', error);
    return null;
  }
};
