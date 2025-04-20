
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
