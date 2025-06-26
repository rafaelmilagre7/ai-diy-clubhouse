
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Map<AuthEventType, Set<AuthEventHandler<any>>> = new Map();
  private _isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager com cliente centralizado', {
      component: 'AuthManager',
      action: 'constructor'
    });

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

    // Log diagnóstico da configuração
    this.logSupabaseConfig();
  }

  private logSupabaseConfig() {
    try {
      // Verificar se o cliente Supabase centralizado está disponível
      if (!supabase) {
        logger.error('[AUTH-MANAGER] ❌ Cliente Supabase centralizado não disponível', {
          component: 'AuthManager',
          action: 'config_check',
          hasSupabaseClient: false
        });
        return;
      }

      logger.info('[AUTH-MANAGER] ✅ Cliente Supabase centralizado carregado com sucesso', {
        component: 'AuthManager',
        action: 'config_check',
        hasSupabaseClient: true,
        supabaseUrl: supabase.supabaseUrl ? 'disponível' : 'indisponível',
        supabaseKey: supabase.supabaseKey ? 'disponível' : 'indisponível'
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao verificar configuração Supabase', {
        component: 'AuthManager',
        action: 'config_check_error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  public async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🔄 Inicializando autenticação', {
        component: 'AuthManager',
        action: 'initialize_start'
      });

      // Verificar cliente Supabase antes de prosseguir
      if (!supabase) {
        throw new Error('Cliente Supabase não disponível - configuração inválida');
      }

      this.setState({ isLoading: true, error: null });

      // Configurar listener de mudanças de auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Mudança de estado de auth', {
          component: 'AuthManager',
          action: 'auth_state_change',
          event,
          hasSession: !!session,
          hasUser: !!session?.user
        });

        await this.handleAuthStateChange(event, session);
      });

      // Obter sessão inicial
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Erro ao obter sessão: ${error.message}`);
      }

      logger.info('[AUTH-MANAGER] 📋 Sessão inicial obtida', {
        component: 'AuthManager',
        action: 'get_initial_session',
        hasSession: !!session,
        hasUser: !!session?.user
      });

      await this.handleAuthStateChange('INITIAL_SESSION', session);

      this._isInitialized = true;
      
      logger.info('[AUTH-MANAGER] ✅ Inicialização concluída com sucesso', {
        component: 'AuthManager',
        action: 'initialize_complete',
        hasUser: !!this.state.user,
        isAdmin: this.state.isAdmin
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na inicialização';
      
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', {
        component: 'AuthManager',
        action: 'initialize_error',
        error: errorMessage
      });

      this.setState({ 
        isLoading: false, 
        error: errorMessage 
      });

      this.emit('error', new Error(errorMessage));
      throw error;
    }
  }

  private async handleAuthStateChange(event: string, session: Session | null): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🔄 Processando mudança de estado', {
        component: 'AuthManager',
        action: 'handle_auth_state_change',
        event,
        hasSession: !!session
      });

      if (session?.user) {
        await this.loadUserProfile(session.user);
        this.setState({
          user: session.user,
          session,
          isLoading: false,
          error: null
        });
      } else {
        this.setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          error: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false
        });
      }

      this.emit('stateChanged', this.state);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar mudança de estado';
      
      logger.error('[AUTH-MANAGER] ❌ Erro ao processar mudança de estado', {
        component: 'AuthManager',
        action: 'handle_auth_state_change_error',
        error: errorMessage
      });

      this.setState({ 
        isLoading: false, 
        error: errorMessage 
      });
      
      this.emit('error', new Error(errorMessage));
    }
  }

  private async loadUserProfile(user: User): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 👤 Carregando perfil do usuário', {
        component: 'AuthManager',
        action: 'load_user_profile',
        userId: user.id
      });

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            description,
            permissions
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado, criando...', {
            component: 'AuthManager',
            action: 'profile_not_found',
            userId: user.id
          });
          await this.createUserProfile(user);
          return;
        }
        throw error;
      }

      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';
      const onboardingRequired = !profile?.onboarding_completed;

      logger.info('[AUTH-MANAGER] ✅ Perfil carregado com sucesso', {
        component: 'AuthManager',
        action: 'profile_loaded',
        userId: user.id,
        hasProfile: !!profile,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

      this.setState({
        profile,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar perfil';
      
      logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil', {
        component: 'AuthManager',
        action: 'load_profile_error',
        error: errorMessage,
        userId: user.id
      });

      throw new Error(errorMessage);
    }
  }

  private async createUserProfile(user: User): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🆕 Criando perfil de usuário', {
        component: 'AuthManager',
        action: 'create_user_profile',
        userId: user.id
      });

      // Buscar role padrão
      const { data: defaultRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'member')
        .single();

      const profileData = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        role_id: defaultRole?.id,
        onboarding_completed: false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .insert(profileData);

      if (error) {
        throw error;
      }

      logger.info('[AUTH-MANAGER] ✅ Perfil criado com sucesso', {
        component: 'AuthManager',
        action: 'profile_created',
        userId: user.id
      });

      // Recarregar perfil após criação
      await this.loadUserProfile(user);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar perfil';
      
      logger.error('[AUTH-MANAGER] ❌ Erro ao criar perfil', {
        component: 'AuthManager',
        action: 'create_profile_error',
        error: errorMessage,
        userId: user.id
      });

      throw new Error(errorMessage);
    }
  }

  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔐 Tentativa de login', {
        component: 'AuthManager',
        action: 'sign_in_attempt',
        email
      });

      this.setState({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login', {
          component: 'AuthManager',
          action: 'sign_in_error',
          error: error.message
        });

        this.setState({ isLoading: false, error: error.message });
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso', {
        component: 'AuthManager',
        action: 'sign_in_success',
        email
      });

      return { error: null };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no login', {
        component: 'AuthManager',
        action: 'sign_in_unexpected_error',
        error: errorMessage
      });

      this.setState({ isLoading: false, error: errorMessage });
      return { error: new Error(errorMessage) };
    }
  }

  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🚪 Fazendo logout', {
        component: 'AuthManager',
        action: 'sign_out_attempt'
      });

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout', {
          component: 'AuthManager',
          action: 'sign_out_error',
          error: error.message
        });

        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso', {
        component: 'AuthManager',
        action: 'sign_out_success'
      });

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no logout';
      
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no logout', {
        component: 'AuthManager',
        action: 'sign_out_unexpected_error',
        error: errorMessage
      });

      return { success: false, error: new Error(errorMessage) };
    }
  }

  public getRedirectPath(): string {
    if (!this.state.user) {
      return '/login';
    }

    if (this.state.onboardingRequired) {
      return '/onboarding';
    }

    if (this.state.profile?.user_roles?.name === 'formacao') {
      return '/formacao';
    }

    return '/dashboard';
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
  }

  public on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(handler);
    
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  private emit<T extends AuthEventType>(event: T, data: Parameters<AuthEventHandler<T>>[0]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error('[AUTH-MANAGER] ❌ Erro no handler de evento', {
            component: 'AuthManager',
            action: 'emit_handler_error',
            event,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      });
    }
  }
}

export default AuthManager;
