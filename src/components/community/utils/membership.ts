
export const getInitials = (name: string): string => {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export const getAvatarUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  // Se já é uma URL completa, retorna como está
  if (url.startsWith('http')) {
    return url;
  }
  
  // Se é um caminho do Supabase storage, constrói a URL completa
  if (url.startsWith('avatars/') || url.startsWith('/avatars/')) {
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
  }
  
  return url;
};
