
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole } from '@/lib/supabase/types';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
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
    profile: null,
    isLoading: true,
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
      await this.updateAuthState(session?.user || null);
      
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 🔄 Estado de autenticação mudou', { event });
        await this.updateAuthState(session?.user || null);
      });

      this.isInitialized = true;
      logger.info('[AUTH-MANAGER] ✅ AuthManager inicializado');
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', error);
      this.setState({ isLoading: false });
    }
  }

  private async updateAuthState(user: any) {
    this.setState({ isLoading: true });

    try {
      if (!user) {
        this.setState({
          user: null,
          profile: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false,
          isLoading: false
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
        profile,
        isAdmin,
        isFormacao,
        onboardingRequired,
        isLoading: false
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
      this.setState({ isLoading: false });
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
    return () => this.listeners.delete(listener);
  }

  off(listener: (state: AuthState) => void) {
    this.listeners.delete(listener);
  }
}

export default AuthManager;
