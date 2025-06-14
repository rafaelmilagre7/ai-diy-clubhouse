
import { UserProfile } from '@/lib/supabase';

interface CachedNavigation {
  userProfile: UserProfile;
  roleType: 'admin' | 'formacao' | 'member';
  timestamp: number;
  verified: boolean;
}

class NavigationCache {
  private cache = new Map<string, CachedNavigation>();
  private readonly TTL = 5 * 60 * 1000; // OTIMIZAÇÃO: Aumentado para 5 minutos

  set(userId: string, profile: UserProfile, roleType: 'admin' | 'formacao' | 'member') {
    console.log(`🔧 [NAV-CACHE] Armazenando cache para usuário ${userId.substring(0, 8)}*** como ${roleType}`);
    
    this.cache.set(userId, {
      userProfile: profile,
      roleType,
      timestamp: Date.now(),
      verified: true
    });
  }

  get(userId: string): CachedNavigation | null {
    const cached = this.cache.get(userId);
    
    if (!cached) {
      return null;
    }

    // OTIMIZAÇÃO: Verificar TTL mais flexível para performance
    const isExpired = (Date.now() - cached.timestamp) > this.TTL;
    if (isExpired) {
      console.log(`⏰ [NAV-CACHE] Cache expirado para usuário ${userId.substring(0, 8)}***`);
      this.cache.delete(userId);
      return null;
    }

    console.log(`⚡ [NAV-CACHE] Cache hit para usuário ${userId.substring(0, 8)}*** (${cached.roleType})`);
    return cached;
  }

  isAdminVerified(userId: string): boolean {
    const cached = this.get(userId);
    return cached?.verified && cached.roleType === 'admin';
  }

  isFormacaoVerified(userId: string): boolean {
    const cached = this.get(userId);
    return cached?.verified && cached.roleType === 'formacao';
  }

  // OTIMIZAÇÃO: Método para refresh inteligente do cache
  refresh(userId: string, profile: UserProfile) {
    const cached = this.cache.get(userId);
    if (cached) {
      console.log(`🔄 [NAV-CACHE] Refresh de cache para usuário ${userId.substring(0, 8)}***`);
      this.set(userId, profile, cached.roleType);
    }
  }

  // OTIMIZAÇÃO: Pré-carregamento de cache para performance
  preload(userId: string, profile: UserProfile) {
    if (!this.cache.has(userId)) {
      const roleType = this.determineRoleType(profile);
      this.set(userId, profile, roleType);
      console.log(`🚀 [NAV-CACHE] Cache pré-carregado para usuário ${userId.substring(0, 8)}***`);
    }
  }

  private determineRoleType(profile: UserProfile): 'admin' | 'formacao' | 'member' {
    const roleName = profile.user_roles?.name;
    
    if (roleName === 'admin') return 'admin';
    if (roleName === 'formacao') return 'formacao';
    return 'member';
  }

  clear() {
    console.log("🧹 [NAV-CACHE] Limpando todo o cache de navegação");
    this.cache.clear();
  }

  // OTIMIZAÇÃO: Limpar apenas cache expirado
  cleanExpired() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [userId, cached] of this.cache.entries()) {
      if ((now - cached.timestamp) > this.TTL) {
        this.cache.delete(userId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 [NAV-CACHE] Limpou ${cleanedCount} entradas expiradas`);
    }
  }

  // OTIMIZAÇÃO: Estatísticas do cache para debugging
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      total: entries.length,
      expired: entries.filter(cached => (now - cached.timestamp) > this.TTL).length,
      byRole: {
        admin: entries.filter(cached => cached.roleType === 'admin').length,
        formacao: entries.filter(cached => cached.roleType === 'formacao').length,
        member: entries.filter(cached => cached.roleType === 'member').length
      }
    };
  }
}

export const navigationCache = new NavigationCache();

// OTIMIZAÇÃO: Limpeza automática a cada 10 minutos
setInterval(() => {
  navigationCache.cleanExpired();
}, 10 * 60 * 1000);
