
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    // Se for menos de 24 horas, mostrar tempo relativo
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ptBR 
      });
    }
    
    // Se for mais de 24 horas, mostrar data formatada
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return 'Data inválida';
  }
};

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
      return status;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new':
      return '#3b82f6'; // blue-500
    case 'under_review':
      return '#f59e0b'; // amber-500
    case 'in_development':
      return '#8b5cf6'; // violet-500
    case 'completed':
      return '#10b981'; // emerald-500
    case 'declined':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Encontrar o último espaço antes do limite para não cortar palavras
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};
