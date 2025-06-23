
/**
 * Cache simples para dados de convite
 * SEM COMPLEXIDADES DE EXPIRAÇÃO
 */
interface CachedInvite {
  data: any;
  token: string;
}

export class InviteCache {
  private static readonly CACHE_KEY = 'viver-ia-invite-cache';

  static set(token: string, data: any): void {
    try {
      const cached: CachedInvite = { data, token };
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(cached));
      console.log('[INVITE-CACHE] Dados armazenados');
    } catch (error) {
      console.error('[INVITE-CACHE] Erro ao armazenar:', error);
    }
  }

  static get(token: string): any | null {
    try {
      const cachedStr = sessionStorage.getItem(this.CACHE_KEY);
      if (!cachedStr) return null;

      const cached: CachedInvite = JSON.parse(cachedStr);
      
      // Verificar se é o token correto
      if (cached.token !== token) {
        this.clear();
        return null;
      }

      console.log('[INVITE-CACHE] Dados recuperados');
      return cached.data;
    } catch (error) {
      console.error('[INVITE-CACHE] Erro ao recuperar:', error);
      this.clear();
      return null;
    }
  }

  static clear(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY);
      console.log('[INVITE-CACHE] Cache limpo');
    } catch (error) {
      console.error('[INVITE-CACHE] Erro ao limpar:', error);
    }
  }

  static has(token: string): boolean {
    return this.get(token) !== null;
  }
}
