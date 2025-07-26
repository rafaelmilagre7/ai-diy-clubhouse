
// Utilitários para manipulação de timezone e horários
// Configuração para o horário de Brasília (UTC-3)
import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

// Extrai apenas o horário de uma string datetime
export const extractLocalTime = (dateTimeString: string): string => {
  if (!dateTimeString || !dateTimeString.includes('T')) {
    return '';
  }
  
  const timePart = dateTimeString.split('T')[1];
  if (!timePart) return '';
  
  const [hours, minutes] = timePart.split(':');
  return `${hours}:${minutes}`;
};

// Formata uma data para o formato datetime-local do HTML (sempre em horário de Brasília)
export const formatDateTimeLocal = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, BRAZIL_TIMEZONE);
  
  const year = zonedDate.getFullYear();
  const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
  const day = String(zonedDate.getDate()).padStart(2, '0');
  const hours = String(zonedDate.getHours()).padStart(2, '0');
  const minutes = String(zonedDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Converte um datetime-local para UTC para armazenar no banco
export const convertLocalToUTC = (localDateTime: string): string => {
  if (!localDateTime) return '';
  
  // Cria uma data no timezone de Brasília
  const localDate = new Date(localDateTime);
  const utcDate = fromZonedTime(localDate, BRAZIL_TIMEZONE);
  
  return utcDate.toISOString();
};

// Formata horário para exibição (sempre mostra horário de Brasília)
export const formatTimeForDisplay = (timeString: string): string => {
  if (!timeString) return '';
  
  if (timeString.includes('T')) {
    return extractLocalTime(timeString);
  }
  
  return timeString;
};

// Retorna a data/hora atual do Brasil
export const getNowInBrazil = (): Date => {
  return toZonedTime(new Date(), BRAZIL_TIMEZONE);
};

// Formata data no formato brasileiro com timezone correto
export const formatBrazilianDateTime = (date: Date | string, formatStr: string = "dd/MM/yyyy 'às' HH:mm"): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const zonedDate = toZonedTime(dateObj, BRAZIL_TIMEZONE);
  
  return format(zonedDate, formatStr, { 
    locale: ptBR,
    timeZone: BRAZIL_TIMEZONE 
  });
};

// Verifica se a data/hora é válida
export const isValidDateTime = (dateTime: string): boolean => {
  try {
    const date = new Date(dateTime);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

// Retorna informações sobre o timezone atual
export const getTimezoneInfo = () => {
  const now = new Date();
  const brazilTime = toZonedTime(now, BRAZIL_TIMEZONE);
  
  return {
    userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    brazilTimezone: BRAZIL_TIMEZONE,
    currentTime: now,
    brazilTime: brazilTime,
    userTime: format(now, "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
    brazilTimeFormatted: format(brazilTime, "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
    offset: format(brazilTime, 'xxx', { timeZone: BRAZIL_TIMEZONE })
  };
};
