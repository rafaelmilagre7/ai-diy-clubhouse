
export const getInitials = (name: string): string => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export const getAvatarUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  
  // Se já é uma URL completa, retornar como está
  if (url.startsWith('http')) {
    return url;
  }
  
  // Se é um caminho relativo, construir URL completa
  return url;
};
