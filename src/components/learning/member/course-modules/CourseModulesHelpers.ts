
import { LearningLesson, LearningProgress } from "@/lib/supabase/types";

/**
 * Extrai números do título das aulas para permitir ordenação numérica
 * Ex: "Aula 1 - Introdução" e "Aula 10 - Conclusão" serão ordenadas corretamente
 */
export function sortLessonsByNumber(lessons: LearningLesson[]): LearningLesson[] {
  if (!Array.isArray(lessons) || lessons.length === 0) {
    return [];
  }
  
  // Função para extrair números do título
  const extractNumber = (title: string | null | undefined): number => {
    if (!title) return 0;
    
    // Procura por padrões como "Aula 1", "Lição 2", etc.
    const match = title.match(/(?:aula|lição|lesson|módulo|modulo)\s*(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    // Procura por padrão como "01 - Título", "02 - Título", etc.
    const prefixMatch = title.match(/^(\d+)\s*[-–—:\.]/);
    if (prefixMatch && prefixMatch[1]) {
      return parseInt(prefixMatch[1], 10);
    }
    
    // Tenta encontrar qualquer número no título
    const numMatch = title.match(/\d+/);
    if (numMatch) {
      return parseInt(numMatch[0], 10);
    }
    
    return 0; // Padrão se nenhum número for encontrado
  };

  // Log para depuração
  console.log("Ordenando aulas:", lessons.map(l => l.title));

  // Criar uma cópia para não modificar o array original
  return [...lessons].sort((a, b) => {
    // Primeiro tentar ordenar por order_index se forem diferentes e válidos
    if (typeof a.order_index === 'number' && 
        typeof b.order_index === 'number' && 
        a.order_index !== b.order_index) {
      return a.order_index - b.order_index;
    }
    
    // Se order_index for igual ou inválido, ordenar por número no título
    const numA = extractNumber(a.title);
    const numB = extractNumber(b.title);
    
    if (numA !== numB) {
      return numA - numB;
    }
    
    // Se ainda empatados, ordenar alfabeticamente
    return (a.title || '').localeCompare(b.title || '');
  });
}

/**
 * Verificar se uma lição está completa baseado no progresso do usuário
 */
export function isLessonCompleted(lessonId: string, progress: LearningProgress[]): boolean {
  if (!Array.isArray(progress)) return false;
  
  return progress.some(p => 
    p.lesson_id === lessonId && 
    p.progress_percentage >= 100
  );
}

/**
 * Verificar se uma lição está em progresso
 */
export function isLessonInProgress(lessonId: string, progress: LearningProgress[]): boolean {
  if (!Array.isArray(progress)) return false;
  
  return progress.some(p => 
    p.lesson_id === lessonId && 
    p.progress_percentage > 0 && 
    p.progress_percentage < 100
  );
}

/**
 * Obter o percentual de progresso de uma lição
 */
export function getLessonProgress(lessonId: string, progress: LearningProgress[]): number {
  if (!Array.isArray(progress)) return 0;
  
  const lessonProgress = progress.find(p => p.lesson_id === lessonId);
  return lessonProgress ? lessonProgress.progress_percentage : 0;
}
