import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  onboardingRequired: boolean;
}

type StateChangeCallback = (state: AuthState) => void;

export default class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Set<StateChangeCallback> = new Set();
  private initialized = false;
  private emergencyMode = false;
  private initializationTimeout: NodeJS.Timeout | null = null;

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
    };
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  getState(): AuthState {
    return { ...this.state };
  }

  on(event: 'stateChanged', callback: StateChangeCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private setState(updates: Partial<AuthState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(callback => callback(this.state));
  }

  // CORREÇÃO 1: Timeout de Emergência - Força carregamento após 10s
  private setupEmergencyTimeout() {
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
    }

    this.initializationTimeout = setTimeout(() => {
      if (this.state.isLoading && !this.initialized) {
        logger.warn('[AUTH-MANAGER] 🚨 TIMEOUT DE EMERGÊNCIA - Forçando acesso básico');
        
        this.emergencyMode = true;
        this.setState({
          isLoading: false,
          error: 'Carregamento demorado - Acesso de emergência ativado'
        });

        // Se há usuário mas não há perfil, permitir acesso básico
        if (this.state.user && !this.state.profile) {
          logger.info('[AUTH-MANAGER] 🔧 Criando perfil básico para acesso de emergência');
          
          const basicProfile: Partial<UserProfile> = {
            id: this.state.user.id,
            email: this.state.user.email || '',
            name: this.state.user.user_metadata?.name || null,
            onboarding_completed: false
          };

          this.setState({
            profile: basicProfile as UserProfile,
            onboardingRequired: true
          });
        }

        this.initialized = true;
      }
    }, 10000); // 10 segundos
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando com timeout de emergência...');
      
      // CORREÇÃO 1: Configurar timeout de emergência
      this.setupEmergencyTimeout();
      
      // Configurar listener de mudanças de auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Auth state changed:', event);
        
        this.setState({
          session,
          user: session?.user || null,
          isLoading: true
        });

        if (session?.user) {
          await this.loadUserProfileWithTimeout(session.user.id);
        } else {
          this.setState({
            profile: null,
            isAdmin: false,
            isFormacao: false,
            onboardingRequired: false,
            isLoading: false
          });
        }
      });

      // Obter sessão inicial com timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout na obtenção da sessão')), 5000)
      );

      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão:', error);
        this.setState({ error: error.message, isLoading: false });
        return;
      }

      this.setState({
        session,
        user: session?.user || null
      });

      if (session?.user) {
        await this.loadUserProfileWithTimeout(session.user.id);
      } else {
        this.setState({ isLoading: false });
      }

      // Limpar timeout se inicialização foi bem-sucedida
      if (this.initializationTimeout) {
        clearTimeout(this.initializationTimeout);
        this.initializationTimeout = null;
      }

      this.initialized = true;
      logger.info('[AUTH-MANAGER] ✅ Inicializado com sucesso');

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização:', error);
      this.setState({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false
      });
    }
  }

  // CORREÇÃO 2: Query de Perfil Mais Robusta com Timeout
  private async loadUserProfileWithTimeout(userId: string): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 👤 Carregando perfil com timeout:', userId);
      
      const profilePromise = supabase
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
        .maybeSingle(); // CORREÇÃO: usar maybeSingle ao invés de single

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout no carregamento do perfil')), 8000)
      );

      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil:', error);
        
        // CORREÇÃO: Fallback - criar perfil básico mesmo com erro
        if (!this.emergencyMode) {
          logger.info('[AUTH-MANAGER] 🔧 Criando perfil básico devido ao erro');
          
          const user = this.state.user;
          const basicProfile: Partial<UserProfile> = {
            id: userId,
            email: user?.email || '',
            name: user?.user_metadata?.name || null,
            onboarding_completed: false
          };

          this.setState({
            profile: basicProfile as UserProfile,
            isAdmin: false,
            isFormacao: false,
            onboardingRequired: true,
            error: null,
            isLoading: false
          });
        }
        return;
      }

      // CORREÇÃO: Verificar se perfil existe, se não, usar dados básicos
      if (!profile) {
        logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado, usando dados básicos');
        
        const user = this.state.user;
        const basicProfile: Partial<UserProfile> = {
          id: userId,
          email: user?.email || '',
          name: user?.user_metadata?.name || null,
          onboarding_completed: false
        };

        this.setState({
          profile: basicProfile as UserProfile,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: true,
          error: null,
          isLoading: false
        });
        return;
      }

      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';
      const onboardingRequired = !profile?.onboarding_completed && !isAdmin;

      this.setState({
        profile: profile as UserProfile,
        isAdmin,
        isFormacao,
        onboardingRequired,
        error: null,
        isLoading: false
      });

      logger.info('[AUTH-MANAGER] ✅ Perfil carregado:', {
        userId,
        role: profile?.user_roles?.name,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil:', error);
      
      // CORREÇÃO: Sempre tentar fallback em caso de erro
      const user = this.state.user;
      const basicProfile: Partial<UserProfile> = {
        id: userId,
        email: user?.email || '',
        name: user?.user_metadata?.name || null,
        onboarding_completed: false
      };

      this.setState({
        profile: basicProfile as UserProfile,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: true,
        error: 'Perfil carregado em modo básico',
        isLoading: false
      });
    }
  }

  // CORREÇÃO 3: Método para forçar acesso (usado pelo botão de emergência)
  forceAccess(): void {
    logger.warn('[AUTH-MANAGER] 🚨 ACESSO FORÇADO PELO USUÁRIO');
    
    this.emergencyMode = true;
    
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
      this.initializationTimeout = null;
    }

    // Se há usuário, criar perfil básico
    if (this.state.user) {
      const basicProfile: Partial<UserProfile> = {
        id: this.state.user.id,
        email: this.state.user.email || '',
        name: this.state.user.user_metadata?.name || null,
        onboarding_completed: false
      };

      this.setState({
        profile: basicProfile as UserProfile,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: true,
        isLoading: false,
        error: null
      });
    } else {
      this.setState({
        isLoading: false,
        error: 'Acesso forçado - Redirecionando para login'
      });
    }

    this.initialized = true;
  }

  getRedirectPath(): string {
    const { profile, isAdmin } = this.state;
    
    if (isAdmin) return '/admin';
    if (profile?.user_roles?.name === 'formacao') return '/formacao';
    return '/dashboard';
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      this.setState({ error: null, isLoading: true });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.setState({ error: error.message, isLoading: false });
        return { error };
      }

      return {};
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro no login';
      this.setState({ error: errorMsg, isLoading: false });
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      this.setState({ isLoading: true });
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        this.setState({ error: error.message, isLoading: false });
        return { success: false, error };
      }

      // Limpar estado local
      this.setState({
        user: null,
        session: null,
        profile: null,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: false,
        error: null,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro no logout';
      this.setState({ error: errorMsg, isLoading: false });
      return { success: false, error: error as Error };
    }
  }
}
