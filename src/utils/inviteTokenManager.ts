
/**
 * Gerenciador de tokens de convite com localStorage como fallback
 * Prioriza localStorage para persistência entre sessões
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
      
      // Priorizar localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
        console.log('[TOKEN-MANAGER] Token armazenado no localStorage');
      } else if (typeof window !== 'undefined' && window.sessionStorage) {
        // Fallback para sessionStorage
        sessionStorage.setItem(this.TOKEN_KEY, token);
        sessionStorage.setItem(this.EXPIRY_KEY, expiryTime.toString());
        console.log('[TOKEN-MANAGER] Token armazenado no sessionStorage (fallback)');
      }
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao armazenar token:', error);
    }
  }

  /**
   * Recuperar token válido
   */
  static getStoredToken(): string | null {
    try {
      // Verificar localStorage primeiro
      let token = null;
      let expiry = null;

      if (typeof window !== 'undefined' && window.localStorage) {
        token = localStorage.getItem(this.TOKEN_KEY);
        expiry = localStorage.getItem(this.EXPIRY_KEY);
      } else if (typeof window !== 'undefined' && window.sessionStorage) {
        token = sessionStorage.getItem(this.TOKEN_KEY);
        expiry = sessionStorage.getItem(this.EXPIRY_KEY);
      }

      if (!token || !expiry) {
        return null;
      }

      // Verificar se não expirou
      if (Date.now() > parseInt(expiry)) {
        console.log('[TOKEN-MANAGER] Token expirado, removendo');
        this.clearToken();
        return null;
      }

      console.log('[TOKEN-MANAGER] Token válido encontrado');
      return token;
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao recuperar token:', error);
      return null;
    }
  }

  /**
   * Verificar se há token armazenado
   */
  static hasStoredToken(): boolean {
    return this.getStoredToken() !== null;
  }

  /**
   * Limpar token armazenado
   */
  static clearToken(): void {
    try {
      if (typeof window !== 'undefined') {
        // Limpar de ambos os storages
        if (window.localStorage) {
          localStorage.removeItem(this.TOKEN_KEY);
          localStorage.removeItem(this.EXPIRY_KEY);
        }
        if (window.sessionStorage) {
          sessionStorage.removeItem(this.TOKEN_KEY);
          sessionStorage.removeItem(this.EXPIRY_KEY);
        }
        console.log('[TOKEN-MANAGER] Token limpo');
      }
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao limpar token:', error);
    }
  }

  /**
   * Obter token da URL ou do storage
   */
  static getToken(): string | null {
    // Primeiro, tentar obter da URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        console.log('[TOKEN-MANAGER] Token encontrado na URL');
        return urlToken;
      }
    }

    // Se não há na URL, tentar do storage
    return this.getStoredToken();
  }
}
