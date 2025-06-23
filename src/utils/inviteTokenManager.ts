
/**
 * Gerenciador simples de tokens de convite
 * UMA ÚNICA FONTE DE VERDADE
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
        console.log('[TOKEN-MANAGER] Token armazenado');
      }
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao armazenar token:', error);
    }
  }

  /**
   * Recuperar token válido - FONTE ÚNICA
   */
  static getToken(): string | null {
    try {
      // PRIMEIRA prioridade: URL
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        if (urlToken) {
          console.log('[TOKEN-MANAGER] Token encontrado na URL');
          return urlToken;
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
          console.log('[TOKEN-MANAGER] Token expirado, removendo');
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
   * Limpar token armazenado
   */
  static clearToken(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.EXPIRY_KEY);
        console.log('[TOKEN-MANAGER] Token limpo');
      }
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao limpar token:', error);
    }
  }
}
