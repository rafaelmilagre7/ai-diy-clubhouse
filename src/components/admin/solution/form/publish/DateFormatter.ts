
/**
 * Função utilitária para formatar datas de forma consistente
 * Converte timestamps em strings formatadas para exibição amigável
 * 
 * @param dateString - String de data ISO ou timestamp
 * @returns String de data formatada ou 'N/A' se nenhuma data for fornecida
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
