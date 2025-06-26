
import { User, Session, AuthChangeEvent, AuthError } from '@supabase/supabase-js';
import { supabase, UserProfile, getUserRoleName, isAdminRole } from '@/lib/supabase';
import { AuthState, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { logger } from '@/utils/logger';

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Map<AuthEventType, Set<AuthEventHandler<any>>> = new Map();
  private initializationPromise: Promise<void> | null = null;
  private isInitialized = false;
  private initializationTimeout: NodeJS.Timeout | null = null;
  private authSubscription: any = null;
  private readonly INITIALIZATION_TIMEOUT = 8000; // 8 segundos timeout

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
      inviteDetails: null,
    };

    logger.info({
      component: 'AuthManager',
      action: 'constructor',
      message: 'AuthManager instanciado com estado inicial',
      state: {
        isLoading: this.state.isLoading,
        hasUser: false,
        hasProfile: false
      }
    });
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initializationPromise) {
      logger.info({
        component: 'AuthManager',
        action: 'initialize',
        message: 'Inicialização já em progresso, aguardando...'
      });
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      logger.info({
        component: 'AuthManager',
        action: 'performInitialization',
        message: 'Iniciando processo de inicialização OTIMIZADO',
        timeout: `${this.INITIALIZATION_TIMEOUT}ms`
      });

      // Timeout de segurança DETERMINÍSTICO - sempre resetar loading após timeout
      this.initializationTimeout = setTimeout(() => {
        if (this.state.isLoading) {
          logger.warn({
            component: 'AuthManager',
            action: 'initialization_timeout',
            message: 'TIMEOUT FORÇADO - resetando loading para false',
            timeoutMs: this.INITIALIZATION_TIMEOUT
          });
          
          this.updateState({
            isLoading: false,
            error: 'Timeout na inicialização'
          });
          
          this.emit('timeout');
        }
      }, this.INITIALIZATION_TIMEOUT);

      // Obter sessão atual do Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error({
          component: 'AuthManager',
          action: 'get_session_error',
          message: 'Erro ao obter sessão',
          error: sessionError.message
        });
        throw sessionError;
      }

      logger.info({
        component: 'AuthManager',
        action: 'session_obtained',
        message: 'Sessão obtida do Supabase',
        hasSession: !!session,
        hasUser: !!session?.user
      });

      // Configurar listener de mudanças de auth ANTES de processar sessão
      this.setupAuthListener();

      // Processar sessão inicial
      await this.handleAuthChange('SIGNED_IN', session);

      this.isInitialized = true;
      
      logger.info({
        component: 'AuthManager',
        action: 'initialization_complete',
        message: 'Inicialização concluída com SUCESSO',
        finalState: {
          hasUser: !!this.state.user,
          hasProfile: !!this.state.profile,
          isLoading: this.state.isLoading,
          isAdmin: this.state.isAdmin,
          onboardingRequired: this.state.onboardingRequired
        }
      });

    } catch (error) {
      logger.error({
        component: 'AuthManager',
        action: 'initialization_error',
        message: 'Erro durante inicialização',
        error: error instanceof Error ? error.message : String(error)
      });
      
      // GARANTIR que loading seja resetado mesmo em erro
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na inicialização'
      });

      throw error;
    } finally {
      // Limpar timeout se ainda estiver ativo
      if (this.initializationTimeout) {
        clearTimeout(this.initializationTimeout);
        this.initializationTimeout = null;
      }
    }
  }

  private setupAuthListener(): void {
    if (this.authSubscription) {
      logger.warn({
        component: 'AuthManager',
        action: 'setup_auth_listener',
        message: 'Listener já existe, removendo anterior'
      });
      this.authSubscription.unsubscribe();
    }

    logger.info({
      component: 'AuthManager',
      action: 'setup_auth_listener',
      message: 'Configurando listener de mudanças de auth'
    });

    this.authSubscription = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        logger.info({
          component: 'AuthManager',
          action: 'auth_state_change',
          message: 'Mudança de estado de auth detectada',
          event,
          hasSession: !!session,
          hasUser: !!session?.user
        });

        await this.handleAuthChange(event, session);
      }
    );
  }

  private async handleAuthChange(event: AuthChangeEvent, session: Session | null): Promise<void> {
    try {
      logger.info({
        component: 'AuthManager',
        action: 'handle_auth_change',
        message: 'Processando mudança de auth',
        event,
        hasSession: !!session,
        hasUser: !!session?.user
      });

      if (event === 'SIGNED_OUT' || !session) {
        // Logout - limpar estado
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
          inviteDetails: null,
        });

        logger.info({
          component: 'AuthManager',
          action: 'signed_out',
          message: 'Estado limpo após logout'
        });
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Login ou refresh - atualizar estado
        let profile: UserProfile | null = null;
        let profileError: string | null = null;

        if (session?.user) {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select(`
                *,
                user_roles (
                  id,
                  name,
                  description,
                  permissions,
                  is_system
                )
              `)
              .eq('id', session.user.id)
              .single();

            if (error) {
              logger.error({
                component: 'AuthManager',
                action: 'fetch_profile_error',
                message: 'Erro ao buscar perfil',
                error: error.message,
                userId: session.user.id
              });
              profileError = `Erro ao carregar perfil: ${error.message}`;
            } else {
              profile = profileData;
              logger.info({
                component: 'AuthManager',
                action: 'profile_loaded',
                message: 'Perfil carregado com sucesso',
                hasProfile: !!profile,
                roleName: profile ? getUserRoleName(profile) : 'none',
                onboardingCompleted: profile?.onboarding_completed
              });
            }
          } catch (error) {
            logger.error({
              component: 'AuthManager',
              action: 'fetch_profile_exception',
              message: 'Exceção ao buscar perfil',
              error: error instanceof Error ? error.message : String(error)
            });
            profileError = `Exceção ao carregar perfil: ${error instanceof Error ? error.message : String(error)}`;
          }
        }

        // Calcular dados derivados
        const isAdmin = profile ? isAdminRole(profile) : false;
        const isFormacao = profile ? getUserRoleName(profile) === 'formacao' : false;
        const onboardingRequired = profile ? !profile.onboarding_completed : false;

        // CORREÇÃO: Remover campos que não existem no UserProfile
        logger.info({
          component: 'AuthManager',
          action: 'profile_status',
          message: 'Status do perfil analisado',
          hasProfile: !!profile,
          name: profile?.name || 'Não informado',
          email: profile?.email || 'Não informado',
          onboardingCompleted: profile?.onboarding_completed || false,
          isAdmin,
          isFormacao,
          onboardingRequired
        });

        // Atualizar estado com dados completos
        this.updateState({
          user: session.user,
          session: session,
          profile: profile,
          isLoading: false, // CRÍTICO: sempre resetar loading
          error: profileError,
          isAdmin,
          isFormacao,
          onboardingRequired,
          hasInviteToken: false, // TODO: implementar lógica de convite se necessário
          inviteDetails: null,
        });

        logger.info({
          component: 'AuthManager',
          action: 'auth_change_complete',
          message: 'Mudança de auth processada com SUCESSO',
          finalState: {
            hasUser: !!session.user,
            hasProfile: !!profile,
            isLoading: false,
            isAdmin,
            isFormacao,
            onboardingRequired,
            error: profileError
          }
        });
      }

    } catch (error) {
      logger.error({
        component: 'AuthManager',
        action: 'handle_auth_change_error',
        message: 'Erro ao processar mudança de auth',
        event,
        error: error instanceof Error ? error.message : String(error)
      });

      // CRÍTICO: sempre resetar loading em caso de erro
      this.updateState({
        isLoading: false,
        error: `Erro ao processar autenticação: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info({
        component: 'AuthManager',
        action: 'sign_in_attempt',
        message: 'Tentativa de login',
        email
      });

      // Não alterar isLoading aqui - deixar o listener processar
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        logger.error({
          component: 'AuthManager',
          action: 'sign_in_error',
          message: 'Erro no login',
          error: error.message
        });
        
        this.updateState({
          error: error.message,
          isLoading: false // Resetar loading em caso de erro
        });
        
        return { error };
      }

      logger.info({
        component: 'AuthManager',
        action: 'sign_in_success',
        message: 'Login realizado - aguardando processamento pelo listener'
      });

      // O listener onAuthStateChange processará o login automaticamente
      return {};

    } catch (error) {
      logger.error({
        component: 'AuthManager',
        action: 'sign_in_exception',
        message: 'Exceção durante login',
        error: error instanceof Error ? error.message : String(error)
      });

      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      this.updateState({
        error: errorObj.message,
        isLoading: false
      });

      return { error: errorObj };
    }
  }

  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info({
        component: 'AuthManager',
        action: 'sign_out_attempt',
        message: 'Tentativa de logout'
      });

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error({
          component: 'AuthManager',
          action: 'sign_out_error',
          message: 'Erro no logout',
          error: error.message
        });
        return { success: false, error };
      }

      logger.info({
        component: 'AuthManager',
        action: 'sign_out_success',
        message: 'Logout realizado com sucesso'
      });

      // O listener processará automaticamente o SIGNED_OUT
      return { success: true };

    } catch (error) {
      logger.error({
        component: 'AuthManager',
        action: 'sign_out_exception',
        message: 'Exceção durante logout',
        error: error instanceof Error ? error.message : String(error)
      });

      const errorObj = error instanceof Error ? error : new Error(String(error));
      return { success: false, error: errorObj };
    }
  }

  public getRedirectPath(): string {
    const { user, profile, onboardingRequired, isAdmin } = this.state;

    logger.info({
      component: 'AuthManager',
      action: 'get_redirect_path',
      message: 'Calculando caminho de redirecionamento',
      hasUser: !!user,
      hasProfile: !!profile,
      onboardingRequired,
      isAdmin,
      roleName: profile ? getUserRoleName(profile) : 'none'
    });

    if (!user) {
      logger.info({
        component: 'AuthManager',
        action: 'redirect_to_login',
        message: 'Sem usuário -> /login'
      });
      return '/login';
    }

    if (!profile) {
      logger.info({
        component: 'AuthManager',
        action: 'redirect_loading',
        message: 'Aguardando perfil...'
      });
      return '/'; // Aguardar carregamento do perfil
    }

    if (onboardingRequired) {
      logger.info({
        component: 'AuthManager',
        action: 'redirect_to_onboarding',
        message: 'Onboarding obrigatório -> /onboarding'
      });
      return '/onboarding';
    }

    const roleName = getUserRoleName(profile);
    if (roleName === 'formacao') {
      logger.info({
        component: 'AuthManager',
        action: 'redirect_to_formacao',
        message: 'Usuário formação -> /formacao'
      });
      return '/formacao';
    }

    logger.info({
      component: 'AuthManager',
      action: 'redirect_to_dashboard',
      message: 'Padrão -> /dashboard'
    });
    return '/dashboard';
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public isInitializedFlag(): boolean {
    return this.isInitialized;
  }

  public on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Retornar função de cleanup
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  private emit<T extends AuthEventType>(event: T, ...args: Parameters<AuthEventHandler<T>>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          logger.error({
            component: 'AuthManager',
            action: 'emit_error',
            message: `Erro ao executar handler para evento ${event}`,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });
    }
  }

  private updateState(updates: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };

    logger.info({
      component: 'AuthManager',
      action: 'state_updated',
      message: 'Estado do AuthManager atualizado',
      changes: updates,
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

    // Emitir erro se houver
    if (updates.error && !previousState.error) {
      this.emit('error', new Error(updates.error));
    }
  }

  public cleanup(): void {
    logger.info({
      component: 'AuthManager',
      action: 'cleanup',
      message: 'Limpando recursos do AuthManager'
    });

    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = null;
    }

    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
      this.initializationTimeout = null;
    }

    this.listeners.clear();
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

export default AuthManager;
