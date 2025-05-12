
import { format, parseISO } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

// Fuso horário de Brasília (BRT)
export const BRASIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Converte um timestamp UTC para o fuso horário de Brasília
 */
export function toLocalTime(utcTimestamp: string | Date): Date {
  return utcToZonedTime(
    typeof utcTimestamp === 'string' ? parseISO(utcTimestamp) : utcTimestamp,
    BRASIL_TIMEZONE
  );
}

/**
 * Converte um timestamp do fuso horário de Brasília para UTC
 */
export function toUTCTime(localTimestamp: string | Date): Date {
  return zonedTimeToUtc(
    typeof localTimestamp === 'string' ? parseISO(localTimestamp) : localTimestamp,
    BRASIL_TIMEZONE
  );
}

/**
 * Formata uma data para exibição no formato local do Brasil
 */
export function formatLocalDateTime(timestamp: string | Date, formatStr: string = "dd/MM/yyyy HH:mm"): string {
  const localDate = toLocalTime(timestamp);
  return format(localDate, formatStr);
}

/**
 * Formata apenas o horário para exibição no formato local do Brasil
 */
export function formatLocalTime(timestamp: string | Date, formatStr: string = "HH:mm"): string {
  const localDate = toLocalTime(timestamp);
  return format(localDate, formatStr);
}

/**
 * Extrai o horário de um timestamp ISO no fuso horário de Brasília
 */
export function extractLocalTime(timestamp: string): string {
  if (!timestamp) return '';
  
  const localDate = toLocalTime(timestamp);
  return format(localDate, 'HH:mm');
}

/**
 * Cria uma data ISO combinando uma data e um horário no fuso horário de Brasília
 */
export function createUTCDateWithLocalTime(date: string, time: string): string {
  // Combinar data e hora
  const localDateTime = `${date}T${time}:00`;
  
  // Converter para UTC antes de armazenar
  const utcDate = toUTCTime(localDateTime);
  return utcDate.toISOString();
}
