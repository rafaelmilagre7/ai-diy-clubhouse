
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

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'new': '#6B7280', // gray
    'under_review': '#F59E0B', // amber
    'in_development': '#3B82F6', // blue
    'completed': '#10B981', // emerald
    'declined': '#EF4444' // red
  };
  
  return statusColors[status] || statusColors['new'];
};

export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'new': 'Nova',
    'under_review': 'Em Análise',
    'in_development': 'Em Desenvolvimento',
    'completed': 'Concluída',
    'declined': 'Recusada'
  };
  
  return statusLabels[status] || 'Desconhecido';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const calculateEngagementLevel = (upvotes: number, downvotes: number, commentCount: number): 'low' | 'medium' | 'high' => {
  const totalVotes = upvotes + downvotes;
  const engagementScore = totalVotes + (commentCount * 2); // Comentários valem mais
  
  if (engagementScore >= 20) return 'high';
  if (engagementScore >= 5) return 'medium';
  return 'low';
};

export const generateShareUrl = (suggestionId: string): string => {
  return `${window.location.origin}/suggestions/${suggestionId}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    return false;
  }
};
