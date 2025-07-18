
import { useMemo } from 'react';
import { Solution } from '@/lib/supabase';

interface ProgressCheckpoint {
  id: string;
  solution_id: string;
  progress_percentage: number;
  user_id: string;
}

export const useSolutionProgress = (solutions: Solution[], progressData: ProgressCheckpoint[]) => {
  return useMemo(() => {
    // Criar mapa de progresso para lookup O(1)
    const progressMap = new Map<string, ProgressCheckpoint>();
    progressData.forEach(checkpoint => {
      progressMap.set(checkpoint.solution_id, checkpoint);
    });

    const categorized = {
      active: [] as Solution[],
      completed: [] as Solution[],
      recommended: [] as Solution[]
    };

    solutions.forEach(solution => {
      const checkpoint = progressMap.get(solution.id);
      
      if (!checkpoint || checkpoint.progress_percentage === 0) {
        categorized.recommended.push(solution);
      } else if (checkpoint.progress_percentage === 100) {
        categorized.completed.push(solution);
      } else {
        categorized.active.push(solution);
      }
    });

    return categorized;
  }, [solutions, progressData]);
};
