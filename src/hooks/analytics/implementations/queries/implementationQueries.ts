
import { supabase } from '@/lib/supabase';

/**
 * Função utilitária para logging que não depende de hooks React
 */
const logWarning = (message: string, data: any = {}) => {
  console.warn(`[Warning] ${message}:`, data);
};

/**
 * Busca dados sobre conclusões de implementações
 */
export const fetchCompletionData = async (startDate: string | null) => {
  let completionQuery = supabase
    .from('progress')
    .select('is_completed');

  if (startDate) {
    completionQuery = completionQuery.gte('created_at', startDate);
  }

  const { data, error } = await completionQuery;

  if (error) {
    logWarning('Erro ao buscar dados de conclusão', { 
      error: error.message, 
      critical: false 
    });
  }

  return data || [];
};

/**
 * Busca implementações por dificuldade
 */
export const fetchDifficultyData = async (startDate: string | null) => {
  let difficultyQuery = supabase
    .from('progress')
    .select(`
      solution_id,
      solutions!inner (
        difficulty
      )
    `);

  if (startDate) {
    difficultyQuery = difficultyQuery.gte('created_at', startDate);
  }

  const { data, error } = await difficultyQuery;

  if (error) {
    logWarning('Erro ao buscar implementações por dificuldade', { 
      error: error.message, 
      critical: false 
    });
  }

  return data || [];
};

/**
 * Busca tempo médio de implementação
 */
export const fetchTimeCompletionData = async (startDate: string | null) => {
  let timeQuery = supabase
    .from('progress')
    .select(`
      id,
      solution_id,
      created_at,
      completed_at,
      solutions!inner (
        title
      )
    `)
    .eq('is_completed', true);

  if (startDate) {
    timeQuery = timeQuery.gte('created_at', startDate);
  }

  const { data, error } = await timeQuery;

  if (error) {
    logWarning('Erro ao buscar dados de tempo de implementação', { 
      error: error.message, 
      critical: false 
    });
  }

  return data || [];
};

/**
 * Busca dados de módulos para cálculo de abandono
 */
export const fetchModuleData = async () => {
  const { data, error } = await supabase
    .from('modules')
    .select(`
      id,
      title,
      module_order,
      solution_id,
      solutions!inner (
        title
      )
    `)
    .order('module_order');

  if (error) {
    logWarning('Erro ao buscar módulos', { 
      error: error.message, 
      critical: false 
    });
  }

  return data || [];
};

/**
 * Busca implementações recentes
 */
export const fetchRecentImplementations = async (startDate: string | null) => {
  let recentQuery = supabase
    .from('progress')
    .select(`
      id,
      user_id,
      solution_id,
      is_completed,
      current_module,
      last_activity,
      completed_modules,
      solutions!inner (
        title,
        id
      ),
      profiles!inner (
        name
      )
    `)
    .order('last_activity', { ascending: false })
    .limit(10);

  if (startDate) {
    recentQuery = recentQuery.gte('last_activity', startDate);
  }

  const { data, error } = await recentQuery;

  if (error) {
    logWarning('Erro ao buscar implementações recentes', { 
      error: error.message, 
      critical: false 
    });
  }

  return data || [];
};
