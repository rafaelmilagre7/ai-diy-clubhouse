
import { supabase } from '@/lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { AuthState, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { logger } from '@/utils/logger';
import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';

// Eventos do AuthManager - compatível com BrowserEventEmitter
interface AuthManagerEvents {
  stateChanged: (state: AuthState) => void;
  error: (error: Error) => void;
  timeout: () => void;
}

class AuthManager extends BrowserEventEmitter<AuthManagerEvents> {
  private static instance: AuthManager;
  private state: AuthState;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    super();
    
    // Estado inicial limpo
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

    logger.info('[AUTH-MANAGER] 🚀 Instância criada com BrowserEventEmitter', {
      component: 'AuthManager',
      action: 'constructor'
    });
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  getState(): AuthState {
    return { ...this.state };
  }

  private setState(newState: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    logger.info('[AUTH-MANAGER] 📊 Estado atualizado:', {
      component: 'AuthManager',
      action: 'state_update',
      changes: Object.keys(newState),
      hasUser: !!this.state.user,
      isLoading: this.state.isLoading,
      isAdmin: this.state.isAdmin
    });

    // Emitir evento de mudança de estado
    this.emit('stateChanged', this.state);
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('[AUTH-MANAGER] ✅ Já inicializado - retornando estado atual');
      return;
    }

    if (this.initializationPromise) {
      logger.info('[AUTH-MANAGER] ⏳ Inicialização em andamento - aguardando...');
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🔄 Iniciando inicialização completa');
      
      this.setState({ isLoading: true, error: null });

      // Configurar listener de mudanças de auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Auth state change:', { event, hasSession: !!session });
        
        if (event === 'SIGNED_IN' && session?.user) {
          await this.handleUserSignedIn(session.user, session);
        } else if (event === 'SIGNED_OUT') {
          this.handleUserSignedOut();
        }
      });

      // Verificar sessão atual
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao buscar sessão:', error);
        this.setState({ 
          isLoading: false, 
          error: error.message,
          user: null,
          session: null,
          profile: null
        });
        return;
      }

      if (session?.user) {
        logger.info('[AUTH-MANAGER] 👤 Sessão ativa encontrada');
        await this.handleUserSignedIn(session.user, session);
      } else {
        logger.info('[AUTH-MANAGER] 🚫 Nenhuma sessão ativa');
        this.setState({ 
          isLoading: false,
          user: null,
          session: null,
          profile: null
        });
      }

      this.initialized = true;
      logger.info('[AUTH-MANAGER] ✅ Inicialização concluída');

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização:', error);
      this.setState({ 
        isLoading: false, 
        error: (error as Error).message 
      });
      this.emit('error', error as Error);
    }
  }

  private async handleUserSignedIn(user: User, session: Session): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🔐 Processando usuário logado:', {
        userId: user.id.substring(0, 8) + '***',
        email: user.email
      });

      // Atualizar estado básico
      this.setState({
        user,
        session,
        isLoading: true
      });

      // Carregar perfil
      const profile = await this.loadUserProfile(user.id);
      
      if (profile) {
        const isAdmin = profile.user_roles?.name === 'admin';
        const isFormacao = profile.user_roles?.name === 'formacao';
        const onboardingRequired = !profile.onboarding_completed && !isAdmin;

        this.setState({
          profile,
          isAdmin,
          isFormacao,
          onboardingRequired,
          isLoading: false,
          error: null
        });

        logger.info('[AUTH-MANAGER] ✅ Usuário processado com sucesso:', {
          userId: user.id.substring(0, 8) + '***',
          role: profile.user_roles?.name,
          onboardingRequired,
          isAdmin
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

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao processar usuário logado:', error);
      this.setState({
        isLoading: false,
        error: (error as Error).message
      });
    }
  }

  private handleUserSignedOut(): void {
    logger.info('[AUTH-MANAGER] 🚪 Usuário deslogado');
    
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
  }

  private async loadUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(
            id,
            name,
            description
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil:', error);
        return null;
      }

      return profile;
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao buscar perfil:', error);
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔑 Tentativa de login:', { email });
      
      this.setState({ isLoading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login:', error);
        this.setState({ isLoading: false, error: error.message });
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso');
      return { error: null };
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no login:', error);
      this.setState({ isLoading: false, error: (error as Error).message });
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🚪 Iniciando logout');
      
      this.setState({ isLoading: true });

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout:', error);
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso');
      return { success: true };
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no logout:', error);
      return { success: false, error: error as Error };
    }
  }

  getRedirectPath(): string {
    const state = this.getState();
    
    // Admin sempre vai para /admin
    if (state.isAdmin) {
      return '/admin';
    }
    
    // Formacao vai para /formacao  
    if (state.isFormacao) {
      return '/formacao';
    }
    
    // Se onboarding é obrigatório
    if (state.onboardingRequired) {
      return '/onboarding';
    }
    
    // Padrão é dashboard
    return '/dashboard';
  }

  async handleInviteFlow(params: {
    token: string;
    inviteEmail: string;
    currentUser: User | null;
    inviteDetails: any;
  }): Promise<string> {
    const { token, inviteEmail, currentUser, inviteDetails } = params;
    
    logger.info('[AUTH-MANAGER] 🎯 Processando fluxo de convite:', {
      hasToken: !!token,
      inviteEmail,
      hasCurrentUser: !!currentUser,
      currentUserEmail: currentUser?.email
    });

    // Armazenar detalhes do convite no estado
    this.setState({
      hasInviteToken: true,
      inviteDetails
    });

    // Se usuário não está logado, redirecionar para login
    if (!currentUser) {
      return `/login?token=${token}`;
    }

    // Se e-mail não confere, tratar incompatibilidade
    if (currentUser.email !== inviteEmail) {
      return `/invite/mismatch?token=${token}`;
    }

    // Se chegou até aqui, redirecionar para onboarding com token
    return `/onboarding?token=${token}`;
  }
}

export default AuthManager;
