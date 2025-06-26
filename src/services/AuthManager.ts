
import { supabase } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase/types';
import { logger } from '@/utils/logger';
import { AuthState, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Map<AuthEventType, Set<AuthEventHandler<any>>> = new Map();
  private initializationPromise: Promise<void> | null = null;
  private initialized = false;

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

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // NOVO: Método getRedirectPath
  public getRedirectPath(): string {
    const { user, profile, onboardingRequired } = this.state;
    
    logger.info('[AUTH-MANAGER] 🔀 Calculando caminho de redirecionamento', {
      component: 'AuthManager',
      action: 'get_redirect_path',
      hasUser: !!user,
      hasProfile: !!profile,
      onboardingRequired,
      roleName: profile?.user_roles?.name
    });

    // Sem usuário = login
    if (!user) {
      return '/login';
    }

    // OnboardingRequired = onboarding
    if (onboardingRequired) {
      return '/onboarding';
    }

    // Formação = área específica
    if (profile?.user_roles?.name === 'formacao') {
      return '/formacao';
    }

    // Padrão = dashboard
    return '/dashboard';
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager', {
        component: 'AuthManager',
        action: 'initialize'
      });

      this.updateState({ isLoading: true, error: null });

      // Verificar token de convite
      const inviteToken = InviteTokenManager.getToken();
      if (inviteToken) {
        this.updateState({ 
          hasInviteToken: true,
          inviteDetails: null // Será carregado pelo useInviteFlow se necessário
        });
      }

      // Obter sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão', sessionError);
        throw sessionError;
      }

      if (session?.user) {
        await this.handleUserSession(session.user, session);
      } else {
        logger.info('[AUTH-MANAGER] ℹ️ Nenhuma sessão ativa encontrada');
        this.updateState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false
        });
      }

      // Configurar listener de mudanças de auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Mudança de estado de auth', { event });
        
        if (event === 'SIGNED_IN' && session?.user) {
          await this.handleUserSession(session.user, session);
        } else if (event === 'SIGNED_OUT') {
          this.handleSignOut();
        }
      });

      this.initialized = true;
      logger.info('[AUTH-MANAGER] ✅ AuthManager inicializado com sucesso');

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', error);
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro na inicialização'
      });
      throw error;
    }
  }

  private async handleUserSession(user: User, session: Session): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 👤 Carregando sessão do usuário', {
        userId: user.id,
        email: user.email
      });

      // Carregar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            description,
            is_system
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil', profileError);
      }

      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';
      
      // Verificar se onboarding é necessário
      const onboardingRequired = !profile || 
        !profile.name || 
        !profile.company_name || 
        !profile.industry;

      this.updateState({
        user,
        session,
        profile: profile || null,
        isLoading: false,
        error: null,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

      logger.info('[AUTH-MANAGER] ✅ Sessão do usuário carregada', {
        hasProfile: !!profile,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao processar sessão', error);
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar usuário'
      });
    }
  }

  private handleSignOut(): void {
    logger.info('[AUTH-MANAGER] 🚪 Processando sign out');
    
    // Limpar token de convite
    InviteTokenManager.clearToken();
    
    this.updateState({
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
  }

  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔐 Tentativa de login');
      this.updateState({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login', error);
        this.updateState({ isLoading: false, error: error.message });
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso');
      return {};

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no login', error);
      this.updateState({ isLoading: false, error: errorMessage });
      return { error: error as Error };
    }
  }

  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🚪 Iniciando logout');
      this.updateState({ isLoading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout', error);
        this.updateState({ isLoading: false, error: error.message });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso');
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no logout';
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no logout', error);
      this.updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: error as Error };
    }
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(handler);
    
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
  }

  private emit<T extends AuthEventType>(event: T, ...args: Parameters<AuthEventHandler<T>>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          logger.error(`[AUTH-MANAGER] ❌ Erro no handler do evento ${event}`, error);
        }
      });
    }
  }
}

export default AuthManager;
