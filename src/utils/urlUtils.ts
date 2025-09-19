/**
 * Utilitários para manipulação de URLs
 */

/**
 * Garante que uma URL tenha protocolo (adiciona https:// se não tiver)
 */
export const ensureProtocol = (url: string): string => {
  if (!url) return '';
  
  // Se já tem protocolo, retorna como está
  if (url.match(/^https?:\/\//i)) {
    return url;
  }
  
  // Adiciona https:// por padrão
  return `https://${url}`;
};

/**
 * Gera URL para adicionar evento ao Google Calendar
 */
export const generateGoogleCalendarUrl = (
  title: string,
  startDate: string,
  endDate: string,
  description?: string,
  location?: string
): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  
  // Converter datas para formato Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatDateForGoogle = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  
  const params = new URLSearchParams({
    text: title,
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
    ...(description && { details: description }),
    ...(location && { location: location })
  });
  
  return `${baseUrl}&${params.toString()}`;
};

/**
 * Valida se uma URL é válida
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(ensureProtocol(url));
    return true;
  } catch {
    return false;
  }
};