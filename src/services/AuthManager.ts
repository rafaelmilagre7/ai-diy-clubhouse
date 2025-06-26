
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { AuthState, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { OnboardingValidator } from '@/utils/onboardingValidator';
import { logger } from '@/utils/logger';

type EventEmitter = {
  [K in AuthEventType]: AuthEventHandler<K>[];
};

export class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private eventEmitters: EventEmitter;
  private initPromise: Promise<void> | null = null;
  private isInitialized = false;
  private redirectLoopProtection = new Set<string>();
  private profileRetryCount = 0;
  private readonly MAX_PROFILE_RETRIES = 3;

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

    this.eventEmitters = {
      stateChanged: [],
      error: [],
      timeout: []
    };

    logger.info('[AUTH-MANAGER] 🏗️ Instância criada', {
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

  public isInitialized(): boolean {
    return this.isInitialized;
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
    this.eventEmitters[event].push(handler);
    return () => {
      const index = this.eventEmitters[event].indexOf(handler);
      if (index > -1) {
        this.eventEmitters[event].splice(index, 1);
      }
    };
  }

  private emit<T extends AuthEventType>(event: T, data: Parameters<AuthEventHandler<T>>[0]): void {
    this.eventEmitters[event].forEach(handler => handler(data as any));
  }

  public async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager', {
        component: 'AuthManager',
        action: 'initialize_start'
      });

      // Setup auth state listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Auth state changed', {
          event,
          hasSession: !!session,
          userId: session?.user?.id?.substring(0, 8) + '***' || 'none'
        });

        await this.handleAuthStateChange(event, session);
      });

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Erro ao obter sessão: ${error.message}`);
      }

      await this.handleAuthStateChange('INITIAL_SESSION', session);
      
      this.isInitialized = true;
      
      logger.info('[AUTH-MANAGER] ✅ AuthManager inicializado com sucesso', {
        hasSession: !!session,
        isInitialized: this.isInitialized
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', error);
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  private async handleAuthStateChange(event: string, session: Session | null): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🔄 Processando mudança de estado', {
        event,
        hasSession: !!session,
        currentUserId: this.state.user?.id?.substring(0, 8) + '***' || 'none'
      });

      if (!session) {
        // No session - reset state
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
        return;
      }

      // Update user and session immediately
      this.updateState({
        user: session.user,
        session: session,
        isLoading: true,
        error: null
      });

      // Load profile with retry mechanism
      await this.loadUserProfile(session.user.id);

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao processar mudança de estado', error);
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 👤 Carregando perfil do usuário', {
        userId: userId.substring(0, 8) + '***',
        attempt: this.profileRetryCount + 1
      });

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles:role_id (
            id,
            name,
            permissions
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(`Erro ao carregar perfil: ${error.message}`);
      }

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      const typedProfile = profile as UserProfile;
      
      // CORREÇÃO CRÍTICA: Determinar se é admin ANTES de verificar onboarding
      const isAdmin = typedProfile.user_roles?.name === 'admin';
      const isFormacao = typedProfile.user_roles?.name === 'formacao';

      logger.info('[AUTH-MANAGER] 🔍 Perfil carregado - verificando roles e onboarding', {
        userId: userId.substring(0, 8) + '***',
        userRole: typedProfile.user_roles?.name || 'none',
        isAdmin,
        isFormacao,
        onboardingCompleted: typedProfile.onboarding_completed,
        hasCompanyName: !!typedProfile.company_name,
        hasIndustry: !!typedProfile.industry
      });

      // CORREÇÃO CRÍTICA: Admin NUNCA precisa de onboarding
      let onboardingRequired = false;
      
      if (isAdmin) {
        logger.info('[AUTH-MANAGER] 👑 ADMIN DETECTADO - Bypass total do onboarding', {
          userId: userId.substring(0, 8) + '***',
          userRole: typedProfile.user_roles?.name
        });
        onboardingRequired = false;
      } else {
        // Para usuários normais, usar validação padrão
        onboardingRequired = OnboardingValidator.isRequired(typedProfile);
        
        logger.info('[AUTH-MANAGER] 🎯 Usuário comum - verificação de onboarding', {
          userId: userId.substring(0, 8) + '***',
          userRole: typedProfile.user_roles?.name,
          onboardingRequired,
          onboardingCompleted: typedProfile.onboarding_completed
        });
      }

      // Update final state
      this.updateState({
        profile: typedProfile,
        isAdmin,
        isFormacao,
        onboardingRequired,
        isLoading: false,
        error: null
      });

      // Reset retry count on success
      this.profileRetryCount = 0;

      logger.info('[AUTH-MANAGER] ✅ Estado final atualizado', {
        userId: userId.substring(0, 8) + '***',
        isAdmin,
        isFormacao,
        onboardingRequired,
        profileLoaded: true
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil', error, {
        userId: userId.substring(0, 8) + '***',
        attempt: this.profileRetryCount + 1,
        maxRetries: this.MAX_PROFILE_RETRIES
      });

      // Retry mechanism
      if (this.profileRetryCount < this.MAX_PROFILE_RETRIES) {
        this.profileRetryCount++;
        const delay = this.profileRetryCount * 1000;
        
        logger.warn('[AUTH-MANAGER] 🔄 Tentando novamente carregar perfil', {
          userId: userId.substring(0, 8) + '***',
          delay,
          attempt: this.profileRetryCount
        });
        
        setTimeout(() => {
          this.loadUserProfile(userId);
        }, delay);
        return;
      }

      // Max retries reached
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar perfil'
      });
    }
  }

  private updateState(newState: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    // Log state changes for debugging
    if (previousState.onboardingRequired !== this.state.onboardingRequired) {
      logger.info('[AUTH-MANAGER] 🔄 Onboarding requirement changed', {
        from: previousState.onboardingRequired,
        to: this.state.onboardingRequired,
        isAdmin: this.state.isAdmin,
        userRole: this.state.profile?.user_roles?.name
      });
    }

    this.emit('stateChanged', this.state);
  }

  // MÉTODO CORRIGIDO: getRedirectPath com proteção contra loops e bypass para admin
  public getRedirectPath(): string {
    const currentPath = window.location.pathname;
    const userId = this.state.user?.id?.substring(0, 8) + '***' || 'anonymous';
    
    // Proteção contra loops de redirecionamento
    const protectionKey = `${userId}-${currentPath}`;
    if (this.redirectLoopProtection.has(protectionKey)) {
      logger.warn('[AUTH-MANAGER] 🔄 Loop de redirecionamento detectado - forçando /dashboard', {
        userId,
        currentPath,
        protectionKey
      });
      this.redirectLoopProtection.clear();
      return '/dashboard';
    }
    
    this.redirectLoopProtection.add(protectionKey);
    
    // Limpar proteção após 5 segundos
    setTimeout(() => {
      this.redirectLoopProtection.delete(protectionKey);
    }, 5000);

    logger.info('[AUTH-MANAGER] 🎯 Calculando redirecionamento', {
      userId,
      currentPath,
      hasUser: !!this.state.user,
      hasProfile: !!this.state.profile,
      isAdmin: this.state.isAdmin,
      isFormacao: this.state.isFormacao,
      onboardingRequired: this.state.onboardingRequired,
      userRole: this.state.profile?.user_roles?.name
    });

    // Sem usuário = login
    if (!this.state.user) {
      logger.info('[AUTH-MANAGER] ➡️ Redirecionando para login (sem usuário)');
      return '/login';
    }

    // Aguardar perfil se necessário
    if (!this.state.profile) {
      logger.info('[AUTH-MANAGER] ⏳ Aguardando perfil...');
      return currentPath; // Manter na rota atual
    }

    // CORREÇÃO CRÍTICA: Admin NUNCA vai para onboarding
    if (this.state.isAdmin) {
      logger.info('[AUTH-MANAGER] 👑 ADMIN - Redirecionando para /admin', {
        userId,
        userRole: this.state.profile.user_roles?.name
      });
      return '/admin';
    }

    // Formação vai para área especializada
    if (this.state.isFormacao) {
      logger.info('[AUTH-MANAGER] 🎓 FORMAÇÃO - Redirecionando para /formacao', {
        userId,
        userRole: this.state.profile.user_roles?.name
      });
      return '/formacao';
    }

    // Usuários comuns: verificar onboarding
    if (this.state.onboardingRequired) {
      logger.info('[AUTH-MANAGER] 📋 Usuário comum - Onboarding obrigatório', {
        userId,
        userRole: this.state.profile.user_roles?.name,
        onboardingCompleted: this.state.profile.onboarding_completed
      });
      return '/onboarding';
    }

    // Dashboard padrão para membros
    logger.info('[AUTH-MANAGER] 🏠 Redirecionando para dashboard', {
      userId,
      userRole: this.state.profile.user_roles?.name
    });
    return '/dashboard';
  }

  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      this.updateState({ isLoading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso', {
        userId: data.user?.id?.substring(0, 8) + '***'
      });

      return { error: null };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Erro no login');
      logger.error('[AUTH-MANAGER] ❌ Erro no login', authError);
      
      this.updateState({
        isLoading: false,
        error: authError.message
      });
      
      return { error: authError };
    }
  }

  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      this.updateState({ isLoading: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Clear redirect loop protection
      this.redirectLoopProtection.clear();
      
      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso');
      return { success: true, error: null };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Erro no logout');
      logger.error('[AUTH-MANAGER] ❌ Erro no logout', authError);
      
      return { success: false, error: authError };
    }
  }
}

export default AuthManager;
