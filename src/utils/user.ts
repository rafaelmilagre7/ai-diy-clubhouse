
/**
 * Converte um nome completo em iniciais (até 2 letras)
 */
export const getInitials = (name: string): string => {
  if (!name) return '??';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Processa URL do avatar para garantir que seja válida
 */
export const getAvatarUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  
  // Se já for uma URL completa (http:// ou https://), retorna como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Se for uma URL relativa de storage do Supabase
  if (url.startsWith('/storage/')) {
    // Aqui poderia concatenar com a URL base do Supabase se necessário
    return url;
  }
  
  return url;
};
