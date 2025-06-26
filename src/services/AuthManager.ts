
import { supabase, UserProfile } from '@/lib/supabase';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { AuthState, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { logger } from '@/utils/logger';
import { EventEmitter } from 'events';

// Eventos do AuthManager - compatível com EventEmitter
interface AuthManagerEventMap {
  stateChanged: [AuthState];
  error: [Error];
  timeout: [];
}

export class AuthManager extends EventEmitter {
  private static instance: AuthManager | null = null;
  private state: AuthState;
  public isInitialized: boolean = false;

  private constructor() {
    super();
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

  getState(): AuthState {
    return { ...this.state };
  }

  async initialize(): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager', {
        component: 'AuthManager',
        action: 'initialize',
        message: 'Iniciando inicialização'
      });

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão', {
          component: 'AuthManager',
          action: 'get_session_error',
          message: `Erro: ${error.message}`
        });
        throw error;
      }

      if (session?.user) {
        await this.handleAuthChange('SIGNED_IN', session);
      } else {
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
      }

      // Setup auth listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Auth state change', {
          component: 'AuthManager',
          action: 'auth_state_change',
          message: `Evento: ${event}`
        });

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (session) {
              await this.handleAuthChange(event, session);
            }
            break;
          case 'SIGNED_OUT':
            this.handleSignOut();
            break;
          case 'PASSWORD_RECOVERY':
            logger.info('[AUTH-MANAGER] 🔑 Password recovery', {
              component: 'AuthManager',
              action: 'password_recovery',
              message: 'Password recovery initiated'
            });
            break;
          case 'INITIAL_SESSION':
            logger.info('[AUTH-MANAGER] 🎯 Initial session', {
              component: 'AuthManager',
              action: 'initial_session',
              message: 'Initial session processed'
            });
            break;
        }
      });

      this.isInitialized = true;
      
      logger.info('[AUTH-MANAGER] ✅ AuthManager inicializado', {
        component: 'AuthManager',
        action: 'initialize_complete',
        message: 'Inicialização concluída com sucesso'
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', {
        component: 'AuthManager',
        action: 'initialize_error',
        message: `Erro: ${(error as Error).message}`
      });
      
      this.updateState({
        isLoading: false,
        error: (error as Error).message
      });
      
      this.emit('error', error as Error);
      throw error;
    }
  }

  private async handleAuthChange(event: AuthChangeEvent, session: Session): Promise<void> {
    try {
      this.updateState({ isLoading: true });

      const profile = await this.fetchUserProfile(session.user.id);
      
      // Verificar role admin usando user_roles.name
      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';
      
      // Verificar onboarding obrigatório
      const onboardingRequired = !profile?.onboarding_completed && !isAdmin;

      this.updateState({
        user: session.user,
        session,
        profile,
        isLoading: false,
        error: null,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

      logger.info('[AUTH-MANAGER] 👤 Usuário autenticado', {
        component: 'AuthManager',
        action: 'user_authenticated',
        message: `Usuário: ${session.user.email}, Admin: ${isAdmin}`
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro no handleAuthChange', {
        component: 'AuthManager',
        action: 'handle_auth_change_error',
        message: `Erro: ${(error as Error).message}`
      });
      
      this.updateState({
        isLoading: false,
        error: (error as Error).message
      });
    }
  }

  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
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
        logger.error('[AUTH-MANAGER] ❌ Erro ao buscar perfil', {
          component: 'AuthManager',
          action: 'fetch_profile_error',
          message: `Erro: ${error.message}`
        });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na fetchUserProfile', {
        component: 'AuthManager',
        action: 'fetch_user_profile_error',
        message: `Erro: ${(error as Error).message}`
      });
      return null;
    }
  }

  private handleSignOut(): void {
    logger.info('[AUTH-MANAGER] 🚪 Processando logout', {
      component: 'AuthManager',
      action: 'handle_sign_out',
      message: 'Processando logout'
    });

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
  }

  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔐 Tentando login', {
        component: 'AuthManager',
        action: 'sign_in_attempt',
        message: `Email: ${email}`
      });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login', {
          component: 'AuthManager',
          action: 'sign_in_error',
          message: `Erro: ${error.message}`
        });
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado', {
        component: 'AuthManager',
        action: 'sign_in_success',
        message: 'Login realizado com sucesso'
      });
      
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🚪 Tentando logout', {
        component: 'AuthManager',
        action: 'sign_out_attempt',
        message: 'Iniciando processo de logout'
      });

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout', {
          component: 'AuthManager',
          action: 'sign_out_error',
          message: `Erro: ${error.message}`
        });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado', {
        component: 'AuthManager',
        action: 'sign_out_success',
        message: 'Logout realizado com sucesso'
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  getRedirectPath(): string {
    // Admin tem prioridade absoluta
    if (this.state.isAdmin) {
      return '/admin';
    }
    
    // Sem usuário = login
    if (!this.state.user) {
      return '/login';
    }
    
    // Onboarding obrigatório
    if (this.state.onboardingRequired) {
      return '/onboarding';
    }
    
    // Formação tem área específica
    if (this.state.isFormacao) {
      return '/formacao';
    }
    
    // Padrão = dashboard
    return '/dashboard';
  }

  async handleInviteFlow(options: {
    token: string;
    inviteEmail: string;
    currentUser: User | null;
    inviteDetails: any;
  }): Promise<string | null> {
    // Implementação simplificada para o fluxo de convite
    const { token, inviteEmail, currentUser, inviteDetails } = options;
    
    logger.info('[AUTH-MANAGER] 🎯 Processando fluxo de convite', {
      component: 'AuthManager',
      action: 'handle_invite_flow',
      message: `Email do convite: ${inviteEmail}`
    });

    if (!currentUser) {
      // Usuário não logado - ir para login com token
      return `/login?token=${token}&invite=true`;
    }

    if (currentUser.email !== inviteEmail) {
      // Email diferente - mostrar tela de conflito
      return null; // Vai ser tratado no componente
    }

    // Email correto - ir para onboarding
    return `/onboarding?token=${token}&invite=true`;
  }

  // Métodos de EventEmitter tipados
  on<K extends keyof AuthManagerEventMap>(
    event: K,
    listener: (...args: AuthManagerEventMap[K]) => void
  ): this {
    return super.on(event, listener);
  }

  off<K extends keyof AuthManagerEventMap>(
    event: K,
    listener: (...args: AuthManagerEventMap[K]) => void
  ): this {
    return super.off(event, listener);
  }

  emit<K extends keyof AuthManagerEventMap>(
    event: K,
    ...args: AuthManagerEventMap[K]
  ): boolean {
    return super.emit(event, ...args);
  }
}

export default AuthManager;
