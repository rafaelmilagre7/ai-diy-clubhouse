
/**
 * Utilitário para manipulação de dados de usuário
 */

/**
 * Obtém as iniciais do nome do usuário
 * @param name Nome do usuário
 * @returns Iniciais do nome ou placeholder
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "U";
  
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Obtém o caminho para a imagem de avatar do usuário ou um placeholder
 * @param url URL do avatar
 * @returns URL do avatar ou undefined
 */
export const getAvatarUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  // Se a URL já começar com http(s), retorná-la diretamente
  if (url.startsWith('http')) {
    return url;
  }
  
  // Se for um caminho relativo no Supabase Storage
  if (url.startsWith('/')) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    return `${supabaseUrl}/storage/v1/object/public${url}`;
  }
  
  return url;
};
