
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

// Função para converter UTC para horário local (Brasília UTC-3)
export const convertUTCToLocal = (utcDateString: string): string => {
  try {
    const utcDate = new Date(utcDateString);
    // Brasília é UTC-3, então para converter de UTC para local, subtraímos 3 horas
    const brasiliaDate = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
    return brasiliaDate.toISOString().slice(0, 16); // Formato datetime-local
  } catch (error) {
    console.error('Erro ao converter UTC para local:', error);
    return '';
  }
};

// Função para converter horário local (Brasília UTC-3) para UTC
export const convertLocalToUTC = (localDateString: string): string => {
  try {
    const localDate = new Date(localDateString);
    // Brasília é UTC-3, então para converter de local para UTC, adicionamos 3 horas
    const utcDate = new Date(localDate.getTime() + (3 * 60 * 60 * 1000));
    return utcDate.toISOString();
  } catch (error) {
    console.error('Erro ao converter local para UTC:', error);
    return '';
  }
};
