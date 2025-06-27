import { User, Session } from '@supabase/supabase-js';
import { UserProfile, supabase } from '@/lib/supabase';
import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { logger } from '@/utils/logger';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { AuthState, AuthManagerEvents } from '@/types/authTypes';

/**
 * Gerenciador centralizado de autenticação e estado do usuário
 * Implementa padrão Singleton para controle global do estado
 */
export class AuthManager extends BrowserEventEmitter<AuthManagerEvents> {
  private static instance: AuthManager | null = null;
  
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

  private constructor() {
    super();
    this.setupAuthListener();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private setupAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('[AUTH-MANAGER] 👂 Auth state change:', { event });
      
      this.updateState({ 
        session, 
        user: session?.user || null,
        isLoading: true, // Durante a transição
        error: null
      });

      if (session?.user) {
        try {
          await this.loadUserProfile(session.user.id);
        } catch (profileError: any) {
          logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil', profileError);
          this.updateState({
            isLoading: false,
            error: profileError.message
          });
        }
      } else {
        this.clearAuthState();
      }

      this.updateState({ isLoading: false }); // Finaliza loading após processamento
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[AUTH-MANAGER] ⚠️ AuthManager já inicializado');
      return;
    }

    logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager');
    this.isInitialized = true;

    try {
      // Tentar obter a sessão atual do Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão inicial', error);
        this.updateState({ error: error.message, isLoading: false });
        return;
      }

      // Se houver uma sessão, atualizar o estado com o usuário e sessão
      if (session?.user) {
        this.updateState({
          session,
          user: session.user,
          isLoading: true, // Carregando perfil
          error: null
        });

        try {
          // Carregar o perfil do usuário
          await this.loadUserProfile(session.user.id);
        } catch (profileError: any) {
          logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil', profileError);
          this.updateState({
            isLoading: false,
            error: profileError.message
          });
        }
      } else {
        // Se não houver sessão, limpar o estado de autenticação
        this.clearAuthState();
      }
    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', error);
      this.updateState({ error: error.message, isLoading: false });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  private async loadUserProfile(userId: string): Promise<void> {
    logger.info('[AUTH-MANAGER] 👤 Carregando perfil do usuário...', { userId });

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`*, user_roles(name, description)`)
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao buscar perfil', error);
        this.updateState({ 
          profile: null,
          error: error.message,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: true // Assumir onboarding necessário em caso de falha
        });
        return;
      }

      if (!profile) {
        logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado', { userId });
        this.updateState({ 
          profile: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: true // Forçar onboarding se não há perfil
        });
        return;
      }
      
      // Extrair nome da role
      const roleName = profile.user_roles?.name;
      const isAdmin = roleName === 'admin';
      const isFormacao = roleName === 'formacao';
      const onboardingRequired = profile.onboarding_completed !== true;

      logger.info('[AUTH-MANAGER] ✅ Perfil carregado com sucesso', {
        userId: userId.substring(0, 8) + '***',
        isAdmin,
        isFormacao,
        onboardingRequired,
        roleName
      });

      this.updateState({
        profile,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil', error);
      this.updateState({ 
        profile: null,
        error: error.message,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: true // Assumir onboarding necessário em caso de falha
      });
    }
  }

  /**
   * Gerencia o fluxo completo de convites
   * Centraliza toda a lógica de decisão para redirecionamento baseado no estado do usuário e convite
   */
  async handleInviteFlow(params: {
    token: string;
    inviteEmail: string;
    currentUser: User | null;
    inviteDetails: any;
  }): Promise<string | null> {
    const { token, inviteEmail, currentUser, inviteDetails } = params;
    
    logger.info('[AUTH-MANAGER] 🎯 Processando fluxo de convite', {
      component: 'AuthManager',
      action: 'handleInviteFlow',
      hasUser: !!currentUser,
      userEmail: currentUser?.email,
      inviteEmail,
      token: token.substring(0, 8) + '***'
    });

    try {
      // Armazenar token e detalhes do convite no estado
      InviteTokenManager.storeToken(token, inviteDetails);
      
      // Atualizar estado interno
      this.updateState({
        hasInviteToken: true,
        inviteDetails
      });

      // Caso 1: Usuário não está logado - enviar para registro/login
      if (!currentUser) {
        logger.info('[AUTH-MANAGER] 📝 Usuário não logado - redirecionando para registro', {
          action: 'redirect_to_register',
          inviteEmail
        });
        return `/register?token=${token}&invite=true`;
      }

      // Caso 2: Usuário logado com e-mail correto - continuar para onboarding
      if (currentUser.email === inviteEmail) {
        logger.info('[AUTH-MANAGER] ✅ E-mail correto - redirecionando para onboarding', {
          action: 'redirect_to_onboarding',
          userEmail: currentUser.email
        });
        return `/onboarding?token=${token}&invite=true`;
      }

      // Caso 3: Usuário logado com e-mail diferente - mostrar tela de incompatibilidade
      logger.warn('[AUTH-MANAGER] ⚠️ E-mail incompatível - redirecionando para tela de erro', {
        action: 'redirect_to_mismatch',
        userEmail: currentUser.email,
        inviteEmail
      });
      
      // Retornar null indica que o componente deve lidar com a incompatibilidade localmente
      return null;

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro no processamento do convite', error, {
        component: 'AuthManager',
        action: 'handleInviteFlow_error'
      });
      
      this.updateState({
        error: `Erro no processamento do convite: ${error.message}`
      });
      
      return `/login?error=invite_processing_failed`;
    }
  }

  /**
   * Retorna o estado atual
   */
  getState(): AuthState {
    return this.state;
  }

  /**
   * Calcula o caminho de redirecionamento com base no estado atual
   */
  getRedirectPath(): string {
    if (this.state.isAdmin) {
      logger.info('[AUTH-MANAGER] 👑 Redirecionamento para /admin (isAdmin=true)');
      return '/admin';
    }
    
    if (this.state.onboardingRequired) {
      logger.info('[AUTH-MANAGER] ➡️ Redirecionamento para /onboarding (onboardingRequired=true)');
      return '/onboarding';
    }
    
    logger.info('[AUTH-MANAGER] 🏠 Redirecionamento para /dashboard (padrão)');
    return '/dashboard';
  }

  /**
   * Realiza o signIn com email e password
   */
  async signIn(email: string, password: string): Promise<{ error: Error | null }> {
    logger.info('[AUTH-MANAGER] 🔑 Tentando login...', { email });
    this.updateState({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login', error);
        this.updateState({ 
          error: error.message,
          isLoading: false
        });
        return { error };
      }
      
      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso', {
        userId: data.user?.id.substring(0, 8) + '***'
      });
      return { error: null };

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no login', error);
      this.updateState({ 
        error: error.message,
        isLoading: false
      });
      return { error: new Error(error.message) };
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  /**
   * Realiza o signOut
   */
  async signOut(): Promise<{ success: boolean; error: Error | null }> {
    logger.info('[AUTH-MANAGER] 🚪 Tentando logout...');
    this.updateState({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout', error);
        this.updateState({ 
          error: error.message,
          isLoading: false
        });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso');
      this.clearAuthState();
      InviteTokenManager.clearTokenOnLogout();
      return { success: true, error: null };

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no logout', error);
      this.updateState({ 
        error: error.message,
        isLoading: false
      });
      return { success: false, error: new Error(error.message) };
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  /**
   * Limpa o estado de autenticação
   */
  private clearAuthState(): void {
    logger.info('[AUTH-MANAGER] 🧹 Limpando estado de autenticação');
    this.updateState({
      user: null,
      session: null,
      profile: null,
      isAdmin: false,
      isFormacao: false,
      onboardingRequired: false,
      error: null,
      hasInviteToken: false,
      inviteDetails: null
    });
  }

  private updateState(updates: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    logger.debug('[AUTH-MANAGER] 📊 Estado atualizado', {
      component: 'AuthManager',
      action: 'state_updated',
      changes: Object.keys(updates),
      hasUser: !!this.state.user,
      isLoading: this.state.isLoading
    });

    this.emit('stateChanged', this.state);
  }
}

export default AuthManager;
