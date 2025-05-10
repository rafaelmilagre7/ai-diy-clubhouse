
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

/**
 * Função para ordenar aulas baseado no título numérico
 * Extrai o número do início do título (por exemplo: "01 - Introdução" => 1)
 */
export const sortLessonsByNumber = (lessons: any[]): any[] => {
  return [...lessons].sort((a, b) => {
    // Extrair números do início do título (ex: "01 - ", "1 - ", "2. " etc.)
    const numA = parseInt(a.title.match(/^(\d+)[^\d]*/)?.[1] || '0');
    const numB = parseInt(b.title.match(/^(\d+)[^\d]*/)?.[1] || '0');
    
    // Se ambos têm números, ordenar numericamente
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // Ordenação alfabética para casos sem números
    return a.title.localeCompare(b.title);
  });
};
