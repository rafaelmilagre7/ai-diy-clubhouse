import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { logger } from '@/utils/logger';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

class AuthManager {
  private static instance: AuthManager;
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
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
  
  private listeners: Map<AuthEventType, Set<AuthEventHandler<any>>> = new Map();
  
  // CORRIGIDO: Propriedade pública
  public isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private redirectLoopCount = 0;
  private readonly MAX_REDIRECTS = 3;

  private constructor() {
    this.setupAuthListener();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('[AUTH-MANAGER] ✅ Já inicializado - retornando estado atual');
      return;
    }

    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager');
      
      this.setState({ isLoading: true, error: null });

      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user) {
        logger.info('[AUTH-MANAGER] 👤 Sessão encontrada', {
          userId: session.user.id.substring(0, 8) + '***',
          email: session.user.email
        });
        
        await this.handleAuthStateChange('SIGNED_IN', session);
      } else {
        logger.info('[AUTH-MANAGER] 🚫 Nenhuma sessão encontrada');
        this.setState({ 
          isLoading: false, 
          user: null, 
          session: null, 
          profile: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false
        });
      }

      this.isInitialized = true;
      logger.info('[AUTH-MANAGER] ✅ Inicialização concluída');
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', error);
      this.setState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
      throw error;
    }
  }

  private setupAuthListener(): void {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('[AUTH-MANAGER] 📡 onAuthStateChange', { event, hasSession: !!session });
      
      setTimeout(() => {
        this.handleAuthStateChange(event, session);
      }, 0);
    });
  }

  private async handleAuthStateChange(event: string, session: Session | null): Promise<void> {
    try {
      this.setState({ isLoading: true });

      if (event === 'SIGNED_OUT' || !session?.user) {
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
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        logger.info('[AUTH-MANAGER] 🔑 Processando login do usuário', {
          userId: session.user.id.substring(0, 8) + '***',
          email: session.user.email
        });

        // Buscar perfil do usuário
        const profile = await this.fetchUserProfile(session.user.id);
        
        // Determinar roles
        const isAdmin = this.determineIsAdmin(profile);
        const isFormacao = this.determineIsFormacao(profile);
        
        // CORREÇÃO CRÍTICA: Admin bypass total do onboarding
        let onboardingRequired = false;
        if (!isAdmin) {
          onboardingRequired = this.determineOnboardingRequired(profile);
        }

        // Verificar convite
        const hasInviteToken = InviteTokenManager.hasToken();
        let inviteDetails = null;
        if (hasInviteToken) {
          try {
            inviteDetails = InviteTokenManager.getStoredInviteDetails();
          } catch (error) {
            logger.warn('[AUTH-MANAGER] ⚠️ Erro ao recuperar detalhes do convite', error);
          }
        }

        logger.info('[AUTH-MANAGER] 📊 Estado calculado:', {
          userId: session.user.id.substring(0, 8) + '***',
          isAdmin,
          isFormacao,
          onboardingRequired,
          hasInviteToken,
          roleName: profile?.user_roles?.name
        });

        // CORREÇÃO CRÍTICA: Log específico para admin
        if (isAdmin) {
          logger.info('[AUTH-MANAGER] 👑 ADMIN DETECTADO - Bypass total do onboarding', {
            userId: session.user.id.substring(0, 8) + '***',
            onboardingRequired: false,
            profileOnboardingCompleted: profile?.onboarding_completed
          });
        }

        this.setState({
          user: session.user,
          session,
          profile,
          isLoading: false,
          error: null,
          isAdmin,
          isFormacao,
          onboardingRequired,
          hasInviteToken,
          inviteDetails
        });
      }
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro no handleAuthStateChange', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro na autenticação'
      });
    }
  }

  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
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
        logger.warn('[AUTH-MANAGER] ⚠️ Erro ao buscar perfil', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na busca do perfil', error);
      return null;
    }
  }

  private determineIsAdmin(profile: UserProfile | null): boolean {
    return profile?.user_roles?.name === 'Admin';
  }

  private determineIsFormacao(profile: UserProfile | null): boolean {
    return profile?.user_roles?.name === 'Formação';
  }

  private determineOnboardingRequired(profile: UserProfile | null): boolean {
    if (!profile) return true;
    
    // Se onboarding_completed está explicitamente marcado como true
    if (profile.onboarding_completed === true) {
      return false;
    }
    
    // Se onboarding_completed está explicitamente marcado como false ou null
    if (profile.onboarding_completed === false || profile.onboarding_completed === null) {
      return true;
    }
    
    // Fallback: verificar campos essenciais
    const hasEssentialFields = !!(
      profile.company_name && 
      profile.industry && 
      profile.full_name
    );
    
    return !hasEssentialFields;
  }

  getRedirectPath(): string {
    const currentState = this.getState();
    
    // PROTEÇÃO: Loop de redirecionamento
    if (this.redirectLoopCount >= this.MAX_REDIRECTS) {
      logger.error('[AUTH-MANAGER] 🔄 Loop de redirecionamento detectado - forçando /dashboard');
      this.redirectLoopCount = 0;
      return '/dashboard';
    }
    
    this.redirectLoopCount++;
    
    // CORREÇÃO CRÍTICA: Admin vai direto para /admin
    if (currentState.isAdmin) {
      logger.info('[AUTH-MANAGER] 👑 Admin detectado - redirecionando para /admin');
      this.redirectLoopCount = 0;
      return '/admin';
    }
    
    // Formação vai para /formacao
    if (currentState.isFormacao) {
      logger.info('[AUTH-MANAGER] 🎓 Formação detectado - redirecionando para /formacao');
      this.redirectLoopCount = 0;
      return '/formacao';
    }
    
    // Onboarding obrigatório para usuários comuns
    if (currentState.onboardingRequired) {
      logger.info('[AUTH-MANAGER] 📝 Onboarding obrigatório - redirecionando para /onboarding');
      this.redirectLoopCount = 0;
      
      // Preservar token se necessário
      if (currentState.hasInviteToken) {
        const token = InviteTokenManager.getToken();
        return token ? `/onboarding?token=${token}` : '/onboarding';
      }
      
      return '/onboarding';
    }
    
    // Default: dashboard
    logger.info('[AUTH-MANAGER] 🏠 Redirecionamento padrão - /dashboard');
    this.redirectLoopCount = 0;
    return '/dashboard';
  }

  on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(handler);
    
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  private emit<T extends AuthEventType>(event: T, data: Parameters<AuthEventHandler<T>>[0]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error(`[AUTH-MANAGER] Erro no handler do evento ${event}`, error);
        }
      });
    }
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      this.setState({ isLoading: true, error: null });
      
      const { error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        this.setState({ isLoading: false, error: error.message });
        return { error };
      }
      
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      this.setState({ isLoading: false, error: errorMessage });
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      this.setState({ isLoading: true });
      
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        this.setState({ isLoading: false, error: error.message });
        return { success: false, error };
      }
      
      // Limpar estado
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
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no logout';
      this.setState({ isLoading: false, error: errorMessage });
      return { success: false, error: error as Error };
    }
  }

  getState(): AuthState {
    return { ...this.state };
  }

  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
  }
}

export default AuthManager;
