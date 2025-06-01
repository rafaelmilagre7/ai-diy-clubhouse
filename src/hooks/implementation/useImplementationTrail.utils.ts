
import { ImplementationTrail } from '@/types/implementation-trail';

export const sanitizeTrailData = (rawData: any): ImplementationTrail | null => {
  try {
    if (!rawData || typeof rawData !== 'object') {
      console.warn('Dados da trilha inválidos:', rawData);
      return null;
    }

    // Garantir que as prioridades existem e são arrays
    const priority1 = Array.isArray(rawData.priority1) ? rawData.priority1 : [];
    const priority2 = Array.isArray(rawData.priority2) ? rawData.priority2 : [];
    const priority3 = Array.isArray(rawData.priority3) ? rawData.priority3 : [];
    
    // Garantir que recommended_courses existe e é array
    const recommended_courses = Array.isArray(rawData.recommended_courses) ? rawData.recommended_courses : [];
    
    // Garantir que recommended_lessons existe e é array
    const recommended_lessons = Array.isArray(rawData.recommended_lessons) ? rawData.recommended_lessons : [];

    const sanitizedTrail: ImplementationTrail = {
      priority1: priority1.filter(item => item && item.solutionId),
      priority2: priority2.filter(item => item && item.solutionId),
      priority3: priority3.filter(item => item && item.solutionId),
      recommended_courses,
      recommended_lessons
    };

    console.log('✅ Trilha sanitizada:', sanitizedTrail);
    return sanitizedTrail;
  } catch (error) {
    console.error('❌ Erro ao sanitizar dados da trilha:', error);
    return null;
  }
};

export const validateTrailData = (trail: ImplementationTrail): boolean => {
  if (!trail) return false;
  
  const hasValidPriority1 = Array.isArray(trail.priority1) && trail.priority1.length > 0;
  const hasValidPriority2 = Array.isArray(trail.priority2) && trail.priority2.length > 0;
  const hasValidPriority3 = Array.isArray(trail.priority3) && trail.priority3.length > 0;
  
  return hasValidPriority1 || hasValidPriority2 || hasValidPriority3;
};
