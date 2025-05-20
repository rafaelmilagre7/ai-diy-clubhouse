
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data no padrão brasileiro
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dateString;
  }
};

/**
 * Formata uma data como tempo relativo (ex: "há 3 horas")
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar tempo relativo:", error);
    return dateString;
  }
};

/**
 * Gera iniciais a partir de um nome
 */
export const getInitials = (name: string | null): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Formata número grande para exibição (ex: 1000 -> 1K)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Determina se um usuário pode marcar um tópico como resolvido
 */
export const canMarkTopicAsSolved = (
  userId: string | undefined, 
  topicAuthorId: string, 
  isAdmin: boolean
): boolean => {
  if (!userId) return false;
  return userId === topicAuthorId || isAdmin;
};

/**
 * Trunca texto longo com elipses
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
