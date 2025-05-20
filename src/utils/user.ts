
/**
 * Retorna as iniciais de um nome
 * @param name Nome completo
 * @returns Iniciais (máximo 2 caracteres)
 */
export const getInitials = (name?: string): string => {
  if (!name) return 'U';
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Formata uma URL de avatar para exibição
 * @param url URL do avatar (pode ser do Supabase Storage ou URL externa)
 * @returns URL formatada para exibição
 */
export const getAvatarUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  
  // Se já for uma URL completa, retorna como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Se for uma URL do Supabase Storage, constrói a URL completa
  if (url.startsWith('avatars/')) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    return `${supabaseUrl}/storage/v1/object/public/profiles/${url}`;
  }
  
  return url;
};

/**
 * Verifica se o usuário tem o papel de administrador
 * @param role Papel do usuário
 * @returns true se for admin, false caso contrário
 */
export const isAdmin = (role?: string): boolean => {
  return role === 'admin';
};

/**
 * Verifica se o usuário tem o papel de formação
 * @param role Papel do usuário
 * @returns true se for formação, false caso contrário
 */
export const isFormacao = (role?: string): boolean => {
  return role === 'formacao';
};

/**
 * Retorna o nome do papel do usuário formatado para exibição
 * @param role Papel do usuário
 * @returns Nome formatado do papel
 */
export const getRoleName = (role?: string): string => {
  if (!role) return 'Membro';
  
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Administrador';
    case 'formacao':
      return 'Formação';
    case 'member':
      return 'Membro';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
};
