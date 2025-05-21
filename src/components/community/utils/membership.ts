
// Função para gerar iniciais a partir do nome
export const getInitials = (name: string): string => {
  if (!name) return 'U';
  
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Função para calcular tempo de membro
export const getMembershipDuration = (createdAt: string): string => {
  const joinDate = new Date(createdAt);
  const now = new Date();
  
  const diffMs = now.getTime() - joinDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} dias`;
  }
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
  }
  
  const diffYears = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;
  
  if (remainingMonths === 0) {
    return `${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`;
  }
  
  return `${diffYears} ${diffYears === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
};

// Função para obter uma cor com base no nome (para Avatares)
export const getColorFromName = (name: string): string => {
  if (!name) return '#6366f1'; // Cor padrão indigo
  
  const colors = [
    '#f43f5e', // rose
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
  ];
  
  // Gerar um índice baseado na soma dos códigos de caractere do nome
  const charCodeSum = name
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  return colors[charCodeSum % colors.length];
};

// Formatar o status de conexão para exibição
export const formatConnectionStatus = (status: string): string => {
  switch (status) {
    case 'connected':
      return 'Conectado';
    case 'pending':
      return 'Solicitação enviada';
    case 'none':
    default:
      return 'Conectar';
  }
};
