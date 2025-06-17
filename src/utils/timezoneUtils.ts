
// Função para extrair apenas o horário (HH:MM) de um datetime string
export const extractLocalTime = (datetimeString: string): string => {
  if (!datetimeString || !datetimeString.includes('T')) {
    return '';
  }
  
  const timePart = datetimeString.split('T')[1];
  if (!timePart) return '';
  
  // Retornar apenas HH:MM
  return timePart.substring(0, 5);
};

// Função para converter datetime para formato datetime-local (para inputs)
export const convertToDatetimeLocal = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao converter para datetime-local:', error);
    return '';
  }
};
