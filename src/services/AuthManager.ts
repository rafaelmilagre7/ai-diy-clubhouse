
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { AuthState, AuthManagerEvents, AuthEventType, AuthEventHandler } from '@/types/authTypes';
import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';

class AuthManager extends BrowserEventEmitter<AuthManagerEvents> {
  private static instance: AuthManager;
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

  private constructor() {
    super();
    this.setupAuthStateListener();
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

  private updateState(updates: Partial<AuthState>) {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    logger.debug('[AUTH-MANAGER] Estado atualizado:', {
      changes: updates,
      newState: this.state
    });

    this.emit('stateChanged', this.state);
  }

  private setupAuthStateListener() {
    logger.info('[AUTH-MANAGER] Configurando listener de autenticação');
    
    supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('[AUTH-MANAGER] Evento de auth recebido:', { event, hasSession: !!session });
      
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          this.updateState({ 
            user: session.user, 
            session, 
            isLoading: true,
            error: null 
          });
          
          setTimeout(async () => {
            await this.loadUserProfile(session.user.id);
          }, 100);
          
        } else if (event === 'SIGNED_OUT') {
          this.updateState({
            user: null,
            session: null,
            profile: null,
            isAdmin: false,
            isFormacao: false,
            isLoading: false,
            error: null,
            onboardingRequired: false,
            hasInviteToken: false,
            inviteDetails: null
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          this.updateState({ session, error: null });
        }
      } catch (error) {
        logger.error('[AUTH-MANAGER] Erro no listener de auth:', error);
        this.updateState({ 
          error: 'Erro no processamento de autenticação',
          isLoading: false 
        });
      }
    });
  }

  async initialize(): Promise<void> {
    logger.info('[AUTH-MANAGER] Inicializando...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user) {
        this.updateState({ 
          user: session.user, 
          session,
          isLoading: true 
        });
        
        await this.loadUserProfile(session.user.id);
      } else {
        this.updateState({ 
          isLoading: false,
          error: null
        });
      }
      
      logger.info('[AUTH-MANAGER] Inicialização concluída');
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro na inicialização:', error);
      this.updateState({ 
        error: 'Falha na inicialização',
        isLoading: false 
      });
      throw error;
    }
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      logger.debug('[AUTH-MANAGER] Carregando perfil do usuário:', { userId });
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            name,
            permissions
          )
        `)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const isAdmin = profile?.user_roles?.name === 'admin';
      const isFormacao = profile?.user_roles?.name === 'formacao';
      const onboardingRequired = !profile?.onboarding_completed;

      this.updateState({
        profile: profile || null,
        isAdmin,
        isFormacao,
        onboardingRequired,
        isLoading: false,
        error: null
      });

      logger.info('[AUTH-MANAGER] Perfil carregado com sucesso:', {
        hasProfile: !!profile,
        isAdmin,
        isFormacao,
        onboardingRequired
      });

    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro ao carregar perfil:', error);
      this.updateState({ 
        error: 'Erro ao carregar perfil do usuário',
        isLoading: false 
      });
    }
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    logger.info('[AUTH-MANAGER] Tentativa de login:', { email });
    
    try {
      this.updateState({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.updateState({ 
          error: error.message,
          isLoading: false 
        });
        return { error };
      }

      logger.info('[AUTH-MANAGER] Login realizado com sucesso');
      return { error: null };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no login';
      logger.error('[AUTH-MANAGER] Erro no login:', error);
      this.updateState({ 
        error: errorMessage,
        isLoading: false 
      });
      return { error: error instanceof Error ? error : new Error(errorMessage) };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    logger.info('[AUTH-MANAGER] Iniciando logout');
    
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        logger.error('[AUTH-MANAGER] Erro no logout:', error);
        return { success: false, error };
      }
      
      logger.info('[AUTH-MANAGER] Logout realizado com sucesso');
      return { success: true };
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] Erro inesperado no logout:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erro desconhecido no logout')
      };
    }
  }
}

export default AuthManager;
