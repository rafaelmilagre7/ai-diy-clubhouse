
export const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "-";
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeDate = (dateString: string) => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Expirou há ${Math.abs(diffDays)} dia(s)`;
  } else if (diffDays === 0) {
    return "Expira hoje";
  } else if (diffDays === 1) {
    return "Expira amanhã";
  } else {
    return `Expira em ${diffDays} dia(s)`;
  }
};
