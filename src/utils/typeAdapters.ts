
import { Solution as SupabaseSolution, Module as SupabaseModule } from '@/types/supabaseTypes';
import { Solution, Module, Progress, ModuleType } from '@/types/solution';

/**
 * Adapta o tipo Solution do Supabase para o tipo interno Solution
 */
export const adaptSolutionType = (supaSolution: SupabaseSolution): Solution => {
  // Garantir que o campo modules seja um array
  const modules = Array.isArray(supaSolution.modules) 
    ? supaSolution.modules.map(adaptModuleType)
    : [];

  // Adaptar o campo progress para garantir que contenha todas as propriedades necessárias
  let progressData = null;
  
  if (supaSolution.progress) {
    // Criando um objeto Progress com valores padrão quando necessário
    progressData = {
      id: supaSolution.progress.id || '',
      user_id: supaSolution.progress.user_id || '',
      solution_id: supaSolution.progress.solution_id || '',
      implementation_status: (supaSolution.progress.implementation_status as any) || 'not_started',
      current_module: supaSolution.progress.current_module || 0,
      is_completed: supaSolution.progress.is_completed || false,
      completed_modules: supaSolution.progress.completed_modules || [],
      last_activity: supaSolution.progress.last_activity || new Date().toISOString(),
      completion_percentage: supaSolution.progress.completion_percentage || 0,
      completion_data: supaSolution.progress.completion_data || {},
      completed_at: supaSolution.progress.completed_at || null
    } as Progress;
  }

  // Garantir que category e difficulty sejam valores válidos para os tipos esperados
  const category = (supaSolution.category === 'revenue' || 
                 supaSolution.category === 'operational' || 
                 supaSolution.category === 'strategy') ? 
                 supaSolution.category : 'strategy';
                 
  const difficulty = (supaSolution.difficulty === 'easy' || 
                   supaSolution.difficulty === 'medium' || 
                   supaSolution.difficulty === 'advanced') ? 
                   supaSolution.difficulty : 'medium';

  return {
    id: supaSolution.id,
    title: supaSolution.title,
    description: supaSolution.description || '',
    category: category,
    difficulty: difficulty,
    published: supaSolution.published || false,
    thumbnail_url: supaSolution.thumbnail_url,
    created_at: supaSolution.created_at,
    updated_at: supaSolution.updated_at,
    slug: supaSolution.slug || '',
    implementation_steps: supaSolution.implementation_steps || [],
    // Verificamos se checklist_items existe no objeto antes de usá-lo
    checklist_items: supaSolution.checklist ? supaSolution.checklist : (supaSolution as any).checklist_items || [],
    // Verificamos se completion_requirements existe no objeto antes de usá-lo
    completion_requirements: (supaSolution as any).completion_requirements || {},
    modules: modules,
    progress: progressData,
    overview: supaSolution.overview || '',
    prerequisites: supaSolution.prerequisites || [],
    completion_criteria: supaSolution.completion_criteria || [],
    estimated_time: supaSolution.estimated_time || 0,
    success_rate: supaSolution.success_rate || 0,
    tags: supaSolution.tags || [],
  };
};

/**
 * Adapta o tipo Module do Supabase para o tipo interno Module
 */
export const adaptModuleType = (module: SupabaseModule): Module => {
  // Garantir que o tipo do módulo seja um dos tipos válidos
  const validType = validateModuleType(module.type);

  return {
    id: module.id,
    solution_id: module.solution_id,
    title: module.title,
    type: validType,
    content: module.content || { blocks: [] },
    module_order: module.module_order,
    created_at: module.created_at,
    updated_at: module.updated_at,
    certificate_template: module.certificate_template,
    estimated_time_minutes: module.estimated_time_minutes,
    metrics: module.metrics,
  };
};

/**
 * Valida o tipo do módulo para garantir que seja um dos tipos válidos
 */
export const validateModuleType = (type: string): ModuleType => {
  const validTypes: ModuleType[] = [
    'landing',
    'overview',
    'preparation',
    'implementation',
    'verification',
    'results',
    'optimization',
    'celebration'
  ];

  if (validTypes.includes(type as ModuleType)) {
    return type as ModuleType;
  }

  // Retornar um tipo padrão se não for válido
  return 'overview';
};

/**
 * Adapta o tipo Progress do Supabase para o tipo interno Progress
 */
export const adaptProgressType = (progress: any): Progress => {
  return {
    // Garantir que todos os campos obrigatórios da interface Progress estejam presentes
    id: progress.id || '',
    user_id: progress.user_id || '',
    solution_id: progress.solution_id || '',
    current_module: progress.current_module || 0,
    is_completed: progress.is_completed || false,
    completed_modules: progress.completed_modules || [],
    last_activity: progress.last_activity || new Date().toISOString(),
    implementation_status: progress.implementation_status || 'not_started',
    completion_data: progress.completion_data || {},
    completion_percentage: progress.completion_percentage || 0,
    completed_at: progress.completed_at || null
  };
};
