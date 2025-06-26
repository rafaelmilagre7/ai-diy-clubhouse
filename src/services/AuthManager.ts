import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { SUPABASE_CONFIG } from '@/config/app';
import { UserProfile } from '@/lib/supabase';
import { AuthState } from '@/types/authTypes';
import { logger } from '@/utils/logger';

type EventType = 'stateChanged';
type EventHandler = (state: AuthState) => void;

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private eventHandlers: Map<EventType, Set<EventHandler>>;
  private initialized: boolean = false;

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
    this.eventHandlers = new Map();
    this.eventHandlers.set('stateChanged', new Set());
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Método público para verificar se foi inicializado
  public isInitialized(): boolean {
    return this.initialized;
  }

  private emit(event: EventType, data: AuthState): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  public on(event: EventType, handler: EventHandler): () => void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    }
    return () => {};
  }

  private updateState(updates: Partial<AuthState>): void {
    const newState = { ...this.state, ...updates };
    
    // Log de segurança usando configuração centralizada
    const config = SUPABASE_CONFIG.getSafeConfig();
    logger.info('[AUTH-MANAGER] 🔄 Estado atualizado', {
      component: 'AuthManager',
      action: 'state_update',
      hasUser: !!newState.user,
      isAdmin: newState.isAdmin,
      isLoading: newState.isLoading,
      error: newState.error,
      environment: config.environment,
      hasValidConfig: config.hasUrl && config.hasKey
    });
    
    this.state = newState;
    this.emit('stateChanged', this.state);
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public setInviteToken(token: string, inviteDetails: any): void {
    this.updateState({
      hasInviteToken: !!token,
      inviteDetails: inviteDetails || null
    });
  }

  public clearInviteToken(): void {
    this.updateState({
      hasInviteToken: false,
      inviteDetails: null
    });
  }

  public async completeOnboarding(): Promise<void> {
    if (!this.state.user) {
      logger.error('[AUTH-MANAGER] ❌ Não pode completar onboarding sem usuário', {
        component: 'AuthManager',
        action: 'complete_onboarding_no_user'
      });
      return;
    }

    try {
      this.updateState({ isLoading: true });

      const { data, error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', this.state.user.id)
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao completar onboarding', {
          component: 'AuthManager',
          action: 'complete_onboarding_error',
          error: error.message,
          userId: this.state.user.id
        });
        throw error;
      }

      this.updateState({
        profile: { ...this.state.profile, onboarding_completed: true },
        onboardingRequired: false,
        isLoading: false
      });

      logger.info('[AUTH-MANAGER] ✅ Onboarding completado com sucesso', {
        component: 'AuthManager',
        action: 'complete_onboarding_success',
        userId: this.state.user.id
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Falha ao atualizar perfil no onboarding', {
        component: 'AuthManager',
        action: 'onboarding_profile_update_error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao completar onboarding'
      });
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('[AUTH-MANAGER] ⚡ Já inicializado, pulando...', {
        component: 'AuthManager',
        action: 'initialize_skip'
      });
      return;
    }

    try {
      this.updateState({ isLoading: true, error: null });
      
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager', {
        component: 'AuthManager',
        action: 'initialize_start',
        timestamp: new Date().toISOString()
      });

      // Verificar configuração do Supabase
      if (!SUPABASE_CONFIG.isConfigured()) {
        throw new Error('Configuração do Supabase não encontrada');
      }

      // Get initial session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão', {
          component: 'AuthManager',
          action: 'get_session_error',
          error: sessionError.message
        });
        throw sessionError;
      }

      // Load user profile if session exists
      if (session?.user) {
        await this.loadUserProfile(session.user, session);
      } else {
        this.updateState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          onboardingRequired: false
        });
      }

      // Set up auth state change listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Auth state changed', {
          component: 'AuthManager',
          action: 'auth_state_change',
          event,
          hasSession: !!session
        });

        if (session?.user) {
          await this.loadUserProfile(session.user, session);
        } else {
          this.updateState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAdmin: false,
            isFormacao: false,
            onboardingRequired: false
          });
        }
      });

      this.initialized = true;
      
      logger.info('[AUTH-MANAGER] ✅ AuthManager inicializado com sucesso', {
        component: 'AuthManager',
        action: 'initialize_success',
        hasSession: !!session,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', {
        component: 'AuthManager',
        action: 'initialize_error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro de inicialização'
      });
      
      throw error;
    }
  }

  private async loadUserProfile(user: User, session: Session): Promise<void> {
    try {
      this.updateState({ isLoading: true });

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            description,
            permissions
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil', {
          component: 'AuthManager',
          action: 'load_profile_error',
          error: error.message,
          userId: user.id
        });
        throw error;
      }

      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';
      const onboardingRequired = !profile?.onboarding_completed;

      this.updateState({
        user,
        session,
        profile: profile as UserProfile,
        isLoading: false,
        error: null,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao carregar dados do usuário', {
        component: 'AuthManager',
        action: 'load_user_data_error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados do usuário'
      });
    }
  }

  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      this.updateState({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.updateState({ isLoading: false, error: error.message });
        return { error };
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      this.updateState({ isLoading: false, error: errorMessage });
      return { error: error as Error };
    }
  }

  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      this.updateState({ isLoading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        this.updateState({ isLoading: false, error: error.message });
        return { success: false, error };
      }

      this.updateState({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        error: null,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: false
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no logout';
      this.updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: error as Error };
    }
  }
}

export default AuthManager;
