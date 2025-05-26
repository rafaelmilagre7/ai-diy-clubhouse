
export const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const formatUserName = (name?: string | null): string => {
  if (!name) return 'Usuário';
  return name;
};

export const getAvatarUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  return url;
};
