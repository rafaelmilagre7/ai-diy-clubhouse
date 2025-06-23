
const INVITE_TOKEN_KEY = 'viver-ia-invite-token';
const TOKEN_EXPIRY_KEY = 'viver-ia-invite-token-expiry';
const TOKEN_EXPIRY_HOURS = 2; // Token válido por 2 horas após armazenamento

export class InviteTokenManager {
  static storeToken(token: string): void {
    try {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + TOKEN_EXPIRY_HOURS);
      
      sessionStorage.setItem(INVITE_TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toISOString());
      
      console.log('[INVITE-TOKEN] Token armazenado para preservação durante registro');
    } catch (error) {
      console.error('[INVITE-TOKEN] Erro ao armazenar token:', error);
    }
  }
  
  static getStoredToken(): string | null {
    try {
      const token = sessionStorage.getItem(INVITE_TOKEN_KEY);
      const expiryStr = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!token || !expiryStr) {
        return null;
      }
      
      const expiry = new Date(expiryStr);
      const now = new Date();
      
      if (now > expiry) {
        console.log('[INVITE-TOKEN] Token expirado, removendo');
        this.clearToken();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('[INVITE-TOKEN] Erro ao recuperar token:', error);
      return null;
    }
  }
  
  static clearToken(): void {
    try {
      sessionStorage.removeItem(INVITE_TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
      console.log('[INVITE-TOKEN] Token removido da sessão');
    } catch (error) {
      console.error('[INVITE-TOKEN] Erro ao limpar token:', error);
    }
  }
  
  static hasStoredToken(): boolean {
    return this.getStoredToken() !== null;
  }
}
