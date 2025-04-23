
import { Solution as SupabaseSolution, Module as SupabaseModule } from '@/types/supabaseTypes';
import { Solution as AppSolution, Module as AppModule, ModuleType, Progress } from '@/types/solution';

/**
 * Adapta o tipo Solution do Supabase para o tipo Solution da aplicação
 */
export function adaptSolutionType(supabaseSolution: SupabaseSolution): AppSolution {
  return {
    ...supabaseSolution,
    difficulty: adaptDifficultyType(supabaseSolution.difficulty),
    category: adaptCategoryType(supabaseSolution.category),
    modules: supabaseSolution.modules?.map(adaptModuleType) || []
  } as AppSolution;
}

/**
 * Adapta o tipo Module do Supabase para o tipo Module da aplicação
 */
export function adaptModuleType(supabaseModule: SupabaseModule): AppModule {
  return {
    ...supabaseModule,
    type: adaptModuleTypeEnum(supabaseModule.type)
  } as AppModule;
}

/**
 * Adapta o tipo de módulo de string para o enum ModuleType
 */
function adaptModuleTypeEnum(type: string): ModuleType {
  switch (type) {
    case 'landing': return 'landing';
    case 'overview': return 'overview';
    case 'preparation': return 'preparation';
    case 'implementation': return 'implementation';
    case 'verification': return 'verification';
    case 'results': return 'results';
    case 'optimization': return 'optimization';
    case 'celebration': return 'celebration';
    default: return 'overview';
  }
}

/**
 * Adapta o tipo de dificuldade para o formato esperado
 */
function adaptDifficultyType(difficulty: string): 'easy' | 'medium' | 'advanced' {
  switch (difficulty) {
    case 'easy': return 'easy';
    case 'medium': return 'medium';
    case 'advanced': return 'advanced';
    default: return 'easy';
  }
}

/**
 * Adapta o tipo de categoria para o formato esperado
 */
function adaptCategoryType(category: string): string {
  return category;
}

/**
 * Adapta o objeto de progresso para o tipo Progress
 */
export function adaptProgressType(progress: any): Progress | null {
  if (!progress) return null;
  
  return {
    id: progress.id || '',
    user_id: progress.user_id || '',
    solution_id: progress.solution_id || '',
    current_module: progress.current_module || 0,
    implementation_status: progress.implementation_status || 'not_started',
    is_completed: progress.is_completed || false,
    completed_modules: progress.completed_modules || [],
    last_activity: progress.last_activity || '',
    completion_percentage: progress.completion_percentage || 0,
    completion_data: progress.completion_data || {},
    completed_at: progress.completed_at
  };
}
