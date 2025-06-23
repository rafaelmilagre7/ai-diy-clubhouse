
/**
 * Cache DIRETO para dados de convite
 * Operações simples: sucesso = retorna dados, erro = retorna null
 */
interface CachedInvite {
  data: any;
  token: string;
}

export class InviteCache {
  private static readonly CACHE_KEY = 'viver-ia-invite-cache';

  static set(token: string, data: any): void {
    if (!token || !data) return;
    
    try {
      const cached: CachedInvite = { data, token };
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(cached));
      console.log('[INVITE-CACHE] Dados armazenados');
    } catch (error) {
      // Falha = operação silenciosa, sem poluir logs
      console.warn('[INVITE-CACHE] Falha ao armazenar');
    }
  }

  static get(token: string): any | null {
    if (!token) return null;
    
    try {
      const cachedStr = sessionStorage.getItem(this.CACHE_KEY);
      if (!cachedStr) return null;

      const cached: CachedInvite = JSON.parse(cachedStr);
      
      // Token não confere = limpar e retornar null
      if (cached.token !== token) {
        this.clear();
        return null;
      }

      console.log('[INVITE-CACHE] Dados recuperados');
      return cached.data;
    } catch (error) {
      // Erro = limpar cache e retornar null
      this.clear();
      return null;
    }
  }

  static clear(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      // Falha silenciosa
    }
  }

  static has(token: string): boolean {
    return this.get(token) !== null;
  }
}
