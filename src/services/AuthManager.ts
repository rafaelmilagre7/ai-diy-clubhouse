
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents } from '@/types/authTypes';

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState = {
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

  private listeners: Map<keyof AuthManagerEvents, Function[]> = new Map();
  private initialized = false;

  private constructor() {
    this.setupAuthListener();
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private setupAuthListener() {
    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      logger.info('[AUTH-MANAGER] Auth state changed:', { event, hasSession: !!session });
      
      this.updateState({
        session,
        user: session?.user || null,
        isLoading: false
      });

      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          this.loadUserProfile(session.user.id);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        this.updateState({
          profile: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false,
          error: null
        });
      }

      this.emit('stateChanged', this.state);
    });
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info('[AUTH-MANAGER] Inicializando...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] Erro ao obter sessão:', error);
        this.updateState({ error: error.message, isLoading: false });
        return;
      }

      this.updateState({
        session,
        user: session?.user || null,
        isLoading: false
      });

      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }

      this.initialized = true;
      logger.info('[AUTH-MANAGER] Inicialização concluída');
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro na inicialização:', error);
      this.updateState({ 
        error: error instanceof Error ? error.message : 'Erro na inicialização',
        isLoading: false 
      });
    }
  }

  private async loadUserProfile(userId: string) {
    try {
      logger.info('[AUTH-MANAGER] Carregando perfil do usuário:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] Erro ao carregar perfil:', error);
        this.updateState({ error: error.message });
        return;
      }

      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';
      const onboardingRequired = !profile?.onboarding_completed;

      this.updateState({
        profile,
        isAdmin,
        isFormacao,
        onboardingRequired,
        error: null
      });

      logger.info('[AUTH-MANAGER] Perfil carregado:', {
        userId: userId.substring(0, 8) + '***',
        role: profile?.user_roles?.name,
        onboardingRequired
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro ao carregar perfil:', error);
      this.updateState({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar perfil'
      });
    }
  }

  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public getRedirectPath(): string {
    const { user, profile, isAdmin, isFormacao, onboardingRequired } = this.state;

    if (!user) {
      return '/login';
    }

    if (isAdmin) {
      return '/admin';
    }

    if (onboardingRequired) {
      return '/onboarding';
    }

    if (isFormacao) {
      return '/formacao';
    }

    return '/dashboard';
  }

  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      this.updateState({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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

  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      this.updateState({ isLoading: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        this.updateState({ error: error.message, isLoading: false });
        return { success: false, error };
      }

      this.updateState({
        user: null,
        session: null,
        profile: null,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: false,
        error: null,
        isLoading: false
      });

      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      this.updateState({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  }

  public on<T extends keyof AuthManagerEvents>(event: T, handler: AuthManagerEvents[T]): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const handlers = this.listeners.get(event)!;
    handlers.push(handler);

    // Retornar função de cleanup
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  public off<T extends keyof AuthManagerEvents>(event: T, handler: AuthManagerEvents[T]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit<T extends keyof AuthManagerEvents>(event: T, ...args: Parameters<AuthManagerEvents[T]>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          logger.error(`[AUTH-MANAGER] Erro no handler do evento ${event}:`, error);
        }
      });
    }
  }
}

export default AuthManager;
