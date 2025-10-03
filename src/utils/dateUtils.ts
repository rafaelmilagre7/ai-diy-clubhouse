import { formatInTimeZone } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

/**
 * Formats a date string to Brazilian format (DD/MM/YYYY)
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

/**
 * Formata mês/ano em UTC para evitar deslocamentos de fuso (ex.: 'set/25')
 */
export const formatMonthUTC = (dateInput: string | Date) => {
  if (!dateInput) return ''
  return formatInTimeZone(dateInput, 'UTC', 'MMM/yy', { locale: ptBR })
}

