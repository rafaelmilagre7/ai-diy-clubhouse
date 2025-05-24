
export function getInitials(name?: string | null): string {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function getAvatarUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  
  // Se já é uma URL completa, retornar como está
  if (url.startsWith('http')) {
    return url;
  }
  
  // Se é um caminho relativo, construir URL completa
  return url;
}
