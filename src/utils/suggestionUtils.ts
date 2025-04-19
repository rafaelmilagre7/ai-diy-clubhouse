
export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'new':
      return 'Novo';
    case 'under_review':
      return 'Em Análise';
    case 'approved':
      return 'Aprovado';
    case 'in_development':
      return 'Em Desenvolvimento';
    case 'implemented':
      return 'Implementado';
    case 'rejected':
      return 'Rejeitado';
    default:
      return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'in_development':
      return 'bg-purple-100 text-purple-800';
    case 'implemented':
      return 'bg-emerald-100 text-emerald-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
