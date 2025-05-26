
export const getInitials = (name: string): string => {
  if (!name || name.trim() === '') {
    return 'U';
  }
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export const formatUserName = (name?: string | null): string => {
  if (!name || name.trim() === '') {
    return 'Usuário';
  }
  return name.trim();
};

export const getUserDisplayRole = (role?: string): string => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'moderator':
      return 'Moderador';
    case 'member':
      return 'Membro';
    default:
      return 'Membro';
  }
};
