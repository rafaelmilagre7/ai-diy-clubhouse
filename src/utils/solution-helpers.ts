
/**
 * Retorna a classe CSS apropriada para a cor de fundo de acordo com o nível de dificuldade
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

/**
 * Formata o tempo estimado em minutos para um formato legível
 */
export const formatEstimatedTime = (minutes?: number): string => {
  if (!minutes) return 'Tempo não especificado';
  
  if (minutes < 60) {
    return `${minutes} minutos`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hora${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hora${hours > 1 ? 's' : ''} e ${remainingMinutes} minutos`;
};

/**
 * Formata a data para exibição
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};
