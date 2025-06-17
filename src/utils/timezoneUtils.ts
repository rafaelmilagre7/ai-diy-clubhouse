
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

// Função para converter UTC para horário local de Brasília para EXIBIÇÃO
export const formatToLocalTime = (utcDateString: string): string => {
  try {
    const date = new Date(utcDateString);
    // Usar toLocaleString com timezone de Brasília
    return date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2})/, '$3-$2-$1T$4');
  } catch (error) {
    console.error('Erro ao formatar horário local:', error);
    return '';
  }
};

// Função para converter UTC para datetime-local format (para inputs)
export const convertUTCToDatetimeLocal = (utcDateString: string): string => {
  try {
    const date = new Date(utcDateString);
    // O JavaScript já trata a conversão automática para o timezone local
    // Precisamos apenas formatar para datetime-local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao converter UTC para datetime-local:', error);
    return '';
  }
};
