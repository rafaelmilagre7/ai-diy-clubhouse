
import { User, Session, AuthError } from '@supabase/supabase-js';
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
}

type StateChangeCallback = (state: AuthState) => void;

export default class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Set<StateChangeCallback> = new Set();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.state = {
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      error: null,
      isAdmin: false,
      isFormacao: false,
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

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] Inicializando...');
      
      // Configurar listener de mudanças de auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] Auth state changed:', event);
        
        this.setState({
          session,
          user: session?.user || null,
          isLoading: true
        });

        if (session?.user) {
          await this.loadUserProfile(session.user.id);
        } else {
          this.setState({
            profile: null,
            isAdmin: false,
            isFormacao: false,
            isLoading: false
          });
        }
      });

      // Obter sessão inicial
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] Erro ao obter sessão:', error);
        this.setState({ error: error.message, isLoading: false });
        return;
      }

      this.setState({
        session,
        user: session?.user || null
      });

      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.setState({ isLoading: false });
      }

      this.initialized = true;
      logger.info('[AUTH-MANAGER] Inicializado com sucesso');

    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro na inicialização:', error);
      this.setState({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false
      });
    }
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] Carregando perfil do usuário:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner (
            id,
            name,
            description,
            permissions,
            is_system
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] Erro ao carregar perfil:', error);
        this.setState({ 
          error: 'Erro ao carregar perfil do usuário',
          isLoading: false 
        });
        return;
      }

      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';

      this.setState({
        profile: profile as UserProfile,
        isAdmin,
        isFormacao,
        error: null,
        isLoading: false
      });

      logger.info('[AUTH-MANAGER] Perfil carregado:', {
        userId,
        role: profile?.user_roles?.name,
        isAdmin,
        isFormacao
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro ao carregar perfil:', error);
      this.setState({
        error: 'Erro inesperado ao carregar perfil',
        isLoading: false
      });
    }
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
