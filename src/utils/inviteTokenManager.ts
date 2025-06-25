
import { extractTokenFromCurrentUrl } from './inviteRouting';

/**
 * MELHORADO: Gerenciador robusto de tokens de convite
 * UMA ÚNICA FONTE DE VERDADE com limpeza consolidada
 */
export class InviteTokenManager {
  private static readonly TOKEN_KEY = 'viver_invite_token';
  private static readonly EXPIRY_KEY = 'viver_invite_token_expiry';
  
  /**
   * Armazenar token com expiração de 1 hora
   */
  static storeToken(token: string): void {
    try {
      const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hora
      
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(InviteTokenManager.TOKEN_KEY, token);
        localStorage.setItem(InviteTokenManager.EXPIRY_KEY, expiryTime.toString());
        console.log('[TOKEN-MANAGER] Token armazenado com segurança');
      }
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao armazenar token:', error);
    }
  }

  /**
   * Recuperar token válido - FONTE ÚNICA MELHORADA
   */
  static getToken(): string | null {
    try {
      // PRIMEIRA prioridade: URL (tanto /convite quanto /invite)
      if (typeof window !== 'undefined') {
        // Usar nova função para extrair token da URL
        const urlToken = extractTokenFromCurrentUrl();
        
        if (urlToken) {
          console.log('[TOKEN-MANAGER] Token encontrado na URL');
          return urlToken;
        }

        // Fallback: parâmetro de query string
        const urlParams = new URLSearchParams(window.location.search);
        const queryToken = urlParams.get('token');
        
        if (queryToken) {
          console.log('[TOKEN-MANAGER] Token encontrado na query string');
          return queryToken;
        }
      }

      // SEGUNDA prioridade: Storage (se válido)
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem(InviteTokenManager.TOKEN_KEY);
        const expiry = localStorage.getItem(InviteTokenManager.EXPIRY_KEY);

        if (!token || !expiry) {
          return null;
        }

        // Verificar se não expirou
        if (Date.now() > parseInt(expiry)) {
          console.log('[TOKEN-MANAGER] Token expirado, limpando automaticamente');
          InviteTokenManager.clearToken();
          return null;
        }

        console.log('[TOKEN-MANAGER] Token válido encontrado no storage');
        return token;
      }

      return null;
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao recuperar token:', error);
      return null;
    }
  }

  /**
   * Verificar se há token disponível
   */
  static hasToken(): boolean {
    return InviteTokenManager.getToken() !== null;
  }

  /**
   * MELHORIA 4: Limpeza consolidada e robusta
   */
  static clearToken(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        localStorage.removeItem(InviteTokenManager.EXPIRY_KEY);
        console.log('[TOKEN-MANAGER] Token limpo completamente');
      }
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao limpar token:', error);
    }
  }

  /**
   * Limpar token após sucesso no registro/login
   */
  static clearTokenOnSuccess(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        sessionStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        console.log('[INVITE-TOKEN-MANAGER] ✅ Token limpo após sucesso');
      }
    } catch (error) {
      console.warn('[INVITE-TOKEN-MANAGER] ⚠️ Erro ao limpar token (success):', error);
    }
  }

  /**
   * Limpar token após erro
   */
  static clearTokenOnError(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        sessionStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        console.log('[INVITE-TOKEN-MANAGER] ❌ Token limpo após erro');
      }
    } catch (error) {
      console.warn('[INVITE-TOKEN-MANAGER] ⚠️ Erro ao limpar token (error):', error);
    }
  }

  /**
   * Limpar token no logout
   */
  static clearTokenOnLogout(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        sessionStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        console.log('[INVITE-TOKEN-MANAGER] 🚪 Token limpo no logout');
      }
    } catch (error) {
      console.warn('[INVITE-TOKEN-MANAGER] ⚠️ Erro ao limpar token (logout):', error);
    }
  }
}
