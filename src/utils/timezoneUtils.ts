
// Utilitários para manipulação de timezone e horários
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatTimeForDisplay = (timeString: string): string => {
  if (!timeString) return '';
  
  if (timeString.includes('T')) {
    return extractLocalTime(timeString);
  }
  
  return timeString;
};
