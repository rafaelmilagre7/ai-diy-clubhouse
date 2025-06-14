
import { SUPABASE_CONFIG } from '@/config/app';

/**
 * Utilitários para gerenciamento de usuários - LIVRE DE CREDENCIAIS HARDCODED
 */

/**
 * Obtém as iniciais do nome do usuário
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Verifica se uma URL é válida (http ou https)
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Formata a URL do avatar para garantir que seja válida
 * AGORA USA CONFIGURAÇÃO CENTRALIZADA - SEM CREDENCIAIS HARDCODED
 */
export const getAvatarUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  // Se já for uma URL completa, retornar como está
  if (isValidImageUrl(url)) {
    return url;
  }
  
  // Verificar se o Supabase está configurado antes de usar
  if (!SUPABASE_CONFIG.isConfigured()) {
    console.warn('⚠️ Supabase não configurado - não é possível gerar URL do avatar');
    return undefined;
  }
  
  // Se começar com / (caminho relativo), adicionar domínio da API
  if (url.startsWith('/')) {
    return `${SUPABASE_CONFIG.url}${url}`;
  }
  
  // Se for um ID de storage do Supabase
  if (url.includes('storage/v1')) {
    return `${SUPABASE_CONFIG.url}/${url}`;
  }
  
  return url;
};
