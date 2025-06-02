
import { CheckCircle, Clock, Play, AlertCircle, XCircle } from 'lucide-react';

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
      return 'Desconhecido';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
    case 'under_review':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100/80';
    case 'in_development':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100/80';
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-100/80';
    case 'declined':
      return 'bg-red-100 text-red-800 hover:bg-red-100/80';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'new':
      return AlertCircle;
    case 'under_review':
      return Clock;
    case 'in_development':
      return Play;
    case 'completed':
      return CheckCircle;
    case 'declined':
      return XCircle;
    default:
      return AlertCircle;
  }
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hoje';
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }
};

export const calculatePopularity = (upvotes: number, downvotes: number): number => {
  const total = upvotes + downvotes;
  if (total === 0) return 0;
  return Math.round((upvotes / total) * 100);
};

export const getStatusPriority = (status: string): number => {
  switch (status) {
    case 'completed':
      return 4;
    case 'in_development':
      return 3;
    case 'under_review':
      return 2;
    case 'new':
      return 1;
    case 'declined':
      return 0;
    default:
      return -1;
  }
};
