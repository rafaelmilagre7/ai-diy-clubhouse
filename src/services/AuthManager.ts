
import { supabase } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, isAdminRole } from '@/lib/supabase';
import { InviteTokenManager } from '@/utils/inviteTokenManager';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';

type EventMap = {
  [K in AuthEventType]: AuthEventHandler<K>[];
};

export class AuthManager {
  private static instance: AuthManager | null = null;
  private eventListeners: EventMap = {
    stateChanged: [],
    error: [],
    timeout: []
  };

  public isInitialized: boolean = false;
  private currentState: AuthState = {
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

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  getState(): AuthState {
    return { ...this.currentState };
  }

  private emit<T extends AuthEventType>(event: T, data: Parameters<AuthEventHandler<T>>[0]) {
    const handlers = this.eventListeners[event] as AuthEventHandler<T>[];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        logger.error(`Error in ${event} handler:`, error);
      }
    });
  }

  on<T extends AuthEventType>(event: T, handler: AuthEventHandler<T>): () => void {
    this.eventListeners[event].push(handler as any);
    
    return () => {
      const handlers = this.eventListeners[event];
      const index = handlers.indexOf(handler as any);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  private setState(newState: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.emit('stateChanged', this.currentState);
    
    logger.info('[AUTH-MANAGER] Estado atualizado:', {
      component: 'AuthManager',
      action: 'state_updated',
      hasUser: !!this.currentState.user,
      isAdmin: this.currentState.isAdmin,
      onboardingRequired: this.currentState.onboardingRequired,
      isLoading: this.currentState.isLoading
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('[AUTH-MANAGER] Já inicializado, ignorando');
      return;
    }

    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager OTIMIZADO');
      
      this.setState({ isLoading: true, error: null });

      // Setup auth state listener PRIMEIRO
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Auth state change:', { event, hasSession: !!session });
        
        if (event === 'SIGNED_IN' && session) {
          await this.handleSignIn(session);
        } else if (event === 'SIGNED_OUT') {
          await this.handleSignOut();
        }
      });

      // Verificar sessão existente
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] Erro ao obter sessão:', error);
        this.setState({ error: error.message, isLoading: false });
        return;
      }

      if (session) {
        await this.handleSignIn(session);
      } else {
        // Verificar token de convite mesmo sem sessão
        const hasInviteToken = InviteTokenManager.hasToken();
        this.setState({ 
          isLoading: false,
          hasInviteToken,
          inviteDetails: null // CORRIGIDO: Removido método inexistente
        });
      }

      this.isInitialized = true;
      logger.info('[AUTH-MANAGER] ✅ Inicialização concluída');

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização:', error);
      this.setState({ 
        error: error instanceof Error ? error.message : 'Erro na inicialização',
        isLoading: false 
      });
      this.emit('error', error as Error);
    }
  }

  private async handleSignIn(session: Session): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 👤 Processando sign in');
      
      this.setState({ 
        session, 
        user: session.user,
        isLoading: true 
      });

      // Buscar perfil do usuário
      const profile = await this.fetchUserProfile(session.user.id);
      
      if (profile) {
        const isAdmin = isAdminRole(profile);
        
        // CORREÇÃO CRÍTICA: Admin bypass total do onboarding
        const onboardingRequired = !isAdmin && !profile.onboarding_completed;
        
        logger.info('[AUTH-MANAGER] 👑 Status do usuário:', {
          isAdmin,
          onboardingCompleted: profile.onboarding_completed,
          onboardingRequired,
          roleName: profile.user_roles?.name
        });

        this.setState({
          profile,
          isAdmin,
          isFormacao: profile.user_roles?.name === 'formacao',
          onboardingRequired,
          isLoading: false,
          error: null
        });
      } else {
        logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado para usuário');
        this.setState({ 
          onboardingRequired: true, // Usuário sem perfil precisa de onboarding
          isLoading: false 
        });
      }

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro no handleSignIn:', error);
      this.setState({ 
        error: error instanceof Error ? error.message : 'Erro ao processar login',
        isLoading: false 
      });
    }
  }

  private async handleSignOut(): Promise<void> {
    logger.info('[AUTH-MANAGER] 🚪 Processando sign out');
    
    // Limpar token de convite no logout
    InviteTokenManager.clearTokenOnLogout();
    
    this.setState({
      user: null,
      session: null,
      profile: null,
      isAdmin: false,
      isFormacao: false,
      onboardingRequired: false,
      hasInviteToken: false,
      inviteDetails: null,
      isLoading: false,
      error: null
    });
  }

  // CORREÇÃO: Implementação direta sem import inexistente
  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(id, name, description)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] Erro ao buscar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro na consulta do perfil:', error);
      return null;
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

      return {};
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

      // handleSignOut será chamado automaticamente pelo onAuthStateChange
      return { success: true };
    } catch (error) {
      this.setState({ 
        error: error instanceof Error ? error.message : 'Erro no logout',
        isLoading: false 
      });
      return { success: false, error: error as Error };
    }
  }

  // NOVA FUNÇÃO: Calcular redirecionamento baseado no estado
  getRedirectPath(): string {
    const state = this.getState();
    
    if (!state.user) {
      return '/login';
    }
    
    // CORREÇÃO CRÍTICA: Admin bypass total
    if (state.isAdmin) {
      logger.info('[AUTH-MANAGER] 👑 Admin detectado - redirecionando para /admin');
      return '/admin';
    }
    
    if (state.onboardingRequired) {
      logger.info('[AUTH-MANAGER] Onboarding obrigatório detectado');
      return '/onboarding';
    }
    
    if (state.profile?.user_roles?.name === 'formacao') {
      return '/formacao';
    }
    
    return '/dashboard';
  }

  // NOVA FUNÇÃO: Atualizar perfil após onboarding
  async updateProfileAfterOnboarding(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentState.user) return;
    
    try {
      // CORRIGIDO: Usar 'name' em vez de 'full_name'
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', this.currentState.user.id)
        .select(`
          *,
          user_roles!inner(id, name, description)
        `)
        .single();

      if (error) throw error;

      // Atualizar estado local
      this.setState({
        profile: data,
        onboardingRequired: false
      });

      logger.info('[AUTH-MANAGER] ✅ Perfil atualizado após onboarding');
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  }
}

export default AuthManager;
