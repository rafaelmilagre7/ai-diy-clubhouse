
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Map<AuthEventType, Set<AuthEventHandler<any>>> = new Map();
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private authSubscription: any = null;
  private initializationTimeout: number | null = null;

  private constructor() {
    this.state = {
      user: null,
      session: null,
      profile: null,
      isLoading: true, // Inicia em loading
      error: null,
      isAdmin: false,
      isFormacao: false,
      onboardingRequired: false,
      hasInviteToken: false,
      inviteDetails: null
    };

    logger.info('[AUTH-MANAGER] 🏗️ Singleton criado');
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // CORRIGIDO: Método para obter estado atual (síncrono)
  getState(): AuthState {
    return { ...this.state };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // CORRIGIDO: Inicialização determinística com timeout absoluto
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('[AUTH-MANAGER] ✅ Já inicializado');
      return;
    }

    if (this.initializationPromise) {
      logger.info('[AUTH-MANAGER] 🔄 Aguardando inicialização em andamento');
      return this.initializationPromise;
    }

    logger.info('[AUTH-MANAGER] 🚀 Iniciando inicialização DETERMINÍSTICA');

    this.initializationPromise = this.performInitialization();
    
    // TIMEOUT ABSOLUTO: 8 segundos máximo
    this.initializationTimeout = window.setTimeout(() => {
      if (!this.initialized) {
        logger.error('[AUTH-MANAGER] 🚨 TIMEOUT ABSOLUTO - forçando inicialização');
        this.forceCompleteInitialization();
        this.emit('timeout');
      }
    }, 8000);

    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      // ETAPA 1: Configurar listener de auth PRIMEIRO
      logger.info('[AUTH-MANAGER] 🔗 Configurando listener de auth');
      this.setupAuthListener();

      // ETAPA 2: Verificar sessão existente
      logger.info('[AUTH-MANAGER] 🔍 Verificando sessão existente');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao buscar sessão:', error);
        this.updateState({ 
          error: error.message, 
          isLoading: false // CRÍTICO: Resetar loading em caso de erro
        });
        return;
      }

      // ETAPA 3: Processar sessão encontrada
      await this.processSession(session);

      // ETAPA 4: Marcar como inicializado
      this.initialized = true;
      this.clearInitializationTimeout();
      
      logger.info('[AUTH-MANAGER] ✅ Inicialização COMPLETA', {
        hasUser: !!this.state.user,
        hasProfile: !!this.state.profile,
        isAdmin: this.state.isAdmin,
        loadingState: this.state.isLoading
      });

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização:', error);
      this.updateState({ 
        error: error.message || 'Erro na inicialização',
        isLoading: false // CRÍTICO: Resetar loading
      });
    }
  }

  // CORRIGIDO: Setup do listener de auth com logs detalhados
  private setupAuthListener(): void {
    if (this.authSubscription) {
      logger.warn('[AUTH-MANAGER] ⚠️ Listener já existe, removendo anterior');
      this.authSubscription.unsubscribe();
    }

    this.authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('[AUTH-MANAGER] 📡 Evento de auth recebido:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id?.substring(0, 8),
        timestamp: new Date().toISOString()
      });

      // CORRIGIDO: Processar evento de forma assíncrona mas segura
      try {
        await this.handleAuthEvent(event, session);
      } catch (error: any) {
        logger.error('[AUTH-MANAGER] ❌ Erro no handler de auth:', error);
        this.updateState({ 
          error: error.message,
          isLoading: false // CRÍTICO: Resetar loading em erro
        });
      }
    });

    logger.info('[AUTH-MANAGER] 🔗 Listener de auth configurado');
  }

  // CORRIGIDO: Handler de eventos de auth
  private async handleAuthEvent(event: string, session: Session | null): Promise<void> {
    logger.info('[AUTH-MANAGER] 🎯 Processando evento:', event);

    switch (event) {
      case 'SIGNED_IN':
        logger.info('[AUTH-MANAGER] 👤 Usuário logado - processando sessão');
        await this.processSession(session);
        break;

      case 'SIGNED_OUT':
        logger.info('[AUTH-MANAGER] 👋 Usuário deslogado - limpando estado');
        this.updateState({
          user: null,
          session: null,
          profile: null,
          isLoading: false, // CRÍTICO: Resetar loading
          error: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false,
          hasInviteToken: false,
          inviteDetails: null
        });
        break;

      case 'TOKEN_REFRESHED':
        logger.info('[AUTH-MANAGER] 🔄 Token atualizado');
        await this.processSession(session);
        break;

      default:
        logger.info('[AUTH-MANAGER] 📝 Evento não mapeado:', event);
        // Para eventos não mapeados, apenas atualizar sessão sem recarregar perfil
        this.updateState({ 
          session,
          user: session?.user || null,
          isLoading: false // CRÍTICO: Sempre resetar loading
        });
    }
  }

  // CORRIGIDO: Processamento de sessão com controle de loading
  private async processSession(session: Session | null): Promise<void> {
    if (!session?.user) {
      logger.info('[AUTH-MANAGER] ℹ️ Sem sessão válida');
      this.updateState({
        user: null,
        session: null,
        profile: null,
        isLoading: false, // CRÍTICO: Resetar loading
        error: null,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: false
      });
      return;
    }

    const user = session.user;
    logger.info('[AUTH-MANAGER] 👤 Processando usuário:', {
      userId: user.id.substring(0, 8),
      email: user.email
    });

    // ETAPA 1: Buscar perfil do usuário
    try {
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
        logger.error('[AUTH-MANAGER] ❌ Erro ao buscar perfil:', profileError);
        this.updateState({
          user,
          session,
          profile: null,
          error: `Erro ao carregar perfil: ${profileError.message}`,
          isLoading: false // CRÍTICO: Resetar loading em erro
        });
        return;
      }

      // ETAPA 2: Determinar roles e onboarding
      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';
      const onboardingRequired = !profile?.onboarding_completed;

      logger.info('[AUTH-MANAGER] 📊 Estado determinado:', {
        hasProfile: !!profile,
        isAdmin,
        isFormacao,
        onboardingRequired,
        roleName: profile?.user_roles?.name
      });

      // ETAPA 3: Atualizar estado FINAL
      this.updateState({
        user,
        session,
        profile,
        isLoading: false, // CRÍTICO: Resetar loading SEMPRE
        error: null,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

      logger.info('[AUTH-MANAGER] ✅ Processamento da sessão COMPLETO');

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro no processamento da sessão:', error);
      this.updateState({
        user,
        session,
        profile: null,
        error: error.message,
        isLoading: false // CRÍTICO: Resetar loading
      });
    }
  }

  // CORRIGIDO: Forçar conclusão da inicialização
  private forceCompleteInitialization(): void {
    logger.warn('[AUTH-MANAGER] 🚨 Forçando conclusão da inicialização');
    
    this.initialized = true;
    this.updateState({ 
      isLoading: false, // CRÍTICO: Forçar reset do loading
      error: this.state.error || 'Inicialização forçada por timeout'
    });
    
    this.clearInitializationTimeout();
  }

  private clearInitializationTimeout(): void {
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
      this.initializationTimeout = null;
    }
  }

  // CORRIGIDO: Método de login com logs detalhados
  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    logger.info('[AUTH-MANAGER] 🔐 Iniciando login:', { email });

    try {
      // ETAPA 1: Tentar login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login:', error);
        this.updateState({ 
          error: error.message,
          isLoading: false // CRÍTICO: Resetar loading em erro
        });
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login bem-sucedido:', {
        userId: data.user?.id?.substring(0, 8),
        hasSession: !!data.session
      });

      // ETAPA 2: O processamento da sessão será feito pelo listener
      // NÃO precisamos chamar processSession aqui, evita race conditions

      return { error: null };

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no login:', error);
      this.updateState({ 
        error: error.message,
        isLoading: false // CRÍTICO: Resetar loading
      });
      return { error };
    }
  }

  // CORRIGIDO: Método de logout
  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    logger.info('[AUTH-MANAGER] 👋 Iniciando logout');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout:', error);
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout bem-sucedido');
      return { success: true };

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no logout:', error);
      return { success: false, error };
    }
  }

  // Sistema de eventos
  on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
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

  private emit<T extends AuthEventType>(event: T, ...args: Parameters<AuthEventHandler<T>>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          (handler as any)(...args);
        } catch (error) {
          logger.error(`[AUTH-MANAGER] Erro no handler de evento ${event}:`, error);
        }
      });
    }
  }

  // CORRIGIDO: Atualização de estado com logs e emissão de eventos
  private updateState(updates: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };

    logger.info('[AUTH-MANAGER] 📊 Estado atualizado:', {
      changes: Object.keys(updates),
      isLoading: this.state.isLoading,
      hasUser: !!this.state.user,
      hasProfile: !!this.state.profile,
      error: this.state.error
    });

    // Emitir evento de mudança de estado
    this.emit('stateChanged', this.state);
  }

  // NOVO: Método para obter caminho de redirecionamento
  getRedirectPath(): string {
    const state = this.getState();
    
    logger.info('[AUTH-MANAGER] 🎯 Determinando redirecionamento:', {
      hasUser: !!state.user,
      hasProfile: !!state.profile,
      onboardingRequired: state.onboardingRequired,
      isAdmin: state.isAdmin,
      isFormacao: state.isFormacao
    });

    // Sem usuário = login
    if (!state.user) {
      return '/login';
    }

    // Com usuário mas sem perfil = aguardar (dashboard mesmo assim)
    if (!state.profile) {
      return '/dashboard';
    }

    // Onboarding obrigatório
    if (state.onboardingRequired) {
      return '/onboarding';
    }

    // Formação = área específica
    if (state.isFormacao) {
      return '/formacao';
    }

    // Padrão = dashboard
    return '/dashboard';
  }

  // Cleanup para testes e desenvolvimento
  destroy(): void {
    logger.info('[AUTH-MANAGER] 🧹 Destruindo AuthManager');
    
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    
    this.clearInitializationTimeout();
    this.listeners.clear();
    this.initialized = false;
    this.initializationPromise = null;
  }
}

export default AuthManager;
