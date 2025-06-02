
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch (error) {
    return 'Data inválida';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getStatusLabel = (status: string): string => {
  const statusLabels = {
    'new': 'Nova',
    'under_review': 'Em Análise',
    'in_development': 'Em Desenvolvimento',
    'completed': 'Concluída',
    'declined': 'Recusada'
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
};

export const getStatusColor = (status: string): string => {
  const statusColors = {
    'new': '#3b82f6',
    'under_review': '#f59e0b',
    'in_development': '#8b5cf6',
    'completed': '#10b981',
    'declined': '#ef4444'
  };
  
  return statusColors[status as keyof typeof statusColors] || '#6b7280';
};

export const calculateVotePercentage = (upvotes: number, downvotes: number): number => {
  const total = upvotes + downvotes;
  if (total === 0) return 0;
  return Math.round((upvotes / total) * 100);
};
