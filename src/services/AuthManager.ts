import { AuthChangeEvent, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';
import { UserProfile } from '@/lib/supabase';
import { EventEmitter } from 'events';
import { AuthEventType, AuthManagerEvents, AuthState } from '@/types/authTypes';
import { fetchUserProfile } from '@/contexts/auth/utils';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';

type SupabaseClientType = SupabaseClient<Database>;

export class AuthManager extends EventEmitter<AuthManagerEvents> {
  private static instance: AuthManager;
  private supabaseClient: SupabaseClientType | null = null;
  private _state: AuthState = {
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
  public isInitialized: boolean = false;

  private constructor() {
    super();
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public setSupabaseClient(client: SupabaseClientType): void {
    this.supabaseClient = client;
  }

  public getSupabaseClient(): SupabaseClientType {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized. Call setSupabaseClient first.');
    }
    return this.supabaseClient;
  }

  private setState(newState: Partial<AuthState>): void {
    this._state = { ...this._state, ...newState };
    logger.info('[AUTH-MANAGER] 🔄 Estado atualizado:', {
      component: 'AuthManager',
      action: 'setState',
      newState,
      currentState: this._state
    });
    this.emit('stateChanged', this._state);
  }

  public getState(): AuthState {
    return this._state;
  }

  public async initialize(): Promise<void> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized. Call setSupabaseClient first.');
    }

    this.setState({ isLoading: true, error: null });
    try {
      const { data: { session }, error } = await this.supabaseClient.auth.getSession();
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão inicial:', error);
        this.emit('error', error);
        this.setState({ error: error.message, isLoading: false });
        return;
      }

      if (session) {
        logger.info('[AUTH-MANAGER] 🔑 Sessão encontrada durante a inicialização', { session });
        await this.handleSession(session);
      } else {
        logger.info('[AUTH-MANAGER] 🚪 Nenhuma sessão encontrada durante a inicialização');
        this.setState({ user: null, session: null, profile: null, isAdmin: false, isFormacao: false, onboardingRequired: false, isLoading: false });
      }
    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro crítico durante a inicialização:', error);
      this.setState({ error: error.message, isLoading: false });
      this.emit('error', error);
    } finally {
      this.isInitialized = true;
      this.setState({ isLoading: false });
    }

    this.supabaseClient.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      logger.info('[AUTH-MANAGER] 🚦 auth.onAuthStateChange disparado:', { event, hasSession: !!session });
      await this.handleAuthStateChange(event, session);
    });
  }

  private async handleAuthStateChange(event: AuthChangeEvent, session: Session | null): Promise<void> {
    logger.info('[AUTH-MANAGER] 🚦 auth.onAuthStateChange:', { event, hasSession: !!session });

    switch (event) {
      case 'signedIn':
      case 'signedOut':
      case 'user_updated':
        if (session) {
          await this.handleSession(session);
        } else {
          this.clearSession();
        }
        break;
      case 'password_recovery':
        logger.info('[AUTH-MANAGER] 🔑 Recuperação de senha iniciada');
        break;
      case 'initialSession':
        logger.info('[AUTH-MANAGER] 🔑 Sessão inicial detectada');
        if (session) {
          await this.handleSession(session);
        } else {
          this.clearSession();
        }
        break;
      default:
        logger.warn('[AUTH-MANAGER] ⚠️ Evento de autenticação desconhecido:', { event });
    }
  }

  private async handleSession(session: Session): Promise<void> {
    logger.info('[AUTH-MANAGER] 🔑 Nova sessão detectada:', { session });
    this.setState({ session, error: null, isLoading: true });

    try {
      const { user } = session;
      const profile = await fetchUserProfile(this.supabaseClient, user.id);

      if (!profile) {
        logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado para o usuário:', { userId: user.id });
        this.setState({
          user,
          session,
          profile: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: true, // Assumir onboardingRequired = true por segurança
          isLoading: false
        });
        return;
      }

      const isAdmin = profile.user_roles?.name === 'admin' || profile.is_admin === true;
      const isFormacao = profile.user_roles?.name === 'formacao';
      const onboardingRequired = profile.onboarding_completed !== true;

      logger.info('[AUTH-MANAGER] ✅ Perfil de usuário carregado com sucesso:', {
        userId: user.id,
        isAdmin,
        isFormacao,
        onboardingCompleted: profile.onboarding_completed,
        userRole: profile.user_roles?.name
      });

      this.setState({
        user,
        session,
        profile,
        isAdmin,
        isFormacao,
        onboardingRequired,
        isLoading: false
      });

    } catch (profileError: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao buscar perfil de usuário:', profileError);
      this.setState({ error: profileError.message, isLoading: false });
      this.emit('error', profileError);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  private clearSession(): void {
    logger.info('[AUTH-MANAGER] 🚪 Limpando sessão e removendo usuário');
    this.setState({
      user: null,
      session: null,
      profile: null,
      isAdmin: false,
      isFormacao: false,
      onboardingRequired: false,
      isLoading: false
    });
  }

  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    logger.info('[AUTH-MANAGER] 🔑 Tentando login:', { email });
    this.setState({ isLoading: true, error: null });

    try {
      const { data, error } = await this.supabaseClient!.auth.signInWithPassword({ email, password });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro durante o login:', error);
        this.setState({ error: error.message, isLoading: false });
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso:', { user: data.user });
      return {};
    } catch (signInError: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado durante o login:', signInError);
      this.setState({ error: signInError.message, isLoading: false });
      return { error: signInError };
    } finally {
      this.setState({ isLoading: false });
    }
  }

  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    logger.info('[AUTH-MANAGER] 🚪 Tentando logout');
    this.setState({ isLoading: true, error: null });

    try {
      const { error } = await this.supabaseClient!.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro durante o logout:', error);
        this.setState({ error: error.message, isLoading: false });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso');
      this.clearSession();
      InviteTokenManager.clearTokenOnLogout();
      return { success: true };
    } catch (signOutError: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado durante o logout:', signOutError);
      this.setState({ error: signOutError.message, isLoading: false });
      return { success: false, error: signOutError };
    } finally {
      this.setState({ isLoading: false });
    }
  }

  /**
   * Manipula o fluxo de convite, registrando ou redirecionando o usuário
   */
  async handleInviteFlow({ token, inviteEmail, currentUser, inviteDetails }: { token: string; inviteEmail: string; currentUser: User | null; inviteDetails: any }): Promise<string | null> {
    logger.info('[AUTH-MANAGER] ✉️ Iniciando fluxo de convite:', {
      hasToken: !!token,
      inviteEmail,
      hasCurrentUser: !!currentUser,
      hasInviteDetails: !!inviteDetails
    });

    // Caso 1: Usuário já está logado
    if (currentUser && currentUser.email === inviteEmail) {
      logger.info('[AUTH-MANAGER] ✅ Usuário já logado com o e-mail correto');
      InviteTokenManager.storeToken(token);
      return '/onboarding';
    }

    // Caso 2: Usuário está logado com e-mail diferente -> tela de mismatch
    if (currentUser && currentUser.email !== inviteEmail) {
      logger.warn('[AUTH-MANAGER] ⚠️ Usuário logado com e-mail diferente');
      return `/invite/${token}`;
    }

    // Caso 3: Usuário não está logado -> direcionar para registro/login
    logger.info('[AUTH-MANAGER] 👤 Usuário não logado - direcionando para registro/login');
    InviteTokenManager.storeToken(token);
    return `/register?invite=true&token=${token}`;
  }

  /**
   * Método público para obter o caminho de redirecionamento baseado no estado atual
   */
  public getRedirectPath(): string {
    const state = this.getState();
    
    logger.info('[AUTH-MANAGER] 📍 Calculando redirecionamento:', {
      component: 'AuthManager',
      action: 'getRedirectPath',
      message: `hasUser: ${!!state.user}, isAdmin: ${state.isAdmin}, onboardingRequired: ${state.onboardingRequired}`
    });

    // PRIORIDADE 1: Admin sempre vai para /admin
    if (state.isAdmin) {
      logger.info('[AUTH-MANAGER] 👑 Admin detectado - redirecionando para /admin', {
        component: 'AuthManager',
        action: 'getRedirectPath',
        message: 'Admin priority redirect'
      });
      return '/admin';
    }

    // PRIORIDADE 2: Sem usuário = login
    if (!state.user) {
      logger.info('[AUTH-MANAGER] 🚪 Sem usuário - redirecionando para /login', {
        component: 'AuthManager',
        action: 'getRedirectPath',
        message: 'No user redirect'
      });
      return '/login';
    }

    // PRIORIDADE 3: Onboarding obrigatório
    if (state.onboardingRequired) {
      logger.info('[AUTH-MANAGER] 📝 Onboarding obrigatório - redirecionando para /onboarding', {
        component: 'AuthManager',
        action: 'getRedirectPath',
        message: 'Onboarding required redirect'
      });
      return '/onboarding';
    }

    // PRIORIDADE 4: Formação vai para área específica
    if (state.isFormacao) {
      logger.info('[AUTH-MANAGER] 📚 Formação detectado - redirecionando para /formacao', {
        component: 'AuthManager',
        action: 'getRedirectPath',
        message: 'Formacao role redirect'
      });
      return '/formacao';
    }

    // PADRÃO: Dashboard
    logger.info('[AUTH-MANAGER] 🏠 Redirecionamento padrão - /dashboard', {
      component: 'AuthManager',
      action: 'getRedirectPath',
      message: 'Default dashboard redirect'
    });
    return '/dashboard';
  }

  on<T extends AuthEventType>(event: T, listener: AuthManagerEvents[T]): this {
    return super.on(event, listener);
  }

  off<T extends AuthEventType>(event: T, listener: AuthManagerEvents[T]): this {
    return super.off(event, listener);
  }

  emit<T extends AuthEventType>(event: T, ...args: Parameters<AuthManagerEvents[T]>): boolean {
    return super.emit(event, ...args);
  }
}

export default AuthManager.getInstance();
