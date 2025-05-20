
/**
 * Utilitários para gerenciamento de estado de autenticação
 * Ajuda a prevenir estados de "limbo" de autenticação
 */

/**
 * Limpa completamente o estado de autenticação do Supabase
 * Útil antes de fazer login ou logout para evitar conflitos
 */
export const cleanupAuthState = () => {
  try {
    // Remover tokens padrão de autenticação
    localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
    localStorage.removeItem('supabase.auth.token');
    
    // Remover todas as chaves do Supabase do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remover do sessionStorage (se estiver em uso)
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('Estado de autenticação limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar estado de autenticação:', error);
  }
};

/**
 * Verifica se uma URL é válida (http ou https)
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Obtém as iniciais do nome do usuário
 */
export const getInitials = (name: string | null): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Redireciona para o domínio correto após autenticação
 * Mantém a rota atual após redirecionamento
 */
export const redirectToDomain = (path: string = '/dashboard'): void => {
  const currentOrigin = window.location.origin;
  const targetDomain = 'https://app.viverdeia.ai';
  
  // Se já estamos no domínio correto ou em localhost, apenas navegue para o caminho
  if (currentOrigin.includes('localhost') || currentOrigin === targetDomain) {
    console.log(`redirectToDomain: Já estamos no domínio correto, navegando para ${path}`);
    window.location.href = `${currentOrigin}${path}`;
    return;
  }
  
  // Preservar a rota atual no redirecionamento
  console.log(`redirectToDomain: Redirecionando para ${targetDomain}${path}`);
  window.location.href = `${targetDomain}${path}`;
};
