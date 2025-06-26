import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';

class AuthManager extends BrowserEventEmitter<AuthManagerEvents> {
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

  public isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    super();
    logger.info('[AUTH-MANAGER] 🏗️ AuthManager instanciado');
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  private setState(newState: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    logger.info('[AUTH-MANAGER] 📊 Estado atualizado:', {
      component: 'AuthManager',
      action: 'state_update',
      changes: Object.keys(newState),
      isLoading: this.state.isLoading,
      hasUser: !!this.state.user,
      isAdmin: this.state.isAdmin,
      onboardingRequired: this.state.onboardingRequired
    });

    // Emitir evento de mudança de estado
    this.emit('stateChanged', this.state);
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('[AUTH-MANAGER] ✅ Já inicializado, retornando estado atual');
      return;
    }

    if (this.initializationPromise) {
      logger.info('[AUTH-MANAGER] ⏳ Aguardando inicialização em progresso');
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🚀 Iniciando AuthManager');
      this.setState({ isLoading: true, error: null });

      // Setup auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          logger.info('[AUTH-MANAGER] 📡 Auth state change:', {
            event,
            hasSession: !!session,
            hasUser: !!session?.user
          });

          if (session) {
            await this.handleAuthSession(session);
          } else {
            await this.handleAuthSignOut();
          }
        }
      );

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão:', error);
        this.setState({ error: error.message, isLoading: false });
        return;
      }

      if (session) {
        await this.handleAuthSession(session);
      } else {
        this.setState({ isLoading: false });
      }

      this.isInitialized = true;
      logger.info('[AUTH-MANAGER] ✅ Inicialização concluída');

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização:', error);
      this.setState({ 
        error: error.message || 'Erro na inicialização',
        isLoading: false 
      });
    }
  }

  private async handleAuthSession(session: Session): Promise<void> {
    try {
      const user = session.user;
      logger.info('[AUTH-MANAGER] 👤 Processando sessão do usuário:', {
        userId: user.id.substring(0, 8) + '***',
        email: user.email
      });

      // Update basic auth state
      this.setState({ 
        user, 
        session, 
        isLoading: true,
        error: null 
      });

      // Fetch user profile
      const profile = await this.fetchUserProfile(user.id);
      
      if (profile) {
        const isAdmin = profile.user_roles?.name === 'admin';
        const isFormacao = profile.user_roles?.name === 'formacao';
        const onboardingRequired = !profile.onboarding_completed && !isAdmin;

        this.setState({
          profile,
          isAdmin,
          isFormacao,
          onboardingRequired,
          isLoading: false
        });

        logger.info('[AUTH-MANAGER] ✅ Perfil carregado:', {
          userId: user.id.substring(0, 8) + '***',
          roleName: profile.user_roles?.name,
          isAdmin,
          onboardingRequired
        });
      } else {
        logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado');
        this.setState({ isLoading: false });
      }

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao processar sessão:', error);
      this.setState({ 
        error: error.message,
        isLoading: false 
      });
    }
  }

  private async handleAuthSignOut(): Promise<void> {
    logger.info('[AUTH-MANAGER] 🔓 Processando sign out');
    
    this.setState({
      user: null,
      session: null,
      profile: null,
      isAdmin: false,
      isFormacao: false,
      onboardingRequired: false,
      hasInviteToken: false,
      inviteDetails: null,
      isLoading: false,
      error: null
    });
  }

  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
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
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao buscar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na query do perfil:', error);
      return null;
    }
  }

  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔑 Tentativa de login:', { email });
      this.setState({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login:', error);
        this.setState({ error: error.message, isLoading: false });
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso');
      return {};

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no login:', error);
      this.setState({ error: error.message, isLoading: false });
      return { error };
    }
  }

  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔓 Iniciando sign out');
      this.setState({ isLoading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no sign out:', error);
        this.setState({ error: error.message, isLoading: false });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Sign out realizado com sucesso');
      return { success: true };

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no sign out:', error);
      this.setState({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  }

  public getRedirectPath(): string {
    const { user, profile, onboardingRequired, isAdmin } = this.state;

    if (!user) {
      return '/login';
    }

    // Admin sempre vai para /admin
    if (isAdmin) {
      return '/admin';
    }

    // Onboarding obrigatório
    if (onboardingRequired) {
      return '/onboarding';
    }

    // Formação vai para área específica
    if (profile?.user_roles?.name === 'formacao') {
      return '/formacao';
    }

    // Padrão: dashboard
    return '/dashboard';
  }
}

export default AuthManager;
