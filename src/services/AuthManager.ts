
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole, isFormacaoRole } from '@/lib/supabase';
import { AuthState, AuthManagerEvents } from '@/types/authTypes';
import { BrowserEventEmitter } from '@/utils/eventEmitter';
import { logger } from '@/utils/logger';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

class AuthManager extends BrowserEventEmitter<AuthManagerEvents> {
  private static instance: AuthManager;
  private state: AuthState;
  private isInitializing: boolean = false;
  private initialized: boolean = false;

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
    if (this.initialized || this.isInitializing) {
      logger.info('[AUTH-MANAGER] 🔄 Já inicializado ou inicializando');
      return;
    }

    this.isInitializing = true;
    logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager');

    try {
      // Setup auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          logger.info('[AUTH-MANAGER] 📡 Auth state change:', { event, hasSession: !!session });
          
          this.updateState({
            session,
            user: session?.user || null,
            isLoading: false
          });

          if (event === 'SIGNED_IN' && session?.user) {
            setTimeout(() => this.loadUserProfile(session.user.id), 100);
          } else if (event === 'SIGNED_OUT') {
            this.updateState({
              profile: null,
              isAdmin: false,
              isFormacao: false,
              onboardingRequired: false
            });
          }
        }
      );

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão:', error);
        this.updateState({ 
          error: error.message, 
          isLoading: false 
        });
      } else {
        logger.info('[AUTH-MANAGER] ✅ Sessão inicial:', { hasSession: !!session });
        
        this.updateState({
          session,
          user: session?.user || null,
          isLoading: !!session?.user
        });

        if (session?.user) {
          await this.loadUserProfile(session.user.id);
        } else {
          this.updateState({ isLoading: false });
        }
      }

      this.initialized = true;
      logger.info('[AUTH-MANAGER] ✅ Inicialização concluída');

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização:', error);
      this.updateState({ 
        error: (error as Error).message, 
        isLoading: false 
      });
    } finally {
      this.isInitializing = false;
    }
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 👤 Carregando perfil do usuário:', userId.substring(0, 8) + '***');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil:', error);
        this.updateState({ 
          error: error.message,
          isLoading: false 
        });
        return;
      }

      if (profile) {
        const typedProfile = profile as unknown as UserProfile;
        const roleName = getUserRoleName(typedProfile);
        const isAdmin = isAdminRole(typedProfile);
        const isFormacao = isFormacaoRole(typedProfile);
        const onboardingRequired = !typedProfile.onboarding_completed;

        logger.info('[AUTH-MANAGER] ✅ Perfil carregado:', {
          userId: userId.substring(0, 8) + '***',
          roleName,
          isAdmin,
          isFormacao,
          onboardingCompleted: typedProfile.onboarding_completed
        });

        this.updateState({
          profile: typedProfile,
          isAdmin,
          isFormacao,
          onboardingRequired,
          isLoading: false,
          error: null
        });
      } else {
        logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado');
        this.updateState({ 
          isLoading: false,
          onboardingRequired: true
        });
      }
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro crítico ao carregar perfil:', error);
      this.updateState({ 
        error: (error as Error).message,
        isLoading: false 
      });
    }
  }

  private updateState(updates: Partial<AuthState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Detectar mudanças significativas
    const significantChanges = [
      'user', 'profile', 'isAdmin', 'isFormacao', 'error'
    ].some(key => previousState[key] !== this.state[key]);

    if (significantChanges) {
      logger.info('[AUTH-MANAGER] 📊 Estado atualizado:', {
        hasUser: !!this.state.user,
        hasProfile: !!this.state.profile,
        isAdmin: this.state.isAdmin,
        isFormacao: this.state.isFormacao,
        isLoading: this.state.isLoading,
        error: this.state.error
      });
    }

    this.emit('stateChanged', this.state);
  }

  async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔐 Tentativa de login:', { email });
      
      this.updateState({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login:', error);
        this.updateState({ 
          error: error.message, 
          isLoading: false 
        });
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso');
      return { error: null };

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro crítico no login:', error);
      const errorMessage = (error as Error).message;
      this.updateState({ 
        error: errorMessage, 
        isLoading: false 
      });
      return { error: error as Error };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🚪 Realizando logout');
      
      this.updateState({ isLoading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout:', error);
        this.updateState({ 
          error: error.message, 
          isLoading: false 
        });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso');
      
      // Reset state
      this.updateState({
        user: null,
        session: null,
        profile: null,
        isAdmin: false,
        isFormacao: false,
        onboardingRequired: false,
        isLoading: false,
        error: null
      });

      return { success: true, error: null };

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro crítico no logout:', error);
      this.updateState({ 
        error: (error as Error).message, 
        isLoading: false 
      });
      return { success: false, error: error as Error };
    }
  }

  getRedirectPath(): string {
    const { user, profile, isAdmin, isFormacao, onboardingRequired } = this.state;

    if (!user) {
      return '/login';
    }

    // Admin sempre vai para /admin
    if (isAdmin) {
      return '/admin';
    }

    // Se onboarding é obrigatório, redirecionar para onboarding
    if (onboardingRequired) {
      return '/onboarding';
    }

    // Formação vai para área específica
    if (isFormacao) {
      return '/formacao';
    }

    // Padrão para membros
    return '/dashboard';
  }
}

export default AuthManager;
