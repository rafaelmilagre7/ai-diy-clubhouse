
import { LearningProgress } from "@/lib/supabase/types";

/**
 * Verifica se uma aula está completa
 */
export const isLessonCompleted = (lessonId: string, userProgress?: LearningProgress[]): boolean => {
  return !!userProgress?.find(p => 
    p.lesson_id === lessonId && 
    (p.progress_percentage >= 100 || !!p.completed_at)
  );
};

/**
 * Verifica se uma aula está em progresso
 */
export const isLessonInProgress = (lessonId: string, userProgress?: LearningProgress[]): boolean => {
  const progress = userProgress?.find(p => p.lesson_id === lessonId);
  return !!progress && progress.progress_percentage > 0 && progress.progress_percentage < 100;
};

/**
 * Obter porcentagem de progresso para uma aula
 */
export const getLessonProgress = (lessonId: string, userProgress?: LearningProgress[]): number => {
  const progress = userProgress?.find(p => p.lesson_id === lessonId);
  return progress ? progress.progress_percentage : 0;
};
