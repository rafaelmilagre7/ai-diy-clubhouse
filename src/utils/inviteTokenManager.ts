
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
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
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
        const token = localStorage.getItem(this.TOKEN_KEY);
        const expiry = localStorage.getItem(this.EXPIRY_KEY);

        if (!token || !expiry) {
          return null;
        }

        // Verificar se não expirou
        if (Date.now() > parseInt(expiry)) {
          console.log('[TOKEN-MANAGER] Token expirado, limpando automaticamente');
          this.clearToken();
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
    return this.getToken() !== null;
  }

  /**
   * MELHORIA 4: Limpeza consolidada e robusta
   */
  static clearToken(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.EXPIRY_KEY);
        console.log('[TOKEN-MANAGER] Token limpo completamente');
      }
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao limpar token:', error);
    }
  }

  /**
   * MELHORIA 4: Limpeza específica para sucesso no fluxo
   */
  static clearTokenOnSuccess(): void {
    console.log('[TOKEN-MANAGER] Limpando token após sucesso no fluxo');
    this.clearToken();
  }

  /**
   * MELHORIA 4: Limpeza específica para erro no fluxo
   */
  static clearTokenOnError(): void {
    console.log('[TOKEN-MANAGER] Limpando token após erro no fluxo');
    this.clearToken();
  }

  /**
   * MELHORIA 4: Limpeza específica para logout
   */
  static clearTokenOnLogout(): void {
    console.log('[TOKEN-MANAGER] Limpando token no logout');
    this.clearToken();
  }
}
