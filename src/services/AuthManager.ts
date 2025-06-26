import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

class AuthManager {
  private static instance: AuthManager | null = null;
  public isInitialized: boolean = false;
  private state: AuthState;
  private listeners: Map<AuthEventType, Set<Function>> = new Map();

  constructor() {
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

  getState(): AuthState {
    return { ...this.state };
  }

  private setState(newState: Partial<AuthState>) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    logger.info('[AUTH-MANAGER] Estado atualizado', {
      component: 'AuthManager',
      action: 'state_updated',
      changes: Object.keys(newState),
      hasUser: !!this.state.user,
      isLoading: this.state.isLoading,
      error: this.state.error
    });

    this.emit('stateChanged', this.state);
  }

  private handleError(error: unknown, context: string): AuthState {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error(`[AUTH-MANAGER] Erro em ${context}:`, error, {
      component: 'AuthManager',
      action: 'error_handled',
      context,
      errorMessage
    });

    // CORREÇÃO: Sempre retornar um AuthState válido com o erro
    return {
      ...this.state,
      isLoading: false,
      error: errorMessage
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('[AUTH-MANAGER] Já inicializado - ignorando');
      return;
    }

    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager');
      
      this.setState({ isLoading: true, error: null });

      // Setup auth listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info(`[AUTH-MANAGER] 📡 Auth event: ${event}`, {
          component: 'AuthManager',
          action: 'auth_event',
          event,
          hasSession: !!session,
          hasUser: !!session?.user
        });

        try {
          await this.handleAuthChange(event, session);
        } catch (error) {
          // CORREÇÃO: Usar handleError para garantir estado válido
          const errorState = this.handleError(error, 'auth_change');
          this.setState(errorState);
        }
      });

      // Get initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        // CORREÇÃO: Usar handleError para garantir estado válido
        const errorState = this.handleError(sessionError, 'get_session');
        this.setState(errorState);
        return;
      }

      if (session?.user) {
        await this.handleAuthChange('SIGNED_IN', session);
      } else {
        this.setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false
        });
      }

      this.isInitialized = true;
      logger.info('[AUTH-MANAGER] ✅ Inicialização concluída');

    } catch (error) {
      // CORREÇÃO: Usar handleError para garantir estado válido
      const errorState = this.handleError(error, 'initialize');
      this.setState(errorState);
      this.isInitialized = true; // Marcar como inicializado mesmo com erro
    }
  }

  private async handleAuthChange(event: string, session: Session | null): Promise<void> {
    try {
      if (event === 'SIGNED_OUT' || !session?.user) {
        this.setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          error: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false,
          hasInviteToken: false,
          inviteDetails: null
        });
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        this.setState({
          user: session.user,
          session,
          isLoading: true,
          error: null
        });

        // Fetch profile
        const profile = await this.fetchUserProfile(session.user.id);
        
        if (profile) {
          const isAdmin = profile.user_roles?.name === 'admin';
          const isFormacao = profile.user_roles?.name === 'formacao';
          
          // Check onboarding
          const onboardingRequired = this.checkOnboardingRequired(profile);
          
          // Check invite token
          const hasInviteToken = InviteTokenManager.hasToken();

          this.setState({
            profile,
            isAdmin,
            isFormacao,
            onboardingRequired,
            hasInviteToken,
            inviteDetails: null, // Simplificado - sem método inexistente
            isLoading: false
          });
        } else {
          this.setState({
            profile: null,
            isAdmin: false,
            isFormacao: false,
            onboardingRequired: true,
            isLoading: false
          });
        }
      }
    } catch (error) {
      // CORREÇÃO: Usar handleError para garantir estado válido
      const errorState = this.handleError(error, 'handleAuthChange');
      this.setState(errorState);
    }
  }

  private async fetchUserProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles:user_roles!inner(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] Erro ao buscar perfil:', error);
        return null;
      }

      return profile;
    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro inesperado ao buscar perfil:', error);
      return null;
    }
  }

  private checkOnboardingRequired(profile: any): boolean {
    if (!profile) return true;
    
    const requiredFields = ['name', 'whatsapp', 'company_name'];
    return requiredFields.some(field => !profile[field]);
  }

  getRedirectPath(): string {
    const { user, profile, isAdmin, onboardingRequired } = this.state;
    
    if (!user) return '/login';
    if (!profile) return '/onboarding';
    if (isAdmin) return '/admin';
    if (onboardingRequired) return '/onboarding';
    if (profile.user_roles?.name === 'formacao') return '/formacao';
    return '/dashboard';
  }

  async signIn(email: string, password: string) {
    try {
      this.setState({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        const errorState = this.handleError(error, 'signIn');
        this.setState(errorState);
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorState = this.handleError(error, 'signIn');
      this.setState(errorState);
      return { error: error as Error };
    }
  }

  async signOut() {
    try {
      this.setState({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        const errorState = this.handleError(error, 'signOut');
        this.setState(errorState);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      const errorState = this.handleError(error, 'signOut');
      this.setState(errorState);
      return { success: false, error: error as Error };
    }
  }

  // Event system
  on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const eventListeners = this.listeners.get(event)!;
    eventListeners.add(handler as Function);
    
    return () => {
      eventListeners.delete(handler as Function);
    };
  }

  private emit<T extends AuthEventType>(event: T, ...args: Parameters<AuthEventHandler<T>>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(handler => {
        try {
          (handler as Function)(...args);
        } catch (error) {
          logger.error(`[AUTH-MANAGER] Erro no listener ${event}:`, error);
        }
      });
    }
  }
}

export default AuthManager;
