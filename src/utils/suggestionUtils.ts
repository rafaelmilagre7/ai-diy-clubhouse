
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: ptBR
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'new': 'Nova',
    'under_review': 'Em Análise',
    'in_development': 'Desenvolvimento',
    'completed': 'Implementada',
    'declined': 'Recusada'
  };
  
  return statusLabels[status] || 'Desconhecido';
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'new': 'bg-blue-100 text-blue-800',
    'under_review': 'bg-yellow-100 text-yellow-800',
    'in_development': 'bg-orange-100 text-orange-800',
    'completed': 'bg-green-100 text-green-800',
    'declined': 'bg-red-100 text-red-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getVotePercentage = (upvotes: number, downvotes: number): number => {
  const total = upvotes + downvotes;
  if (total === 0) return 0;
  return Math.round((upvotes / total) * 100);
};

export const getSuggestionPriority = (suggestion: any): 'high' | 'medium' | 'low' => {
  const totalVotes = suggestion.upvotes + suggestion.downvotes;
  const voteRatio = totalVotes > 0 ? suggestion.upvotes / totalVotes : 0;
  
  if (suggestion.is_pinned) return 'high';
  if (totalVotes >= 20 && voteRatio >= 0.7) return 'high';
  if (totalVotes >= 10 && voteRatio >= 0.6) return 'medium';
  
  return 'low';
};
