
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'new':
      return 'Nova';
    case 'under_review':
      return 'Em Análise';
    case 'in_development':
      return 'Em Desenvolvimento';
    case 'completed':
      return 'Implementada';
    case 'declined':
      return 'Recusada';
    default:
      return 'Nova';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_development':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'declined':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatRelativeDate = (dateString: string): string => {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  } catch (error) {
    return 'Data inválida';
  }
};

export const calculatePopularity = (upvotes: number, downvotes: number): number => {
  const total = upvotes + downvotes;
  if (total === 0) return 0;
  return Math.round((upvotes / total) * 100);
};

export const getSuggestionPriority = (upvotes: number, downvotes: number, createdAt: string): 'high' | 'medium' | 'low' => {
  const popularity = calculatePopularity(upvotes, downvotes);
  const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  if (popularity > 80 && upvotes > 5) return 'high';
  if (popularity > 60 || (upvotes > 3 && daysSinceCreated < 7)) return 'medium';
  return 'low';
};
