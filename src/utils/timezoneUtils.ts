
// Utilitários para manipulação de timezone e horários (Brasília UTC-3)
export const extractLocalTime = (dateTimeString: string): string => {
  if (!dateTimeString || !dateTimeString.includes('T')) {
    return '';
  }
  
  const timePart = dateTimeString.split('T')[1];
  if (!timePart) return '';
  
  const [hours, minutes] = timePart.split(':');
  return `${hours}:${minutes}`;
};

export const formatDateTimeLocal = (date: Date): string => {
  // Criar data no timezone local (Brasília)
  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Converte uma string datetime-local para UTC mantendo o horário informado como sendo de Brasília
export const convertLocalToUTC = (localDateTimeString: string): string => {
  if (!localDateTimeString) return '';
  
  // Criar objeto Date tratando como se fosse horário de Brasília (UTC-3)
  const localDate = new Date(localDateTimeString);
  
  // Adicionar 3 horas para converter de Brasília para UTC
  const utcDate = new Date(localDate.getTime() + (3 * 60 * 60 * 1000));
  
  return utcDate.toISOString();
};

// Converte uma string UTC para datetime-local tratando como horário de Brasília
export const convertUTCToLocal = (utcDateTimeString: string): string => {
  if (!utcDateTimeString) return '';
  
  const utcDate = new Date(utcDateTimeString);
  
  // Subtrair 3 horas para converter de UTC para Brasília
  const localDate = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
  
  return formatDateTimeLocal(localDate);
};

export const formatTimeForDisplay = (timeString: string): string => {
  if (!timeString) return '';
  
  if (timeString.includes('T')) {
    return extractLocalTime(timeString);
  }
  
  return timeString;
};

// Formatar data/hora para exibição considerando timezone de Brasília
export const formatDisplayDateTime = (utcDateTimeString: string): string => {
  if (!utcDateTimeString) return '';
  
  const utcDate = new Date(utcDateTimeString);
  // Subtrair 3 horas para mostrar no horário de Brasília
  const brasiliaDate = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
  
  return formatDateTimeLocal(brasiliaDate);
};
