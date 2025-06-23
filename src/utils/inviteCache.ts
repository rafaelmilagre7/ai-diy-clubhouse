
interface CachedInvite {
  data: any;
  timestamp: number;
  token: string;
}

export class InviteCache {
  private static readonly CACHE_KEY = 'viver-ia-invite-cache';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static set(token: string, data: any): void {
    try {
      const cached: CachedInvite = {
        data,
        timestamp: Date.now(),
        token
      };
      
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(cached));
      console.log('[INVITE-CACHE] Dados do convite armazenados em cache');
    } catch (error) {
      console.error('[INVITE-CACHE] Erro ao armazenar cache:', error);
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

      // Verificar se não expirou
      const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
      if (isExpired) {
        this.clear();
        return null;
      }

      console.log('[INVITE-CACHE] Dados do convite recuperados do cache');
      return cached.data;
    } catch (error) {
      console.error('[INVITE-CACHE] Erro ao recuperar cache:', error);
      this.clear();
      return null;
    }
  }

  static clear(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY);
      console.log('[INVITE-CACHE] Cache limpo');
    } catch (error) {
      console.error('[INVITE-CACHE] Erro ao limpar cache:', error);
    }
  }

  static has(token: string): boolean {
    return this.get(token) !== null;
  }
}
