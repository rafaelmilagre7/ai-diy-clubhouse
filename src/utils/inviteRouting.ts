
/**
 * Utilitários para roteamento de convites
 * Padroniza detecção e geração de URLs de convite
 */

/**
 * Detecta se a URL atual é uma rota de convite
 */
export const isInviteRoute = (): boolean => {
  const pathname = window.location.pathname;
  return pathname.includes('/convite/') || pathname.includes('/invite/');
};

/**
 * Extrai o token da URL atual (tanto /convite quanto /invite)
 */
export const extractTokenFromCurrentUrl = (): string | null => {
  const pathname = window.location.pathname;
  
  // Suporta tanto /convite/TOKEN quanto /invite/TOKEN
  const conviteMatch = pathname.match(/\/convite\/([^\/]+)/);
  const inviteMatch = pathname.match(/\/invite\/([^\/]+)/);
  
  return conviteMatch?.[1] || inviteMatch?.[1] || null;
};

/**
 * Gera URL padrão para convites (usando /convite)
 */
export const generateInviteUrl = (token: string, baseUrl?: string): string => {
  const base = baseUrl || window.location.origin;
  return `${base}/convite/${token}`;
};

/**
 * Valida se um token tem formato válido
 */
export const isValidInviteToken = (token: string): boolean => {
  return typeof token === 'string' && token.length >= 10;
};
