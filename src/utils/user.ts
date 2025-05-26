
export const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatUserName = (name?: string | null): string => {
  return name || 'Usuário';
};
