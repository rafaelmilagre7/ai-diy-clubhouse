
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { fetchUserProfile } from '@/contexts/auth/utils';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
}

type AuthEventCallback = (state: AuthState) => void;

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private callbacks: Set<AuthEventCallback> = new Set();
  private initializationPromise: Promise<void> | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private lastInitTime = 0;
  private circuitBreakerOpen = false;
  private circuitBreakerTimeout = 10000; // 10 segundos

  private constructor() {
    this.state = {
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      error: null,
      isAdmin: false,
      isFormacao: false
    };
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Debounce para evitar inicializações múltiplas
  private debounceInitialize = (() => {
    let timeoutId: NodeJS.Timeout;
    return (callback: () => void, delay: number) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  })();

  async initialize(): Promise<void> {
    // Circuit breaker - se estiver aberto, não tentar
    if (this.circuitBreakerOpen) {
      logger.warn('[AUTH-MANAGER] Circuit breaker ativo, pulando inicialização');
      return;
    }

    // Debounce - evitar inicializações muito próximas
    const now = Date.now();
    if (now - this.lastInitTime < 1000) {
      logger.debug('[AUTH-MANAGER] Inicialização muito recente, pulando');
      return;
    }
    this.lastInitTime = now;

    // Se já existe uma inicialização em andamento, retornar a mesma promise
    if (this.initializationPromise) {
      logger.debug('[AUTH-MANAGER] Inicialização já em andamento');
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async performInitialization(): Promise<void> {
    logger.info('[AUTH-MANAGER] Iniciando inicialização', { 
      retry: this.retryCount,
      maxRetries: this.maxRetries 
    });

    try {
      this.updateState({ isLoading: true, error: null });

      // Configurar listener apenas uma vez
      if (this.retryCount === 0) {
        this.setupAuthListener();
      }

      // Buscar sessão atual
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na obtenção da sessão')), 8000)
        )
      ]);

      if (error) {
        throw error;
      }

      await this.handleSessionUpdate(session);
      
      // Reset retry count em caso de sucesso
      this.retryCount = 0;
      this.circuitBreakerOpen = false;
      
      logger.info('[AUTH-MANAGER] Inicialização concluída com sucesso');
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro na inicialização:', error);
      
      this.retryCount++;
      
      if (this.retryCount >= this.maxRetries) {
        // Abrir circuit breaker
        this.circuitBreakerOpen = true;
        setTimeout(() => {
          this.circuitBreakerOpen = false;
          this.retryCount = 0;
        }, this.circuitBreakerTimeout);
        
        this.updateState({
          isLoading: false,
          error: 'Falha na autenticação após várias tentativas. Tente recarregar a página.'
        });
        
        // Marcar para reset de emergência
        localStorage.setItem('emergency_reset_needed', 'true');
      } else {
        // Retry com backoff exponencial
        const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 5000);
        logger.warn(`[AUTH-MANAGER] Tentativa ${this.retryCount}/${this.maxRetries} em ${delay}ms`);
        
        setTimeout(() => {
          this.initialize().catch(() => {
            // Silenciar erros para evitar loops
          });
        }, delay);
      }
    }
  }

  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('[AUTH-MANAGER] Auth state changed:', { event, hasSession: !!session });
      
      if (event === 'SIGNED_OUT') {
        this.updateState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          error: null,
          isAdmin: false,
          isFormacao: false
        });
      } else if (session) {
        await this.handleSessionUpdate(session);
      }
    });
  }

  private async handleSessionUpdate(session: Session | null): Promise<void> {
    this.updateState({ 
      session, 
      user: session?.user ?? null 
    });

    if (session?.user) {
      try {
        // Timeout reduzido para carregar perfil
        const profile = await Promise.race([
          fetchUserProfile(session.user.id),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout no carregamento do perfil')), 5000)
          )
        ]);

        const isAdmin = profile?.user_roles?.name === 'admin';
        const isFormacao = profile?.user_roles?.name === 'formacao';

        this.updateState({
          profile,
          isAdmin,
          isFormacao,
          isLoading: false,
          error: null
        });

      } catch (error) {
        logger.error('[AUTH-MANAGER] Erro ao carregar perfil:', error);
        
        // Modo degradado - permitir acesso mesmo sem perfil completo
        this.updateState({
          profile: null,
          isAdmin: false,
          isFormacao: false,
          isLoading: false,
          error: 'Perfil não carregado completamente, mas login ativo'
        });
      }
    } else {
      this.updateState({ isLoading: false });
    }
  }

  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyCallbacks();
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        logger.error('[AUTH-MANAGER] Erro no callback:', error);
      }
    });
  }

  getState(): AuthState {
    return { ...this.state };
  }

  on(event: 'stateChanged', callback: AuthEventCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  getRedirectPath(): string {
    const { user, profile, isAdmin } = this.state;
    
    if (!user) return '/login';
    if (isAdmin) return '/admin';
    if (!profile?.onboarding_completed) return '/onboarding';
    if (profile?.user_roles?.name === 'formacao') return '/formacao';
    
    return '/dashboard';
  }
}

export default AuthManager;
