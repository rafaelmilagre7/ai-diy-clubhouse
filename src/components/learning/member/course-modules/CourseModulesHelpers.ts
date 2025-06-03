
import { LearningLesson, LearningProgress } from "@/lib/supabase/types";

// Função para extrair número do título de uma aula
export const extractNumberFromTitle = (title: string): number => {
  const match = title.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Função para ordenar aulas por número no título
export const sortLessonsByNumber = (lessons: LearningLesson[]): LearningLesson[] => {
  return [...lessons].sort((a, b) => {
    const numberA = extractNumberFromTitle(a.title);
    const numberB = extractNumberFromTitle(b.title);
    
    // Se ambos têm números, ordenar por número
    if (numberA && numberB) {
      return numberA - numberB;
    }
    
    // Se apenas um tem número, colocar primeiro
    if (numberA && !numberB) return -1;
    if (!numberA && numberB) return 1;
    
    // Se nenhum tem número, ordenar por order_index e depois por título
    if (a.order_index !== b.order_index) {
      return a.order_index - b.order_index;
    }
    
    return a.title.localeCompare(b.title);
  });
};

// Função para verificar se uma aula está concluída
export const isLessonCompleted = (lessonId: string, userProgress: LearningProgress[]): boolean => {
  const progress = userProgress.find(p => p.lesson_id === lessonId);
  return progress ? progress.progress_percentage >= 100 : false;
};

// Função para verificar se uma aula está em progresso
export const isLessonInProgress = (lessonId: string, userProgress: LearningProgress[]): boolean => {
  const progress = userProgress.find(p => p.lesson_id === lessonId);
  return progress ? progress.progress_percentage > 0 && progress.progress_percentage < 100 : false;
};

// Função para obter o progresso de uma aula
export const getLessonProgress = (lessonId: string, userProgress: LearningProgress[]): number => {
  const progress = userProgress.find(p => p.lesson_id === lessonId);
  return progress ? progress.progress_percentage : 0;
};
