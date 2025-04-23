
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data ISO para exibição no formato brasileiro
 * @param dateString String de data no formato ISO
 * @param options Opções de formatação
 * @returns String formatada de data
 */
export const formatDate = (
  dateString?: string,
  options: { includeTime?: boolean; format?: string } = {}
): string => {
  if (!dateString) return 'Data indisponível';
  
  try {
    const date = new Date(dateString);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    if (options.format) {
      return format(date, options.format, { locale: ptBR });
    }
    
    const formatString = options.includeTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
    return format(date, formatString, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Erro ao formatar data';
  }
};

/**
 * Formata uma data para exibição como "há X tempo"
 * @param dateString String de data no formato ISO
 * @returns String formatada de tempo relativo
 */
export const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return 'Data indisponível';
  
  try {
    const date = new Date(dateString);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR
    });
  } catch (error) {
    console.error('Erro ao formatar tempo relativo:', error);
    return 'Erro ao formatar tempo';
  }
};
