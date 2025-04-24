
import { Solution as SupabaseSolution } from '@/lib/supabase/types';
import { Solution, SolutionCategory } from '@/types/solution';
import { toSolutionCategory } from '@/lib/types/categoryTypes';

/**
 * Adapta o tipo Solution do Supabase para o tipo interno Solution
 */
export const adaptSolutionType = (supaSolution: SupabaseSolution): Solution => {
  // Garantir que a categoria seja do tipo SolutionCategory
  const category = toSolutionCategory(supaSolution.category || 'strategy');
  
  // Garantir que o campo difficulty seja um dos tipos permitidos
  const difficulty = (
    supaSolution.difficulty === 'easy' || 
    supaSolution.difficulty === 'medium' || 
    supaSolution.difficulty === 'advanced'
  ) ? supaSolution.difficulty : 'medium';
  
  // Construir objeto com o tipo correto
  const solution: Solution = {
    id: supaSolution.id,
    title: supaSolution.title,
    description: supaSolution.description || '',
    category,
    difficulty,
    published: supaSolution.published || false,
    thumbnail_url: supaSolution.thumbnail_url || '',
    created_at: supaSolution.created_at,
    updated_at: supaSolution.updated_at || '',
    slug: supaSolution.slug || '',
    implementation_steps: supaSolution.implementation_steps || [],
    checklist_items: supaSolution.checklist_items || [],
    modules: supaSolution.modules || [],
    progress: supaSolution.progress || null,
    prerequisites: [],
    completion_criteria: [],
    estimated_time: supaSolution.estimated_time || 0,
    success_rate: supaSolution.success_rate || 0,
    tags: supaSolution.tags || [],
    overview: ''
  };

  return solution;
};

/**
 * Adapta um objeto Progress do Supabase para o formato interno
 */
export const adaptProgressType = (progress: any) => {
  return {
    ...progress
  };
};
