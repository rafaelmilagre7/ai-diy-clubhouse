
/**
 * Obtém as iniciais de um nome (até 2 caracteres)
 */
export const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Formata a URL de um avatar, se necessário
 */
export const getAvatarUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  
  // Se a URL já for absoluta, retorna ela mesma
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Se for um caminho relativo ao storage do Supabase
  if (url.startsWith('/')) {
    // Você pode ajustar isso com base na configuração do seu projeto Supabase
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars${url}`;
  }
  
  return url;
};
