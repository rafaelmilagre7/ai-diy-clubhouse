
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName } from '@/lib/supabase/types';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Map<AuthEventType, Set<AuthEventHandler<any>>> = new Map();
  private _isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private lastRedirectDecision: { path: string; reason: string; timestamp: number } | null = null;

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

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  getState(): AuthState {
    return { ...this.state };
  }

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
          logger.error(`[AUTH-MANAGER] Erro no listener do evento ${event}:`, error);
        }
      });
    }
  }

  private setState(newState: Partial<AuthState>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    logger.info('[AUTH-MANAGER] 📊 Estado atualizado:', {
      changes: Object.keys(newState),
      hasUser: !!this.state.user,
      isAdmin: this.state.isAdmin,
      onboardingRequired: this.state.onboardingRequired,
      isLoading: this.state.isLoading,
      previousAdmin: prevState.isAdmin,
      previousOnboarding: prevState.onboardingRequired
    });

    this.emit('stateChanged', this.state);
  }

  private handleError(error: any, context: string): void {
    const errorMessage = error?.message || String(error) || 'Erro desconhecido';
    
    logger.error(`[AUTH-MANAGER] ❌ Erro em ${context}:`, error);
    
    const errorState: Partial<AuthState> = {
      error: errorMessage,
      isLoading: false
    };
    
    this.setState(errorState);
    this.emit('error', new Error(errorMessage));
  }

  async initialize(): Promise<void> {
    if (this._isInitialized) {
      logger.info('[AUTH-MANAGER] ✅ Já inicializado');
      return;
    }

    if (this.initPromise) {
      logger.info('[AUTH-MANAGER] ⏳ Aguardando inicialização em progresso');
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🚀 Iniciando inicialização');
      
      this.setState({ isLoading: true, error: null });

      // Setup auth listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Auth state change:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id?.substring(0, 8) + '***' || 'none'
        });

        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => this.handleSignIn(session.user, session), 0);
        } else if (event === 'SIGNED_OUT') {
          this.handleSignOut();
        }
      });

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user) {
        await this.handleSignIn(session.user, session);
      } else {
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

      this._isInitialized = true;
      logger.info('[AUTH-MANAGER] ✅ Inicialização concluída');

    } catch (error) {
      this.handleError(error, 'initialization');
      this._isInitialized = true; // Mark as initialized even on error
    }
  }

  private async handleSignIn(user: User, session: Session): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 👤 Processando sign-in:', {
        userId: user.id.substring(0, 8) + '***',
        email: user.email
      });

      this.setState({
        user,
        session,
        isLoading: true // Keep loading while fetching profile
      });

      const profile = await this.fetchUserProfile(user.id, user.email, user.user_metadata?.name);
      
      if (profile) {
        const isAdmin = getUserRoleName(profile) === 'admin';
        const isFormacao = getUserRoleName(profile) === 'formacao';
        
        // CORREÇÃO CRÍTICA: Admin NUNCA precisa de onboarding
        const onboardingRequired = isAdmin ? false : this.checkOnboardingRequired(profile, isAdmin);

        logger.info('[AUTH-MANAGER] 👑 Usuário processado:', {
          userId: user.id.substring(0, 8) + '***',
          isAdmin,
          isFormacao,
          onboardingRequired,
          onboardingCompleted: profile.onboarding_completed,
          adminBypass: isAdmin ? 'SIM - ONBOARDING PULADO' : 'NÃO'
        });

        this.setState({
          profile,
          isAdmin,
          isFormacao,
          onboardingRequired,
          isLoading: false,
          error: null
        });
      } else {
        logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado');
        this.setState({
          profile: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: true,
          isLoading: false
        });
      }
    } catch (error) {
      this.handleError(error, 'handleSignIn');
    }
  }

  private handleSignOut(): void {
    logger.info('[AUTH-MANAGER] 👋 Processando sign-out');
    
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

  private async fetchUserProfile(userId: string, email?: string, name?: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name
          )
        `)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!profile && email) {
        logger.info('[AUTH-MANAGER] 📝 Criando perfil para novo usuário');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email,
            name: name || null,
            onboarding_completed: false
          })
          .select(`
            *,
            user_roles (
              id,
              name
            )
          `)
          .single();

        if (createError) {
          throw createError;
        }

        return newProfile;
      }

      return profile;
    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro ao buscar/criar perfil:', error);
      return null;
    }
  }

  private checkOnboardingRequired(profile: UserProfile, isAdmin: boolean): boolean {
    // REGRA CRÍTICA: Admin NUNCA precisa de onboarding
    if (isAdmin) {
      logger.info('[AUTH-MANAGER] 👑 ADMIN DETECTADO - Onboarding pulado automaticamente', {
        profileId: profile.id.substring(0, 8) + '***',
        roleName: profile.user_roles?.name,
        onboardingCompleted: profile.onboarding_completed
      });
      return false;
    }

    const required = profile.onboarding_completed !== true;
    
    logger.info('[AUTH-MANAGER] 📋 Verificação de onboarding:', {
      profileId: profile.id.substring(0, 8) + '***',
      roleName: profile.user_roles?.name,
      onboardingCompleted: profile.onboarding_completed,
      required,
      reason: required ? 'onboarding_não_completado' : 'onboarding_completado'
    });

    return required;
  }

  getRedirectPath(): string {
    const currentTime = Date.now();
    
    // Prevenir loops detectando redirecionamentos repetitivos
    if (this.lastRedirectDecision && 
        (currentTime - this.lastRedirectDecision.timestamp) < 1000 &&
        this.lastRedirectDecision.path === '/onboarding') {
      logger.warn('[AUTH-MANAGER] 🔄 LOOP DETECTADO - Forçando /dashboard', {
        lastDecision: this.lastRedirectDecision,
        timeDiff: currentTime - this.lastRedirectDecision.timestamp
      });
      
      this.lastRedirectDecision = {
        path: '/dashboard',
        reason: 'loop_prevention',
        timestamp: currentTime
      };
      
      return '/dashboard';
    }

    const { user, profile, isAdmin, onboardingRequired, isLoading } = this.state;

    // Aguardar carregamento
    if (isLoading || !user) {
      const decision = {
        path: '/login',
        reason: isLoading ? 'loading' : 'no_user',
        timestamp: currentTime
      };
      
      logger.info('[AUTH-MANAGER] 🔄 Redirecionamento:', decision);
      this.lastRedirectDecision = decision;
      return decision.path;
    }

    // ADMIN TEM PRIORIDADE ABSOLUTA
    if (isAdmin) {
      const decision = {
        path: '/admin',
        reason: 'admin_priority',
        timestamp: currentTime
      };
      
      logger.info('[AUTH-MANAGER] 👑 ADMIN - Redirecionamento direto:', decision);
      this.lastRedirectDecision = decision;
      return decision.path;
    }

    // Aguardar perfil
    if (!profile) {
      const decision = {
        path: '/dashboard',
        reason: 'no_profile_fallback',
        timestamp: currentTime
      };
      
      logger.info('[AUTH-MANAGER] 🔄 Redirecionamento:', decision);
      this.lastRedirectDecision = decision;
      return decision.path;
    }

    // Onboarding obrigatório APENAS para não-admin
    if (onboardingRequired) {
      const decision = {
        path: '/onboarding',
        reason: 'onboarding_required',
        timestamp: currentTime
      };
      
      logger.info('[AUTH-MANAGER] 📋 Onboarding obrigatório:', decision);
      this.lastRedirectDecision = decision;
      return decision.path;
    }

    // Formação
    if (profile.user_roles?.name === 'formacao') {
      const decision = {
        path: '/formacao',
        reason: 'formacao_role',
        timestamp: currentTime
      };
      
      logger.info('[AUTH-MANAGER] 🎓 Formação:', decision);
      this.lastRedirectDecision = decision;
      return decision.path;
    }

    // Dashboard padrão
    const decision = {
      path: '/dashboard',
      reason: 'default_dashboard',
      timestamp: currentTime
    };
    
    logger.info('[AUTH-MANAGER] 🏠 Dashboard padrão:', decision);
    this.lastRedirectDecision = decision;
    return decision.path;
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔐 Iniciando login');
      
      this.setState({ isLoading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        logger.info('[AUTH-MANAGER] ✅ Login bem-sucedido');
        return { error: null };
      }

      throw new Error('Login falhou');
    } catch (error) {
      this.handleError(error, 'signIn');
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 👋 Iniciando logout');
      
      this.setState({ isLoading: true });

      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        throw error;
      }

      logger.info('[AUTH-MANAGER] ✅ Logout bem-sucedido');
      return { success: true };
    } catch (error) {
      this.handleError(error, 'signOut');
      return { success: false, error: error as Error };
    }
  }
}

export default AuthManager;
