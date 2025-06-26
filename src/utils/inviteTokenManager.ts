
import { extractTokenFromCurrentUrl } from './inviteRouting';

/**
 * FASE 1 OTIMIZADO: Gerenciador robusto de tokens de convite
 * Melhorado para suportar o novo fluxo de interceptação
 */
export class InviteTokenManager {
  private static readonly TOKEN_KEY = 'viver_invite_token';
  private static readonly EXPIRY_KEY = 'viver_invite_token_expiry';
  private static readonly METADATA_KEY = 'viver_invite_metadata';
  
  /**
   * Armazenar token com expiração e metadados
   */
  static storeToken(token: string, metadata?: any): void {
    try {
      const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hora
      
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(InviteTokenManager.TOKEN_KEY, token);
        localStorage.setItem(InviteTokenManager.EXPIRY_KEY, expiryTime.toString());
        
        if (metadata) {
          localStorage.setItem(InviteTokenManager.METADATA_KEY, JSON.stringify(metadata));
        }
        
        console.log('[TOKEN-MANAGER] Token armazenado com metadados:', {
          token: token.substring(0, 8) + '***',
          hasMetadata: !!metadata,
          expiryTime: new Date(expiryTime).toISOString()
        });
      }
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao armazenar token:', error);
    }
  }

  /**
   * Recuperar token válido - OTIMIZADO PARA FASE 1
   */
  static getToken(): string | null {
    try {
      // PRIMEIRA prioridade: URL (tanto /convite quanto /invite)
      if (typeof window !== 'undefined') {
        const urlToken = extractTokenFromCurrentUrl();
        
        if (urlToken) {
          console.log('[TOKEN-MANAGER] Token encontrado na URL (Fase 1)');
          return urlToken;
        }

        // Fallback: parâmetro de query string
        const urlParams = new URLSearchParams(window.location.search);
        const queryToken = urlParams.get('token');
        
        if (queryToken) {
          console.log('[TOKEN-MANAGER] Token encontrado na query string (Fase 1)');
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
          console.log('[TOKEN-MANAGER] Token expirado, limpando automaticamente (Fase 1)');
          InviteTokenManager.clearToken();
          return null;
        }

        console.log('[TOKEN-MANAGER] Token válido encontrado no storage (Fase 1)');
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
   * Recuperar metadados do convite
   */
  static getMetadata(): any | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const metadata = localStorage.getItem(InviteTokenManager.METADATA_KEY);
        return metadata ? JSON.parse(metadata) : null;
      }
      return null;
    } catch (error) {
      console.error('[TOKEN-MANAGER] Erro ao recuperar metadados:', error);
      return null;
    }
  }

  /**
   * Limpeza consolidada e robusta
   */
  static clearToken(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        localStorage.removeItem(InviteTokenManager.EXPIRY_KEY);
        localStorage.removeItem(InviteTokenManager.METADATA_KEY);
        console.log('[TOKEN-MANAGER] Token e metadados limpos completamente (Fase 1)');
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
        localStorage.removeItem(InviteTokenManager.EXPIRY_KEY);
        localStorage.removeItem(InviteTokenManager.METADATA_KEY);
        sessionStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        console.log('[TOKEN-MANAGER] ✅ Token limpo após sucesso (Fase 1)');
      }
    } catch (error) {
      console.warn('[TOKEN-MANAGER] ⚠️ Erro ao limpar token (success):', error);
    }
  }

  /**
   * Limpar token após erro
   */
  static clearTokenOnError(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        localStorage.removeItem(InviteTokenManager.EXPIRY_KEY);
        localStorage.removeItem(InviteTokenManager.METADATA_KEY);
        sessionStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        console.log('[TOKEN-MANAGER] ❌ Token limpo após erro (Fase 1)');
      }
    } catch (error) {
      console.warn('[TOKEN-MANAGER] ⚠️ Erro ao limpar token (error):', error);
    }
  }

  /**
   * Limpar token no logout
   */
  static clearTokenOnLogout(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        localStorage.removeItem(InviteTokenManager.EXPIRY_KEY);
        localStorage.removeItem(InviteTokenManager.METADATA_KEY);
        sessionStorage.removeItem(InviteTokenManager.TOKEN_KEY);
        console.log('[TOKEN-MANAGER] 🚪 Token limpo no logout (Fase 1)');
      }
    } catch (error) {
      console.warn('[TOKEN-MANAGER] ⚠️ Erro ao limpar token (logout):', error);
    }
  }

  /**
   * NOVO: Validar se token está em contexto válido
   */
  static isInValidContext(): boolean {
    if (typeof window === 'undefined') return false;
    
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Contextos válidos para token de convite
    return (
      pathname.includes('/convite/') ||
      pathname.includes('/invite/') ||
      pathname.includes('/onboarding') ||
      pathname.includes('/login') ||
      searchParams.get('invite') === 'true'
    );
  }
}
