
/**
 * Formata uma data para exibição no formato pt-BR
 */
export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
