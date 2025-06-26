import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  onboardingRequired: boolean;
  hasInviteToken: boolean;
  inviteDetails: any | null;
}

type AuthEvent = 'stateChanged';

export class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private eventListeners: Map<string, ((state: AuthState) => void)[]> = new Map();
  private sessionListener: any = null;
  public isInitialized: boolean = false;

  private constructor() {
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
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private emit(event: string, state: AuthState): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(state));
    }
  }

  on(event: string, callback: (state: AuthState) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);

    return () => {
      this.off(event, callback);
    };
  }

  off(event: string, callback: (state: AuthState) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private setState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.emit('stateChanged', this.state);
  }

  getState(): AuthState {
    return this.state;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('AuthManager já inicializado', { component: 'AuthManager', action: 'initialize' });
      return;
    }

    this.isInitialized = true;
    await this.setupSessionListener();
  }

  private async setupSessionListener(): Promise<void> {
    supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info(`Evento de autenticação recebido: ${event}`, { component: 'AuthManager', action: 'setupSessionListener', event });
      await this.handleAuthStateChange(event, session);
    });

    // Load initial session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await this.handleAuthStateChange('INITIAL_SESSION', session);
    } else {
      this.setState({ isLoading: false });
    }
  }

  private async loadUserProfile(user: User): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error('Erro ao carregar perfil de usuário', error, { component: 'AuthManager', action: 'loadUserProfile', userId: user.id });
        return null;
      }

      return profile as UserProfile;
    } catch (error) {
      logger.error('Erro inesperado ao carregar perfil de usuário', error, { component: 'AuthManager', action: 'loadUserProfile', userId: user.id });
      return null;
    }
  }

  private determineOnboardingRequired(user: User, profile: UserProfile | null): boolean {
    if (!profile) {
      logger.warn('Perfil de usuário não encontrado, forçando onboarding', { component: 'AuthManager', action: 'determineOnboardingRequired', userId: user.id });
      return true;
    }

    const requiredFields = [
      'name',
      'phone',
      'document',
      'address',
      'city',
      'state',
      'country',
      'zipcode'
    ];

    const hasMissingFields = requiredFields.some(field => !profile[field]);

    if (hasMissingFields) {
      logger.warn('Campos obrigatórios ausentes no perfil, forçando onboarding', { component: 'AuthManager', action: 'determineOnboardingRequired', userId: user.id, missingFields: requiredFields.filter(field => !profile[field]) });
      return true;
    }

    return false;
  }

  private async handleAuthStateChange(event: string, session: Session | null): Promise<void> {
    this.setState({ isLoading: true });

    if (session) {
      const user = session.user;
      const profile = await this.loadUserProfile(user);
      const onboardingRequired = this.determineOnboardingRequired(user, profile);
      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';

      logger.info('Sessão detectada', { 
        component: 'AuthManager', 
        action: 'handleAuthStateChange',
        userId: user.id,
        isAdmin,
        isFormacao,
        onboardingRequired,
        hasProfile: !!profile
      });

      this.setState({
        user: user,
        session: session,
        profile: profile,
        isAdmin: isAdmin,
        isFormacao: isFormacao,
        onboardingRequired: onboardingRequired,
        isLoading: false,
        error: null
      });
    } else {
      logger.info('Nenhuma sessão detectada - usuário fez logout ou sessão expirou', { component: 'AuthManager', action: 'handleAuthStateChange' });
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
    }
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('Tentativa de login', { 
        component: 'AuthManager', 
        action: 'signIn',
        email: email.substring(0, 3) + '***' 
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Erro no login', error, { 
          component: 'AuthManager', 
          action: 'signIn',
          email: email.substring(0, 3) + '***' 
        });
        return { error };
      }

      logger.info('Login realizado com sucesso', { 
        component: 'AuthManager', 
        action: 'signIn',
        userId: data.user?.id?.substring(0, 8) + '***' 
      });

      return { error: null };
    } catch (error) {
      logger.error('Erro inesperado no login', error, { 
        component: 'AuthManager', 
        action: 'signIn' 
      });
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('Tentativa de logout', { 
        component: 'AuthManager', 
        action: 'signOut' 
      });

      // Limpar tokens de convite
      InviteTokenManager.clearTokenOnLogout();

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Erro no logout', error, { 
          component: 'AuthManager', 
          action: 'signOut' 
        });
        return { success: false, error };
      }

      logger.info('Logout realizado com sucesso', { 
        component: 'AuthManager', 
        action: 'signOut' 
      });

      return { success: true, error: null };
    } catch (error) {
      logger.error('Erro inesperado no logout', error, { 
        component: 'AuthManager', 
        action: 'signOut' 
      });
      return { success: false, error: error as Error };
    }
  }

  async handleInviteFlow({ token, inviteEmail, currentUser, inviteDetails }: {
    token: string;
    inviteEmail: string;
    currentUser: User | null;
    inviteDetails: any;
  }): Promise<string | null> {
    try {
      logger.info('Processando fluxo de convite', { 
        component: 'AuthManager', 
        action: 'handleInviteFlow',
        hasUser: !!currentUser,
        inviteEmail: inviteEmail.substring(0, 3) + '***',
        token: token.substring(0, 8) + '***'
      });

      // Armazenar token
      InviteTokenManager.storeToken(token, inviteDetails);

      // Se não há usuário logado, redirecionar para registro
      if (!currentUser) {
        logger.info('Usuário não logado - redirecionando para registro', { 
          component: 'AuthManager', 
          action: 'handleInviteFlow',
          redirectTo: '/register'
        });
        return `/register?token=${token}&invite=true`;
      }

      // Se usuário logado com e-mail correto, redirecionar para onboarding
      if (currentUser.email === inviteEmail) {
        logger.info('E-mail correto - redirecionando para onboarding', { 
          component: 'AuthManager', 
          action: 'handleInviteFlow',
          redirectTo: '/onboarding'
        });
        return `/onboarding?token=${token}&invite=true`;
      }

      // Se e-mail diferente, permanecer na tela de mismatch
      logger.warn('E-mail diferente - permanecendo na tela de mismatch', { 
        component: 'AuthManager', 
        action: 'handleInviteFlow',
        currentEmail: currentUser.email?.substring(0, 3) + '***',
        inviteEmail: inviteEmail.substring(0, 3) + '***'
      });
      return null;

    } catch (error) {
      logger.error('Erro no processamento do fluxo de convite', error, { 
        component: 'AuthManager', 
        action: 'handleInviteFlow',
        token: token.substring(0, 8) + '***'
      });
      return null;
    }
  }
}

export default AuthManager;
