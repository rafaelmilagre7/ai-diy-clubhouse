/**
 * Utilitários para gerenciamento de progresso de aulas
 * Sistema binário padronizado: 0% (não iniciada), 5% (iniciada), 100% (concluída)
 */

import { LearningProgress } from "@/lib/supabase/types";

export const LESSON_PROGRESS = {
  NOT_STARTED: 0,    // Nunca acessou
  STARTED: 5,        // Iniciou mas não terminou
  COMPLETED: 100     // Concluído
} as const;

/**
 * Verifica se uma aula está concluída
 * Considera concluída se progress_percentage >= 100
 */
export const isLessonCompleted = (progressPercentage?: number | null): boolean => {
  return (progressPercentage ?? 0) >= LESSON_PROGRESS.COMPLETED;
};

/**
 * Verifica se uma aula foi iniciada (mas não necessariamente concluída)
 */
export const isLessonStarted = (progressPercentage?: number | null): boolean => {
  return (progressPercentage ?? 0) > LESSON_PROGRESS.NOT_STARTED;
};

/**
 * Calcula o progresso total de um curso baseado nas aulas concluídas
 */
export const calculateCourseProgress = (
  allLessonIds: string[],
  userProgress: LearningProgress[]
): number => {
  if (allLessonIds.length === 0) return 0;
  
  const completedCount = userProgress.filter(
    p => allLessonIds.includes(p.lesson_id) && isLessonCompleted(p.progress_percentage)
  ).length;
  
  return Math.round((completedCount / allLessonIds.length) * 100);
};

/**
 * Obtém IDs de aulas concluídas de uma lista de progresso
 */
export const getCompletedLessonIds = (userProgress: LearningProgress[]): string[] => {
  return userProgress
    .filter(p => isLessonCompleted(p.progress_percentage))
    .map(p => p.lesson_id);
};

/**
 * Verifica se um curso está completo (100% das aulas concluídas)
 */
export const isCourseCompleted = (progressPercentage: number): boolean => {
  return progressPercentage >= 100;
};
