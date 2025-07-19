
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { authCache } from './authCache';

interface FetchStrategy {
  name: string;
  timeout: number;
  execute: (userId: string) => Promise<UserProfile | null>;
}

class ProfileFetcher {
  private activeRequests = new Map<string, Promise<UserProfile | null>>();

  async fetchProfile(userId: string): Promise<UserProfile | null> {
    // 1. Verificar cache primeiro (0ms)
    const cached = authCache.get(userId);
    if (cached) {
      console.log('✅ [PROFILE-FETCH] Cache hit');
      return cached;
    }

    // 2. Verificar se já existe request ativo (evitar duplicatas)
    if (this.activeRequests.has(userId)) {
      console.log('⏳ [PROFILE-FETCH] Aguardando request ativo');
      return this.activeRequests.get(userId)!;
    }

    // 3. Executar estratégias com fallback
    const fetchPromise = this.executeStrategies(userId);
    this.activeRequests.set(userId, fetchPromise);

    try {
      const result = await fetchPromise;
      
      // Cache apenas se encontrou perfil válido
      if (result) {
        authCache.set(userId, result);
      }
      
      return result;
    } finally {
      this.activeRequests.delete(userId);
    }
  }

  private async executeStrategies(userId: string): Promise<UserProfile | null> {
    const strategies: FetchStrategy[] = [
      {
        name: 'optimized_function',
        timeout: 8000,
        execute: this.fetchViaOptimizedFunction.bind(this)
      },
      {
        name: 'simple_query',
        timeout: 3000,
        execute: this.fetchViaSimpleQuery.bind(this)
      }
    ];

    for (const strategy of strategies) {
      try {
        console.log(`🔄 [PROFILE-FETCH] Tentando estratégia: ${strategy.name}`);
        
        const result = await this.withTimeout(
          strategy.execute(userId),
          strategy.timeout
        );
        
        if (result) {
          console.log(`✅ [PROFILE-FETCH] Sucesso com: ${strategy.name}`);
          return result;
        }
        
      } catch (error) {
        console.warn(`⚠️ [PROFILE-FETCH] Falha em ${strategy.name}:`, error);
        continue;
      }
    }

    console.error('❌ [PROFILE-FETCH] Todas as estratégias falharam');
    return null;
  }

  private async fetchViaOptimizedFunction(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.rpc('get_user_profile_optimized', {
      target_user_id: userId
    });
    
    if (error) throw error;
    return data;
  }

  private async fetchViaSimpleQuery(userId: string): Promise<UserProfile | null> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    if (!profile) return null;

    // Buscar role separadamente se necessário
    if (profile.role_id) {
      const { data: role } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', profile.role_id)
        .single();
      
      if (role) {
        return { ...profile, user_roles: role };
      }
    }

    return profile;
  }

  private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout após ${timeout}ms`)), timeout)
      )
    ]);
  }

  clearCache(): void {
    authCache.clear();
    this.activeRequests.clear();
  }
}

export const profileFetcher = new ProfileFetcher();
