import { AuthChangeEvent, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { AuthState, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { supabase } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

class AuthManager {
  private static instance: AuthManager;
  private supabaseClient: SupabaseClient;
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
  private listeners: { [event: string]: Function[] } = {};
  public isInitialized: boolean = false;

  private constructor() {
    this.supabaseClient = supabase;
    this.setupAuthListener();
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private setupAuthListener() {
    this.supabaseClient.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      logger.info(`[AUTH-MANAGER] 🔑 Auth state change: ${event}`, {
        hasSession: !!session,
        user: session?.user
      });

      this.updateState({
        user: session?.user || null,
        session: session,
        isLoading: true,
        error: null
      });

      if (session?.user) {
        try {
          await this.loadUserProfile(session.user.id);
        } catch (profileError: any) {
          logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil:', profileError);
          this.updateState({
            isLoading: false,
            error: profileError.message || 'Erro ao carregar perfil'
          });
        }
      } else {
        this.resetProfile();
      }

      // Após um SIGN_OUT, limpar o token de convite
      if (event === 'SIGNED_OUT') {
        logger.info('[AUTH-MANAGER] 🚪 Limpando token após SIGNED_OUT');
        InviteTokenManager.clearTokenOnLogout();
        this.resetState();
      }
    });
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      logger.info(`[AUTH-MANAGER] 👤 Carregando perfil para o usuário: ${userId}`);
      const { data: profile, error: profileError } = await this.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
      }

      if (!profile) {
        logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado, criando um novo...');
        await this.createUserProfile(userId);
        return;
      }

      logger.info('[AUTH-MANAGER] ✅ Perfil carregado com sucesso:', {
        userId: profile.id,
        username: profile.username
      });

      this.updateProfileState(profile as UserProfile);
      await this.checkOnboardingStatus(profile as UserProfile);

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao carregar ou criar perfil:', error);
      this.updateState({
        isLoading: false,
        error: error.message || 'Erro ao carregar ou criar perfil'
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  private async createUserProfile(userId: string): Promise<void> {
    try {
      logger.info(`[AUTH-MANAGER] 🛠️ Criando perfil para o usuário: ${userId}`);
      const { data: user, error: userError } = await this.supabaseClient.auth.getUser();

      if (userError) {
        throw new Error(`Erro ao obter usuário: ${userError.message}`);
      }

      if (!user?.user?.email) {
        throw new Error('Email do usuário não encontrado');
      }

      const newProfile: Profile = {
        id: userId,
        username: user.user.email,
        full_name: user.user.email,
        avatar_url: '',
        updated_at: new Date().toISOString(),
        email: user.user.email,
        user_roles_id: 'a9a43476-57f6-4c1f-b54f-994898499944'
      };

      const { error: insertError } = await this.supabaseClient
        .from('profiles')
        .insert([newProfile]);

      if (insertError) {
        throw new Error(`Erro ao inserir perfil: ${insertError.message}`);
      }

      logger.info('[AUTH-MANAGER] ✅ Perfil criado com sucesso:', { userId });
      this.updateProfileState(newProfile as UserProfile);
      await this.checkOnboardingStatus(newProfile as UserProfile);

    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao criar perfil:', error);
      this.updateState({
        isLoading: false,
        error: error.message || 'Erro ao criar perfil'
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  private async checkOnboardingStatus(profile: UserProfile): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] ⚙️ Verificando status de onboarding...');
      const { data, error } = await this.supabaseClient
        .from('user_roles')
        .select('onboarding_required')
        .eq('id', profile.user_roles_id)
        .single();

      if (error) {
        throw new Error(`Erro ao verificar onboarding: ${error.message}`);
      }

      if (!data) {
        logger.warn('[AUTH-MANAGER] ⚠️ Função não encontrada para este usuário.');
        this.updateState({ onboardingRequired: false });
        return;
      }

      const onboardingRequired = data.onboarding_required === true;
      logger.info(`[AUTH-MANAGER] ✅ Onboarding ${onboardingRequired ? 'é obrigatório' : 'não é obrigatório'}`, {
        roleId: profile.user_roles_id,
        roleName: profile.user_roles?.name
      });

      this.updateState({ onboardingRequired });
    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao verificar onboarding:', error);
      this.updateState({
        isLoading: false,
        error: error.message || 'Erro ao verificar onboarding',
        onboardingRequired: false
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  signIn = async (email: string, password: string): Promise<{ error?: Error | null }> => {
    logger.info(`[AUTH-MANAGER] 👤 Tentativa de login para: ${email}`);
    this.updateState({ isLoading: true, error: null });

    try {
      const { error } = await this.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login:', error);
        this.updateState({ isLoading: false });
        return { error };
      }

      logger.info(`[AUTH-MANAGER] ✅ Login bem-sucedido para: ${email}`);
      return {};
    } catch (err: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no login:', err);
      this.updateState({ isLoading: false });
      return { error: err };
    }
  };

  signOut = async (): Promise<{ success: boolean; error?: Error | null }> => {
    logger.info('[AUTH-MANAGER] 🚪 Iniciando logout...');
    this.updateState({ isLoading: true, error: null });

    try {
      const { error } = await this.supabaseClient.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout:', error);
        this.updateState({ isLoading: false });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout bem-sucedido.');
      this.resetState();
      return { success: true };
    } catch (err: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no logout:', err);
      this.updateState({ isLoading: false });
      return { success: false, error: err };
    }
  };

  resetPassword = async (email: string): Promise<{ data: any; error: any }> => {
    logger.info(`[AUTH-MANAGER] ✉️ Redefinir senha solicitado para: ${email}`);
    try {
      const { data, error } = await this.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-new-password`,
      });
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao solicitar redefinição de senha:', error);
        return { data: null, error };
      }
      logger.info(`[AUTH-MANAGER] ✅ Solicitação de redefinição de senha enviada para: ${email}`);
      return { data, error: null };
    } catch (err: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado ao solicitar redefinição de senha:', err);
      return { data: null, error: err };
    }
  };

  setNewPassword = async (newPassword: string): Promise<{ data: any; error: any }> => {
    logger.info('[AUTH-MANAGER] 🔑 Definindo nova senha...');
    try {
      const { data, error } = await this.supabaseClient.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao definir nova senha:', error);
        return { data: null, error };
      }
      logger.info('[AUTH-MANAGER] ✅ Nova senha definida com sucesso.');
      return { data, error: null };
    } catch (err: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado ao definir nova senha:', err);
      return { data: null, error: err };
    }
  };

  updateProfile = async (updates: { username: string; full_name: string; avatar_url: string }): Promise<{ data: any; error: any }> => {
    logger.info('[AUTH-MANAGER] 📝 Atualizando perfil...');
    try {
      const { data, error } = await this.supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', this.state.user?.id)
        .select()
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao atualizar perfil:', error);
        return { data: null, error };
      }
      logger.info('[AUTH-MANAGER] ✅ Perfil atualizado com sucesso.');
      return { data, error: null };
    } catch (err: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado ao atualizar perfil:', err);
      return { data: null, error: err };
    }
  };

  getRedirectPath(): string {
    const user = this.state.user;
    const profile = this.state.profile;
    const isAdmin = this.state.isAdmin;
    const onboardingRequired = this.state.onboardingRequired;

    if (!user) {
      logger.info('[AUTH-MANAGER] 🚦 Redirecionando para /login devido à ausência de usuário.');
      return '/login';
    }

    if (isAdmin) {
      logger.info('[AUTH-MANAGER] 🚦 Redirecionando para /admin devido ao status de administrador.');
      return '/admin';
    }

    if (!profile) {
      logger.warn('[AUTH-MANAGER] ⚠️ Perfil ausente, mas usuário presente. Isso pode indicar um problema.');
      return '/dashboard';
    }

    if (onboardingRequired) {
      logger.info('[AUTH-MANAGER] 🚦 Redirecionando para /onboarding devido à necessidade de onboarding.');
      return '/onboarding';
    }

    logger.info('[AUTH-MANAGER] 🚦 Redirecionando para /dashboard como fallback padrão.');
    return '/dashboard';
  }

  // Centralize state updates and notify listeners
  protected updateState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };

    if (newState.user && newState.user.id) {
      const isAdmin = this.state.profile?.user_roles?.name === 'admin';
      const isFormacao = this.state.profile?.user_roles?.name === 'formacao';
      this.state.isAdmin = isAdmin;
      this.state.isFormacao = isFormacao;
    }

    logger.debug('[AUTH-MANAGER] 🔄 Estado atualizado:', this.state);
    this.notifyListeners('stateChanged', this.state);
  }

  protected updateProfileState(profile: UserProfile): void {
    const isAdmin = profile?.user_roles?.name === 'admin';
    const isFormacao = profile?.user_roles?.name === 'formacao';

    this.updateState({
      profile: profile,
      isAdmin: isAdmin,
      isFormacao: isFormacao
    });
  }

  // Reset profile-related state
  protected resetProfile(): void {
    this.updateState({
      profile: null,
      isAdmin: false,
      isFormacao: false,
      onboardingRequired: false
    });
  }

  // Reset all state to initial values
  protected resetState(): void {
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

  // Listener Management
  on<T extends AuthEventType>(event: T, listener: AuthEventHandler<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return () => {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    };
  }

  private notifyListeners<T extends AuthEventType>(event: T, data: AuthState): void {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          logger.error(`[AUTH-MANAGER] ❌ Erro ao notificar listener para o evento ${event}:`, error);
        }
      });
    }
  }

  // Public method to get current state
  getState(): AuthState {
    return this.state;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[AUTH-MANAGER] ⚠️ AuthManager já está inicializado. Ignorando chamada.');
      return;
    }

    logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager...');
    this.isInitialized = true;

    try {
      const { data: { session }, error } = await this.supabaseClient.auth.getSession();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão inicial:', error);
        this.updateState({ error: error.message, isLoading: false });
        return;
      }

      if (session?.user) {
        logger.info('[AUTH-MANAGER] ✅ Sessão encontrada durante a inicialização.');
        this.updateState({
          user: session.user,
          session: session,
          isLoading: true
        });
        await this.loadUserProfile(session.user.id);
      } else {
        logger.info('[AUTH-MANAGER] ℹ️ Nenhuma sessão encontrada durante a inicialização.');
        this.updateState({ isLoading: false });
      }
    } catch (error: any) {
      logger.error('[AUTH-MANAGER] ❌ Erro durante a inicialização:', error);
      this.updateState({
        error: error.message || 'Erro ao inicializar',
        isLoading: false
      });
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  /**
   * NOVO: Gerenciar fluxo completo de convite
   * Centraliza toda a lógica de decisão de redirect baseada em convite
   */
  async handleInviteFlow({
    token,
    inviteEmail,
    currentUser,
    inviteDetails
  }: {
    token: string;
    inviteEmail: string;
    currentUser: User | null;
    inviteDetails: any;
  }): Promise<string | null> {
    logger.info('[AUTH-MANAGER] 🎯 Processando fluxo de convite:', {
      hasToken: !!token,
      inviteEmail,
      hasCurrentUser: !!currentUser,
      currentUserEmail: currentUser?.email,
      inviteRole: inviteDetails?.role?.name
    });

    try {
      // Validação básica
      if (!token || !inviteEmail || !inviteDetails) {
        throw new Error('Dados de convite inválidos');
      }

      // Armazenar token em todos os casos válidos
      InviteTokenManager.storeToken(token);

      // CASO A: Usuário não autenticado
      if (!currentUser) {
        logger.info('[AUTH-MANAGER] 👤 Usuário não autenticado - redirecionando para login');
        return `/login?invite=true&token=${token}`;
      }

      // CASO B: Usuário autenticado com e-mail correto
      if (currentUser.email === inviteEmail) {
        logger.info('[AUTH-MANAGER] ✅ E-mail correto - redirecionando para onboarding');
        
        // Atualizar estado para indicar fluxo de convite
        this.updateState({
          hasInviteToken: true,
          inviteDetails
        });

        return `/onboarding?token=${token}&invite=true`;
      }

      // CASO C: Usuário autenticado com e-mail diferente
      // Este caso será tratado pelo InviteInterceptor mostrando a tela de mismatch
      logger.warn('[AUTH-MANAGER] ⚠️ E-mail incorreto - será mostrada tela de mismatch');
      return null; // InviteInterceptor vai mostrar a tela de mismatch

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro no fluxo de convite:', error);
      
      // Limpar token em caso de erro
      InviteTokenManager.clearTokenOnError();
      
      // Redirecionar para erro
      return '/login?error=invite_error';
    }
  }
}

export default AuthManager;
