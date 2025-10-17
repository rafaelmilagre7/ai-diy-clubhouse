
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'new':
      return 'Nova';
    case 'under_review':
      return 'Em Análise';
    case 'in_development':
      return 'Em Desenvolvimento';
    case 'implemented':
      return 'Implementada';
    case 'rejected':
      return 'Recusada';
    default:
      return 'Desconhecido';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new':
      return 'bg-operational/10 text-operational hover:bg-operational/20';
    case 'under_review':
      return 'bg-strategy/10 text-strategy hover:bg-strategy/20';
    case 'in_development':
      return 'bg-status-warning/10 text-status-warning hover:bg-status-warning/20';
    case 'implemented':
      return 'bg-operational/10 text-operational hover:bg-operational/20';
    case 'rejected':
      return 'bg-status-error/10 text-status-error hover:bg-status-error/20';
    default:
      return 'bg-muted text-foreground hover:bg-muted/80';
  }
};
