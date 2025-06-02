
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
