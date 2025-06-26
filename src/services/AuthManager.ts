
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { UserProfile, getUserRoleName } from '@/lib/supabase/types';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

class AuthManager {
  private static instance: AuthManager | null = null;
  private state: AuthState;
  private listeners: Map<AuthEventType, Set<Function>> = new Map();
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

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

    logger.info({
      message: 'AuthManager instance criada',
      component: 'AuthManager',
      action: 'constructor',
      state: {
        isLoading: this.state.isLoading,
        hasUser: !!this.state.user,
        hasProfile: !!this.state.profile
      }
    });
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // CORRIGIDO: Método público para verificar inicialização
  public isInitialized(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    // Se já está inicializando, retornar a Promise existente
    if (this.initializationPromise) {
      logger.info({
        message: 'AuthManager já está inicializando, aguardando...',
        component: 'AuthManager',
        action: 'initialize_await'
      });
      return this.initializationPromise;
    }

    // Se já foi inicializado, não fazer nada
    if (this.initialized) {
      logger.info({
        message: 'AuthManager já inicializado',
        component: 'AuthManager',
        action: 'initialize_skip'
      });
      return;
    }

    // Criar Promise de inicialização com timeout DETERMINÍSTICO
    this.initializationPromise = new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        logger.warn({
          message: 'TIMEOUT na inicialização do AuthManager após 8s',
          component: 'AuthManager',
          action: 'initialize_timeout',
          timeout: '8000ms'
        });
        
        // FORÇAR reset do loading em caso de timeout
        this.updateState({ isLoading: false, error: 'Timeout na autenticação' });
        this.emit('timeout');
        
        reject(new Error('AuthManager initialization timeout'));
      }, 8000); // 8 segundos - timeout determinístico

      try {
        logger.info({
          message: 'Iniciando AuthManager (timeout em 8s)',
          component: 'AuthManager',
          action: 'initialize_start',
          timeoutMs: 8000
        });

        // Configurar listener ANTES de buscar sessão
        this.setupAuthListener();
        
        // Buscar sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error({
            message: 'Erro ao buscar sessão inicial',
            component: 'AuthManager',
            action: 'get_session_error',
            error: error.message
          });
          throw error;
        }

        logger.info({
          message: 'Sessão inicial obtida',
          component: 'AuthManager',
          action: 'session_obtained',
          hasSession: !!session,
          hasUser: !!session?.user
        });

        // Processar sessão inicial
        await this.processAuthState('INITIAL_SESSION', session);
        
        this.initialized = true;
        clearTimeout(timeoutId);
        
        logger.info({
          message: 'AuthManager inicializado com sucesso',
          component: 'AuthManager',
          action: 'initialize_success',
          finalState: {
            hasUser: !!this.state.user,
            hasProfile: !!this.state.profile,
            isLoading: this.state.isLoading,
            isAdmin: this.state.isAdmin,
            onboardingRequired: this.state.onboardingRequired
          }
        });
        
        resolve();
      } catch (error) {
        clearTimeout(timeoutId);
        logger.error({
          message: 'Erro na inicialização do AuthManager',
          component: 'AuthManager',
          action: 'initialize_error',
          error: (error as Error).message
        });
        
        // GARANTIR que loading seja resetado em caso de erro
        this.updateState({ 
          isLoading: false, 
          error: (error as Error).message 
        });
        
        reject(error);
      }
    });

    return this.initializationPromise;
  }

  private setupAuthListener(): void {
    logger.info({
      message: 'Configurando listener de autenticação',
      component: 'AuthManager',
      action: 'setup_auth_listener'
    });

    supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info({
        message: 'Evento de autenticação recebido',
        component: 'AuthManager',
        action: 'auth_state_change',
        event,
        hasSession: !!session,
        hasUser: !!session?.user
      });

      // Processar mudança de estado
      await this.processAuthState(event, session);
    });
  }

  private async processAuthState(event: any, session: any): Promise<void> {
    try {
      logger.info({
        message: 'Processando mudança de estado de autenticação',
        component: 'AuthManager',
        action: 'process_auth_state',
        event,
        hasSession: !!session,
        hasUser: !!session?.user
      });

      if (session?.user) {
        // Usuário logado - buscar perfil
        await this.loadUserProfile(session.user.id);
        
        // Atualizar estado com usuário e sessão
        this.updateState({
          user: session.user,
          session: session,
          isLoading: false, // CRÍTICO: Reset loading após login
          error: null
        });
      } else {
        // Usuário não logado - resetar estado
        logger.info({
          message: 'Usuário não logado - resetando estado',
          component: 'AuthManager',
          action: 'reset_state'
        });
        
        this.updateState({
          user: null,
          session: null,
          profile: null,
          isLoading: false, // CRÍTICO: Reset loading
          error: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false
        });
      }
    } catch (error) {
      logger.error({
        message: 'Erro ao processar estado de autenticação',
        component: 'AuthManager',
        action: 'process_auth_state_error',
        event,
        error: (error as Error).message
      });
      
      // GARANTIR que loading seja resetado mesmo em erro
      this.updateState({
        isLoading: false,
        error: (error as Error).message
      });
    }
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      logger.info({
        message: 'Carregando perfil do usuário',
        component: 'AuthManager',
        action: 'load_user_profile'
      });

      const { data: profile, error } = await supabase
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
        logger.error({
          message: 'Erro ao buscar perfil do usuário',
          component: 'AuthManager',
          action: 'load_profile_error',
          error: error.message,
          userId: userId.substring(0, 8) + '***'
        });
        throw error;
      }

      logger.info({
        message: 'Perfil do usuário carregado',
        component: 'AuthManager',
        action: 'profile_loaded',
        hasProfile: !!profile,
        roleName: profile?.user_roles?.name || 'none',
        onboardingCompleted: !!profile?.onboarding_completed
      });

      if (profile) {
        // Determinar permissões e onboarding
        const roleName = getUserRoleName(profile);
        const isAdmin = roleName === 'admin';
        const isFormacao = roleName === 'formacao';
        const onboardingRequired = !profile.onboarding_completed;

        logger.error({
          message: 'Erro ao determinar permissões',
          component: 'AuthManager',
          action: 'determine_permissions_error',
          error: 'Fallback error message'
        });

        // Atualizar estado com perfil e permissões
        this.updateState({
          profile: profile as UserProfile,
          isAdmin,
          isFormacao,
          onboardingRequired,
          error: null
        });

        logger.info({
          message: 'Estado atualizado com perfil e permissões',
          component: 'AuthManager',
          action: 'state_updated_with_profile',
          hasProfile: !!profile,
          name: profile.name || 'N/A',
          email: profile.email || 'N/A',
          onboardingCompleted: !!profile.onboarding_completed,
          isAdmin,
          isFormacao,
          onboardingRequired
        });
      } else {
        // Profile não encontrado - criar um básico ou marcar como necessário onboarding
        logger.info({
          message: 'Perfil não encontrado - onboarding necessário',
          component: 'AuthManager',
          action: 'profile_not_found'
        });
        
        this.updateState({
          profile: null,
          onboardingRequired: true,
          isAdmin: false,
          isFormacao: false
        });
      }

      logger.info({
        message: 'Processamento de perfil concluído',
        component: 'AuthManager',
        action: 'profile_processing_complete',
        finalState: {
          hasUser: !!this.state.user,
          hasProfile: !!this.state.profile,
          isLoading: this.state.isLoading,
          isAdmin: this.state.isAdmin,
          isFormacao: this.state.isFormacao,
          onboardingRequired: this.state.onboardingRequired,
          error: this.state.error || 'none'
        }
      });

    } catch (error) {
      logger.error({
        message: 'Erro ao processar perfil do usuário',
        component: 'AuthManager',
        action: 'load_profile_error',
        event: 'profile_processing',
        error: (error as Error).message
      });
      
      // Em caso de erro, assumir que precisa de onboarding
      this.updateState({
        profile: null,
        onboardingRequired: true,
        isAdmin: false,
        isFormacao: false,
        error: (error as Error).message
      });
    }
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info({
        message: 'Tentativa de login',
        component: 'AuthManager',
        action: 'sign_in_attempt',
        email: email.substring(0, 3) + '***'
      });

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error({
          message: 'Erro no login',
          component: 'AuthManager',
          action: 'sign_in_error',
          error: error.message
        });
        return { error };
      }

      // O login será processado pelo listener onAuthStateChange
      // NÃO atualizar estado aqui para evitar race conditions
      
      logger.info({
        message: 'Login iniciado - aguardando processamento via listener',
        component: 'AuthManager',
        action: 'sign_in_initiated'
      });

      return { error: null };
    } catch (error) {
      logger.error({
        message: 'Erro inesperado no login',
        component: 'AuthManager',
        action: 'sign_in_unexpected_error',
        error: (error as Error).message
      });
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info({
        message: 'Tentativa de logout',
        component: 'AuthManager',
        action: 'sign_out_attempt'
      });

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error({
          message: 'Erro no logout',
          component: 'AuthManager',
          action: 'sign_out_error',
          error: error.message
        });
        return { success: false, error };
      }

      // O logout será processado pelo listener onAuthStateChange
      logger.info({
        message: 'Logout realizado com sucesso',
        component: 'AuthManager',
        action: 'sign_out_success'
      });
      
      return { success: true };
    } catch (error) {
      logger.error({
        message: 'Erro inesperado no logout',
        component: 'AuthManager',
        action: 'sign_out_unexpected_error',
        error: (error as Error).message
      });
      return { success: false, error: error as Error };
    }
  }

  getRedirectPath(): string {
    logger.info({
      message: 'Determinando caminho de redirecionamento',
      component: 'AuthManager',
      action: 'get_redirect_path',
      hasUser: !!this.state.user,
      hasProfile: !!this.state.profile,
      onboardingRequired: this.state.onboardingRequired,
      isAdmin: this.state.isAdmin,
      roleName: this.state.profile?.user_roles?.name || 'none'
    });

    // Sem usuário = login
    if (!this.state.user) {
      logger.info({
        message: 'Redirecionando para login - sem usuário',
        component: 'AuthManager',
        action: 'redirect_login'
      });
      return '/login';
    }

    // Onboarding obrigatório
    if (this.state.onboardingRequired) {
      logger.info({
        message: 'Redirecionando para onboarding',
        component: 'AuthManager',
        action: 'redirect_onboarding'
      });
      return '/onboarding';
    }

    // Admin
    if (this.state.isAdmin) {
      logger.info({
        message: 'Redirecionando para admin',
        component: 'AuthManager',
        action: 'redirect_admin'
      });
      return '/admin';
    }

    // Formação
    if (this.state.isFormacao) {
      logger.info({
        message: 'Redirecionando para formação',
        component: 'AuthManager',
        action: 'redirect_formacao'
      });
      return '/formacao';
    }

    // Padrão = dashboard
    logger.info({
      message: 'Redirecionando para dashboard',
      component: 'AuthManager',
      action: 'redirect_dashboard'
    });
    return '/dashboard';
  }

  getState(): AuthState {
    return { ...this.state };
  }

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
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          (handler as any)(...args);
        } catch (error) {
          logger.error({
            message: 'Erro ao executar handler de evento',
            component: 'AuthManager',
            action: 'emit_handler_error',
            error: (error as Error).message
          });
        }
      });
    }
  }

  private updateState(changes: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...changes };
    
    logger.info({
      message: 'Estado do AuthManager atualizado',
      component: 'AuthManager',
      action: 'state_updated',
      changes,
      newState: {
        hasUser: !!this.state.user,
        hasProfile: !!this.state.profile,
        isLoading: this.state.isLoading,
        isAdmin: this.state.isAdmin,
        onboardingRequired: this.state.onboardingRequired,
        error: this.state.error || 'none'
      }
    });
    
    // Emitir evento de mudança de estado
    this.emit('stateChanged', this.state);
  }

  // Método de debug para logs estruturados
  getDebugInfo(): any {
    logger.info({
      message: 'Informações de debug do AuthManager',
      component: 'AuthManager',
      action: 'debug_info'
    });
    
    return {
      initialized: this.initialized,
      state: this.state,
      listenerCount: Array.from(this.listeners.entries()).map(([event, handlers]) => ({
        event,
        count: handlers.size
      }))
    };
  }
}

export default AuthManager;
