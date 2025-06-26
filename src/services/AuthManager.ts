
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

class AuthManager {
  private static instance: AuthManager | null = null;
  private state: AuthState;
  private listeners: Map<AuthEventType, Set<AuthEventHandler<any>>> = new Map();
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private timeoutId: number | null = null;

  private constructor() {
    this.state = {
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      error: null,
      isAdmin: false,
      isFormacao: false,
      onboardingRequired: false,
      hasInviteToken: false,
      inviteDetails: null
    };
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Event system
  on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  private emit<T extends AuthEventType>(event: T, ...args: Parameters<AuthEventHandler<T>>): void {
    this.listeners.get(event)?.forEach(handler => {
      try {
        (handler as any)(...args);
      } catch (error) {
        logger.error(`[AUTH-MANAGER] Erro no listener ${event}:`, error);
      }
    });
  }

  // Estado público
  getState(): AuthState {
    return { ...this.state };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Inicialização DETERMINÍSTICA
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    logger.info('[AUTH-MANAGER] 🚀 Iniciando inicialização DETERMINÍSTICA');
    
    // TIMEOUT ÚNICO: 5 segundos
    this.timeoutId = window.setTimeout(() => {
      if (!this.initialized) {
        logger.warn('[AUTH-MANAGER] ⏰ TIMEOUT 5s - forçando inicialização');
        this.handleTimeout();
      }
    }, 5000);

    try {
      // 1. Configurar listener PRIMEIRO
      supabase.auth.onAuthStateChange(this.handleAuthStateChange.bind(this));
      
      // 2. Verificar sessão existente
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Erro na sessão: ${error.message}`);
      }

      // 3. Processar sessão inicial
      await this.processSession(session);
      
      // 4. Verificar token de convite
      this.checkInviteToken();
      
      this.finializeInitialization();
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização:', error);
      this.updateState({
        error: error instanceof Error ? error.message : 'Erro de inicialização',
        isLoading: false
      });
      this.emit('error', error as Error);
      this.finializeInitialization();
    }
  }

  private async handleAuthStateChange(event: string, session: Session | null): Promise<void> {
    logger.info('[AUTH-MANAGER] 🔄 Auth state changed:', { event, hasSession: !!session });
    
    if (event === 'SIGNED_IN' && session) {
      // Defer processing to avoid deadlocks
      setTimeout(() => {
        this.processSession(session);
      }, 0);
    } else if (event === 'SIGNED_OUT') {
      this.handleSignOut();
    } else {
      this.updateState({
        session,
        user: session?.user || null
      });
    }
  }

  private async processSession(session: Session | null): Promise<void> {
    this.updateState({
      session,
      user: session?.user || null
    });

    if (session?.user) {
      try {
        const profile = await this.fetchUserProfile(session.user.id);
        
        this.updateState({
          profile,
          isAdmin: profile?.user_roles?.name === 'admin',
          isFormacao: profile?.user_roles?.name === 'formacao'
        });

        // Verificar onboarding apenas para não-admins
        if (profile?.user_roles?.name !== 'admin') {
          const onboardingRequired = profile?.onboarding_completed !== true;
          this.updateState({ onboardingRequired });
        } else {
          this.updateState({ onboardingRequired: false });
        }

      } catch (error) {
        logger.error('[AUTH-MANAGER] Erro ao processar perfil:', error);
        this.updateState({
          error: 'Erro ao carregar perfil do usuário'
        });
      }
    }
  }

  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (*)
      `)
      .eq('id', userId as any)
      .single();

    if (error) {
      logger.error('[AUTH-MANAGER] Erro ao buscar perfil:', error);
      return null;
    }

    return data as any as UserProfile;
  }

  private checkInviteToken(): void {
    const hasToken = InviteTokenManager.hasToken();
    this.updateState({
      hasInviteToken: hasToken,
      inviteDetails: hasToken ? InviteTokenManager.getToken() : null
    });
  }

  private handleSignOut(): void {
    this.updateState({
      user: null,
      session: null,
      profile: null,
      isAdmin: false,
      isFormacao: false,
      onboardingRequired: false,
      hasInviteToken: false,
      inviteDetails: null,
      error: null
    });
  }

  private handleTimeout(): void {
    logger.warn('[AUTH-MANAGER] ⏰ Timeout atingido - assumindo estado básico');
    
    this.updateState({
      isLoading: false,
      error: 'Timeout na inicialização (5s)'
    });
    
    this.emit('timeout');
    this.finializeInitialization();
  }

  private finializeInitialization(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    this.initialized = true;
    this.updateState({ isLoading: false });
    
    logger.info('[AUTH-MANAGER] ✅ Inicialização CONCLUÍDA:', {
      hasUser: !!this.state.user,
      isAdmin: this.state.isAdmin,
      onboardingRequired: this.state.onboardingRequired,
      hasInviteToken: this.state.hasInviteToken
    });
  }

  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
  }

  // Métodos públicos de auth
  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      this.updateState({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (error) {
        this.updateState({ error: error.message, isLoading: false });
        return { error };
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      this.updateState({ error: error.message, isLoading: false });
      return { error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      this.updateState({ isLoading: true });
      
      // Limpar token de convite
      InviteTokenManager.clearTokenOnLogout();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        this.updateState({ error: error.message, isLoading: false });
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      return { success: false, error };
    }
  }

  // Helpers para casos específicos
  shouldRedirectToOnboarding(currentPath: string): boolean {
    return this.state.onboardingRequired && 
           currentPath !== '/onboarding' && 
           !this.state.isAdmin;
  }

  shouldRedirectToLogin(): boolean {
    return !this.state.user && !this.state.isLoading;
  }

  getRedirectPath(): string {
    if (this.shouldRedirectToLogin()) return '/login';
    if (this.shouldRedirectToOnboarding(window.location.pathname)) return '/onboarding';
    if (this.state.isAdmin) return '/admin';
    if (this.state.isFormacao) return '/formacao';
    return '/dashboard';
  }
}

export default AuthManager;
