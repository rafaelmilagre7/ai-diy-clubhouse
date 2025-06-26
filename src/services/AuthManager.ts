
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole } from '@/lib/supabase/types';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface AuthState {
  user: any | null;
  session: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  onboardingRequired: boolean;
  hasInviteToken: boolean;
  inviteDetails: any | null;
}

interface InviteFlowParams {
  token: string;
  inviteEmail: string;
  currentUser: any | null;
  inviteDetails: any;
}

class AuthManager {
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

  private listeners: Set<(state: AuthState) => void> = new Set();
  public isInitialized = false;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private constructor() {
    this.initialize();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager');
      
      const { data: { session } } = await supabase.auth.getSession();
      await this.updateAuthState(session?.user || null, session);
      
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 🔄 Estado de autenticação mudou', { event });
        await this.updateAuthState(session?.user || null, session);
      });

      this.isInitialized = true;
      logger.info('[AUTH-MANAGER] ✅ AuthManager inicializado');
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', error);
      this.setState({ isLoading: false, error: (error as Error).message });
    }
  }

  private async updateAuthState(user: any, session: any = null) {
    this.setState({ isLoading: true, error: null });

    try {
      if (!user) {
        this.setState({
          user: null,
          session: null,
          profile: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false,
          isLoading: false,
          error: null
        });
        return;
      }

      const profile = await this.fetchUserProfile(user.id);
      const roleName = getUserRoleName(profile);
      const isAdmin = isAdminRole(profile);
      const isFormacao = roleName === 'formacao';
      
      // CORREÇÃO: Usar profile?.onboarding_completed ao invés de user_roles_id
      const onboardingRequired = !isAdmin && (!profile?.onboarding_completed);

      this.setState({
        user,
        session,
        profile,
        isAdmin,
        isFormacao,
        onboardingRequired,
        isLoading: false,
        error: null
      });

      logger.info('[AUTH-MANAGER] 📊 Estado atualizado', {
        userId: user.id.substring(0, 8) + '***',
        hasProfile: !!profile,
        roleName,
        isAdmin,
        onboardingRequired
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao atualizar estado', error);
      this.setState({ isLoading: false, error: (error as Error).message });
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
      .single();

    if (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao buscar perfil', error);
      return null;
    }

    return data;
  }

  /**
   * NOVO: Método para processar fluxo de convite
   */
  async handleInviteFlow({ token, inviteEmail, currentUser, inviteDetails }: InviteFlowParams): Promise<string | null> {
    logger.info('[AUTH-MANAGER] 🎯 Processando fluxo de convite', {
      hasCurrentUser: !!currentUser,
      inviteEmail,
      currentUserEmail: currentUser?.email
    });

    // Armazenar token sempre
    InviteTokenManager.storeToken(token, inviteDetails);

    // Caso 1: Usuário não autenticado
    if (!currentUser) {
      logger.info('[AUTH-MANAGER] 👤 Usuário não autenticado - indo para login');
      return `/login?invite=true&token=${token}`;
    }

    // Caso 2: Usuário autenticado com e-mail correto
    if (currentUser.email === inviteEmail) {
      logger.info('[AUTH-MANAGER] ✅ E-mail correto - indo para onboarding');
      return `/onboarding?token=${token}&invite=true`;
    }

    // Caso 3: E-mail diferente - handled by InviteEmailMismatchScreen
    logger.warn('[AUTH-MANAGER] ⚠️ E-mail diferente - permanecendo no interceptor');
    return null;
  }

  /**
   * NOVO: Método signIn
   */
  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      this.setState({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] Erro no login:', error);
        toast.error('Erro no login: ' + error.message);
        this.setState({ isLoading: false, error: error.message });
        return { error };
      }

      if (data.user) {
        logger.info('[AUTH-MANAGER] Login realizado:', data.user.email);
        toast.success('Login realizado com sucesso!');
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      this.setState({ isLoading: false, error: error.message });
      toast.error('Erro inesperado: ' + error.message);
      return { error };
    }
  }

  /**
   * NOVO: Método signOut
   */
  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      this.setState({ isLoading: true, error: null });
      
      // Limpar token no logout
      InviteTokenManager.clearTokenOnLogout();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('[AUTH-MANAGER] Erro no logout:', error);
        toast.error('Erro ao fazer logout: ' + error.message);
        this.setState({ isLoading: false, error: error.message });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] Logout realizado');
      toast.success('Logout realizado com sucesso!');
      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      this.setState({ isLoading: false, error: error.message });
      return { success: false, error };
    }
  }

  getRedirectPath(): string {
    const { user, profile, isAdmin, onboardingRequired } = this.state;

    if (!user) return '/login';
    
    // Admin sempre vai direto para /admin
    if (isAdmin) return '/admin';
    
    // Se onboarding é obrigatório, ir para onboarding
    if (onboardingRequired) return '/onboarding';
    
    // Usuário normal vai para dashboard
    return '/dashboard';
  }

  getState(): AuthState {
    return { ...this.state };
  }

  private setState(updates: Partial<AuthState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  on(event: 'stateChanged', listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  off(listener: (state: AuthState) => void) {
    this.listeners.delete(listener);
  }
}

export default AuthManager;
