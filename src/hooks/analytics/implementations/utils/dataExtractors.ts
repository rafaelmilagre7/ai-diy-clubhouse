
/**
 * Funções utilitárias para extrair dados com segurança dos resultados do Supabase
 */

/**
 * Extrai a dificuldade de uma solução com segurança
 */
export const extractSolutionDifficulty = (item: any): string => {
  if (!item.solutions) return 'Desconhecido';
  if (Array.isArray(item.solutions)) {
    return item.solutions[0]?.difficulty || 'Desconhecido';
  }
  return item.solutions.difficulty || 'Desconhecido';
};

/**
 * Extrai o título de uma solução com segurança
 */
export const extractSolutionTitle = (item: any): string => {
  if (!item.solutions) return 'Solução desconhecida';
  if (Array.isArray(item.solutions)) {
    return item.solutions[0]?.title || 'Solução desconhecida';
  }
  return item.solutions.title || 'Solução desconhecida';
};

/**
 * Extrai o ID de uma solução com segurança
 */
export const extractSolutionId = (item: any): string => {
  if (!item.solutions) return item.solution_id || '';
  if (Array.isArray(item.solutions)) {
    return item.solutions[0]?.id || item.solution_id || '';
  }
  return item.solutions.id || item.solution_id || '';
};

/**
 * Extrai o nome de usuário com segurança
 */
export const extractUserName = (item: any): string => {
  if (!item.profiles) return 'Usuário desconhecido';
  if (Array.isArray(item.profiles)) {
    return item.profiles[0]?.name || 'Usuário desconhecido';
  }
  return item.profiles.name || 'Usuário desconhecido';
};
