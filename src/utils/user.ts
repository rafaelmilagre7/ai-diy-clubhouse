
/**
 * Funções utilitárias para manipulação de dados de usuários
 */

/**
 * Obtém as iniciais do nome do usuário
 */
export function getInitials(name?: string | null): string {
  if (!name) return 'U';
  
  // Obtém as iniciais do nome completo
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Formata a URL do avatar para garantir que tenha o formato correto
 */
export function getAvatarUrl(avatarUrl?: string | null): string | undefined {
  if (!avatarUrl) return undefined;
  
  // Se a URL já começa com http ou https, retorne-a diretamente
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // Se é uma URL relativa ao storage do Supabase, garanta que começa com /
  if (!avatarUrl.startsWith('/')) {
    avatarUrl = '/' + avatarUrl;
  }
  
  // Retorna a URL formatada
  return `https://zotzvtepvpnkcoobdubt.supabase.co/storage/v1/object/public${avatarUrl}`;
}
