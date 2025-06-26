
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';

type EventListener = (state: AuthState) => void;
type TimeoutListener = () => void;

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: EventListener[] = [];
  private timeoutListeners: TimeoutListener[] = [];
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private authSubscription: any = null;
  private initTimeout: NodeJS.Timeout | null = null;

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

    logger.info('[AUTH-MANAGER] 🏗️ Instância criada', { 
      component: 'AuthManager',
      action: 'constructor',
      timestamp: new Date().toISOString()
    });
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Event subscription system
  on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
    if (event === 'stateChanged') {
      this.listeners.push(handler as EventListener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== handler);
      };
    } else if (event === 'timeout') {
      this.timeoutListeners.push(handler as TimeoutListener);
      return () => {
        this.timeoutListeners = this.timeoutListeners.filter(l => l !== handler);
      };
    }
    return () => {};
  }

  private emit(event: AuthEventType, data?: any) {
    if (event === 'stateChanged') {
      this.listeners.forEach(listener => listener(data));
    } else if (event === 'timeout') {
      this.timeoutListeners.forEach(listener => listener());
    }
  }

  getState(): AuthState {
    return { ...this.state };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    // Evitar múltiplas inicializações simultâneas
    if (this.initPromise) {
      logger.info('[AUTH-MANAGER] ⏳ Aguardando inicialização em andamento', {
        component: 'AuthManager',
        action: 'initialize_wait'
      });
      return this.initPromise;
    }

    if (this.initialized) {
      logger.info('[AUTH-MANAGER] ✅ Já inicializado', {
        component: 'AuthManager',
        action: 'initialize_skip'
      });
      return;
    }

    logger.info('[AUTH-MANAGER] 🚀 Iniciando processo de inicialização', {
      component: 'AuthManager',
      action: 'initialize_start'
    });

    this.initPromise = this._performInitialization();
    
    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  private async _performInitialization(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Timeout de segurança de 8 segundos
      this.initTimeout = setTimeout(() => {
        logger.warn('[AUTH-MANAGER] ⏰ TIMEOUT na inicialização após 8s', {
          component: 'AuthManager',
          action: 'initialize_timeout',
          duration: '8000ms'
        });
        
        // Emitir evento de timeout
        this.emit('timeout');
        
        // Forçar reset do loading após timeout
        this.updateState({ isLoading: false, error: 'Timeout na inicialização' });
        
        // Considerar inicializado mesmo com timeout
        this.initialized = true;
        resolve();
      }, 8000);

      // Configurar listener do Supabase Auth
      this.authSubscription = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          logger.info('[AUTH-MANAGER] 📡 Evento de auth recebido', {
            component: 'AuthManager',
            action: 'auth_state_change',
            event,
            hasSession: !!session,
            hasUser: !!session?.user
          });

          try {
            await this.handleAuthStateChange(event, session);
            
            // Primeira inicialização concluída
            if (!this.initialized) {
              this.initialized = true;
              
              if (this.initTimeout) {
                clearTimeout(this.initTimeout);
                this.initTimeout = null;
              }
              
              logger.info('[AUTH-MANAGER] ✅ Inicialização concluída com sucesso', {
                component: 'AuthManager',
                action: 'initialize_complete',
                hasUser: !!this.state.user,
                isAdmin: this.state.isAdmin
              });
              
              resolve();
            }
          } catch (error) {
            logger.error('[AUTH-MANAGER] ❌ Erro no processamento do evento auth', error, {
              component: 'AuthManager',
              action: 'auth_state_change_error',
              event
            });
            
            this.updateState({ 
              isLoading: false, 
              error: `Erro na autenticação: ${(error as Error).message}` 
            });
            
            if (!this.initialized) {
              this.initialized = true;
              reject(error);
            }
          }
        }
      );

      // Trigger inicial para obter estado atual
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão inicial', error, {
            component: 'AuthManager',
            action: 'get_initial_session_error'
          });
        } else {
          logger.info('[AUTH-MANAGER] 📊 Sessão inicial obtida', {
            component: 'AuthManager',
            action: 'get_initial_session',
            hasSession: !!session
          });
        }
      });
    });
  }

  private async handleAuthStateChange(event: AuthChangeEvent, session: Session | null): Promise<void> {
    logger.info('[AUTH-MANAGER] 🔄 Processando mudança de estado', {
      component: 'AuthManager',
      action: 'handle_auth_change',
      event,
      hasSession: !!session
    });

    // SEMPRE resetar loading no início do processamento
    const baseState: Partial<AuthState> = {
      isLoading: false, // CRÍTICO: resetar loading
      session,
      user: session?.user || null,
      error: null
    };

    if (!session?.user) {
      // Usuário deslogado
      this.updateState({
        ...baseState,
        profile: null,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: false,
        hasInviteToken: false,
        inviteDetails: null
      });
      return;
    }

    // Usuário logado - buscar perfil
    try {
      const profile = await this.fetchUserProfile(session.user.id);
      
      if (profile) {
        const isAdmin = profile.user_roles?.name === 'admin';
        const isFormacao = profile.user_roles?.name === 'formacao';
        const onboardingRequired = this.checkOnboardingRequired(profile);

        logger.info('[AUTH-MANAGER] 👤 Perfil carregado com sucesso', {
          component: 'AuthManager',
          action: 'profile_loaded',
          userId: session.user.id,
          roleName: profile.user_roles?.name,
          isAdmin,
          isFormacao,
          onboardingRequired
        });

        this.updateState({
          ...baseState,
          profile,
          isAdmin,
          isFormacao,
          onboardingRequired
        });
      } else {
        // Perfil não encontrado
        logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado para usuário', {
          component: 'AuthManager',
          action: 'profile_not_found',
          userId: session.user.id
        });

        this.updateState({
          ...baseState,
          profile: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: true // Forçar onboarding se não há perfil
        });
      }
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao buscar perfil', error, {
        component: 'AuthManager',
        action: 'fetch_profile_error',
        userId: session.user.id
      });

      this.updateState({
        ...baseState,
        profile: null,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: true,
        error: `Erro ao carregar perfil: ${(error as Error).message}`
      });
    }
  }

  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (
          id,
          name,
          description
        )
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  private checkOnboardingRequired(profile: UserProfile): boolean {
    // Lógica para determinar se onboarding é obrigatório
    return !profile.name || !profile.phone || !profile.birth_date;
  }

  private updateState(updates: Partial<AuthState>) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    logger.info('[AUTH-MANAGER] 📊 Estado atualizado', {
      component: 'AuthManager',
      action: 'state_updated',
      changes: {
        user: oldState.user !== this.state.user,
        profile: oldState.profile !== this.state.profile,
        isLoading: oldState.isLoading !== this.state.isLoading,
        isAdmin: oldState.isAdmin !== this.state.isAdmin,
        onboardingRequired: oldState.onboardingRequired !== this.state.onboardingRequired
      },
      newState: {
        hasUser: !!this.state.user,
        hasProfile: !!this.state.profile,
        isLoading: this.state.isLoading,
        isAdmin: this.state.isAdmin,
        onboardingRequired: this.state.onboardingRequired,
        error: this.state.error
      }
    });

    this.emit('stateChanged', this.state);
  }

  // Métodos de autenticação
  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    logger.info('[AUTH-MANAGER] 🔐 Iniciando login', {
      component: 'AuthManager',
      action: 'sign_in_start',
      email
    });

    this.updateState({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login', error, {
          component: 'AuthManager',
          action: 'sign_in_error',
          email
        });

        this.updateState({ 
          isLoading: false, 
          error: error.message 
        });
        
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado - aguardando evento auth', {
        component: 'AuthManager',
        action: 'sign_in_success',
        email
      });

      // O estado será atualizado via onAuthStateChange
      return { error: null };
    } catch (error) {
      const err = error as Error;
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no login', err, {
        component: 'AuthManager',
        action: 'sign_in_unexpected_error',
        email
      });

      this.updateState({ 
        isLoading: false, 
        error: err.message 
      });
      
      return { error: err };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    logger.info('[AUTH-MANAGER] 🚪 Iniciando logout', {
      component: 'AuthManager',
      action: 'sign_out_start'
    });

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout', error, {
          component: 'AuthManager',
          action: 'sign_out_error'
        });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso', {
        component: 'AuthManager',
        action: 'sign_out_success'
      });

      return { success: true };
    } catch (error) {
      const err = error as Error;
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no logout', err, {
        component: 'AuthManager',
        action: 'sign_out_unexpected_error'
      });
      return { success: false, error: err };
    }
  }

  // Método para determinar redirecionamento
  getRedirectPath(): string {
    const { user, isAdmin, onboardingRequired } = this.state;

    if (!user) {
      return '/login';
    }

    if (onboardingRequired) {
      return '/onboarding';
    }

    if (isAdmin) {
      return '/admin';
    }

    return '/dashboard';
  }

  // Cleanup
  destroy() {
    logger.info('[AUTH-MANAGER] 🔥 Destruindo instância', {
      component: 'AuthManager',
      action: 'destroy'
    });

    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = null;
    }

    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }

    this.listeners = [];
    this.timeoutListeners = [];
    this.initialized = false;
    this.initPromise = null;
  }
}

export default AuthManager;
