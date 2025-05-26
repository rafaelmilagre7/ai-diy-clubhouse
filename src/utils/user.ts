
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getUserDisplayRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'admin': 'Administrador',
    'member': 'Membro',
    'formacao': 'Formação',
    'moderator': 'Moderador'
  };
  
  return roleMap[role] || 'Membro';
};

export const formatUserName = (name: string | null | undefined): string => {
  if (!name) return 'Usuário';
  return name;
};
