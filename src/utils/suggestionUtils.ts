
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    });
  } catch {
    return 'Data inválida';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const getVotePercentage = (upvotes: number, downvotes: number): number => {
  const total = upvotes + downvotes;
  return total > 0 ? (upvotes / total) * 100 : 0;
};

export const getNetVotes = (upvotes: number, downvotes: number): number => {
  return upvotes - downvotes;
};

export const getVoteTrend = (upvotes: number, downvotes: number): 'positive' | 'negative' | 'neutral' => {
  const percentage = getVotePercentage(upvotes, downvotes);
  if (percentage >= 70) return 'positive';
  if (percentage <= 30) return 'negative';
  return 'neutral';
};

export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    new: 'Nova',
    under_review: 'Em Análise',
    in_development: 'Em Desenvolvimento',
    completed: 'Concluída',
    declined: 'Rejeitada'
  };
  return statusLabels[status] || 'Nova';
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_development: 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    declined: 'bg-red-100 text-red-800 border-red-200'
  };
  return statusColors[status] || 'bg-blue-100 text-blue-800 border-blue-200';
};
