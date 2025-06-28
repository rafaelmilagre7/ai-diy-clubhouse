
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
}

type AuthStateListener = (state: AuthState) => void;

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Set<AuthStateListener> = new Set();
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.state = {
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      error: null,
      isAdmin: false,
      isFormacao: false
    };
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  getState(): AuthState {
    return this.state;
  }

  on(event: 'stateChanged', listener: AuthStateListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] Inicializando...');
      
      this.setState({ isLoading: true, error: null });

      // Configurar listener de mudanças de autenticação
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] Auth state changed:', event);
        await this.handleAuthStateChange(event, session);
      });

      // Obter sessão atual
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] Erro ao obter sessão:', error);
        this.setState({ 
          error: error.message, 
          isLoading: false 
        });
        return;
      }

      await this.handleAuthStateChange('INITIAL_SESSION', session);
      
      logger.info('[AUTH-MANAGER] Inicialização concluída');
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro na inicialização:', error);
      this.setState({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false 
      });
    }
  }

  private async handleAuthStateChange(event: string, session: Session | null): Promise<void> {
    try {
      this.setState({ session, user: session?.user || null });

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
    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro ao processar mudança de estado:', error);
      this.setState({ 
        error: error instanceof Error ? error.message : 'Erro ao processar autenticação',
        isLoading: false 
      });
    }
  }

  private async loadUserProfile(userId: string, retryCount = 0): Promise<void> {
    const maxRetries = 3;
    
    try {
      logger.info('[AUTH-MANAGER] Carregando perfil:', { userId, attempt: retryCount + 1 });

      // CORREÇÃO: Usar query mais específica para evitar problemas de embed
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
        // Se erro de embed, tentar query alternativa
        if (error.message.includes('Could not embed') || error.code === 'PGRST301') {
          logger.warn('[AUTH-MANAGER] Erro de embed, tentando query alternativa');
          await this.loadUserProfileAlternative(userId);
          return;
        }
        throw error;
      }

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      const userProfile = profile as UserProfile;
      const isAdmin = userProfile.user_roles?.name === 'admin';
      const isFormacao = userProfile.user_roles?.name === 'formacao';

      this.setState({
        profile: userProfile,
        isAdmin,
        isFormacao,
        isLoading: false,
        error: null
      });

      logger.info('[AUTH-MANAGER] Perfil carregado com sucesso:', {
        role: userProfile.user_roles?.name,
        isAdmin,
        isFormacao
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro ao carregar perfil:', error);
      
      if (retryCount < maxRetries) {
        const delay = (retryCount + 1) * 1000;
        logger.info(`[AUTH-MANAGER] Tentando novamente em ${delay}ms...`);
        
        setTimeout(() => {
          this.loadUserProfile(userId, retryCount + 1);
        }, delay);
        return;
      }

      this.setState({
        error: error instanceof Error ? error.message : 'Erro ao carregar perfil',
        isLoading: false
      });
    }
  }

  private async loadUserProfileAlternative(userId: string): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] Usando query alternativa para perfil');

      // Query separada para perfil e role
      const [profileResult, roleResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_roles').select('*')
      ]);

      if (profileResult.error) throw profileResult.error;
      if (!profileResult.data) throw new Error('Perfil não encontrado');

      const profile = profileResult.data;
      let userRole = null;

      if (roleResult.data && profile.role_id) {
        userRole = roleResult.data.find(role => role.id === profile.role_id);
      }

      const userProfile: UserProfile = {
        ...profile,
        user_roles: userRole
      } as UserProfile;

      const isAdmin = userRole?.name === 'admin';
      const isFormacao = userRole?.name === 'formacao';

      this.setState({
        profile: userProfile,
        isAdmin,
        isFormacao,
        isLoading: false,
        error: null
      });

      logger.info('[AUTH-MANAGER] Perfil carregado via query alternativa:', {
        role: userRole?.name,
        isAdmin,
        isFormacao
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro na query alternativa:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      this.setState({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.setState({ error: error.message, isLoading: false });
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      this.setState({ error: errorMessage, isLoading: false });
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      this.setState({ isLoading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        this.setState({ error: error.message, isLoading: false });
        return { success: false, error };
      }

      this.setState({
        user: null,
        session: null,
        profile: null,
        isAdmin: false,
        isFormacao: false,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no logout';
      this.setState({ error: errorMessage, isLoading: false });
      return { success: false, error: error as Error };
    }
  }

  getRedirectPath(): string {
    const { user, profile, isAdmin, isFormacao } = this.state;

    if (!user) return '/login';

    if (isAdmin) return '/admin';
    if (isFormacao) return '/formacao';
    if (!profile?.onboarding_completed) return '/onboarding';

    return '/dashboard';
  }
}

export default AuthManager;
