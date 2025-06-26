import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getUserProfile, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { AuthState } from '@/types/authTypes';

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Array<(state: AuthState) => void> = [];
  public isInitialized: boolean = false; // CORRIGIDO: propriedade pública única

  private constructor() {
    this.state = {
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      error: null,
      isAdmin: false,
      isFormacao: false,
      onboardingRequired: false
    };
    
    logger.info('[AUTH-MANAGER] 🏗️ AuthManager instanciado', {
      component: 'AuthManager',
      action: 'constructor'
    });
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public on(event: string, listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    logger.info('[AUTH-MANAGER] ➕ Listener adicionado', {
      component: 'AuthManager',
      event
    });

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      logger.info('[AUTH-MANAGER] ➖ Listener removido', {
        component: 'AuthManager',
        event
      });
    };
  }

  private emit(event: string, state: AuthState): void {
    this.listeners.forEach(listener => {
      listener(state);
    });
    
    logger.info('[AUTH-MANAGER] 📢 Emitindo evento', {
      component: 'AuthManager',
      event,
      listeners: this.listeners.length
    });
  }

  public getState(): AuthState {
    return this.state;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('[AUTH-MANAGER] ⚠️ Já inicializado - ignorando', {
        component: 'AuthManager',
        action: 'initialize_skip'
      });
      return;
    }

    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager', {
        component: 'AuthManager',
        action: 'initialize_start'
      });

      // Setup auth state listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Estado de auth alterado', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user
        });

        await this.handleAuthStateChange(event, session);
      });

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão inicial', error);
        this.updateState({ 
          isLoading: false, 
          error: error.message 
        });
        return;
      }

      if (session) {
        await this.handleAuthStateChange('SIGNED_IN', session);
      } else {
        this.updateState({ 
          isLoading: false,
          onboardingRequired: false
        });
      }

      this.isInitialized = true;
      logger.info('[AUTH-MANAGER] ✅ AuthManager inicializado com sucesso');
      
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização', error);
      this.updateState({ 
        isLoading: false, 
        error: (error as Error).message 
      });
    }
  }

  private async handleAuthStateChange(event: string, session: Session | null): Promise<void> {
    try {
      if (event === 'SIGNED_IN' && session?.user) {
        logger.info('[AUTH-MANAGER] 👤 Usuário logado - carregando perfil', {
          userId: session.user.id.substring(0, 8) + '***'
        });

        // Load user profile
        const profile = await getUserProfile(session.user.id);
        
        if (!profile) {
          logger.warn('[AUTH-MANAGER] ⚠️ Perfil não encontrado', {
            userId: session.user.id.substring(0, 8) + '***'
          });
          
          this.updateState({
            user: session.user,
            session,
            profile: null,
            isLoading: false,
            isAdmin: false,
            isFormacao: false,
            onboardingRequired: true
          });
          return;
        }

        // Determine user role and permissions
        const isAdmin = profile.user_roles?.name === 'admin';
        const isFormacao = profile.user_roles?.name === 'formacao';
        
        // CORREÇÃO CRÍTICA: Admin NUNCA precisa de onboarding
        let onboardingRequired = false;
        
        if (isAdmin) {
          logger.info('[AUTH-MANAGER] 👑 ADMIN detectado - bypass total do onboarding', {
            userId: session.user.id.substring(0, 8) + '***',
            userRole: profile.user_roles?.name,
            onboardingCompleted: profile.onboarding_completed
          });
          onboardingRequired = false; // ADMIN nunca precisa
        } else {
          // Para usuários comuns, verificar onboarding
          onboardingRequired = !profile.onboarding_completed;
          
          logger.info('[AUTH-MANAGER] 👥 Usuário comum - verificando onboarding', {
            userId: session.user.id.substring(0, 8) + '***',
            userRole: profile.user_roles?.name,
            onboardingCompleted: profile.onboarding_completed,
            onboardingRequired
          });
        }

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

      } else if (event === 'SIGNED_OUT') {
        logger.info('[AUTH-MANAGER] 🚪 Usuário deslogado');
        
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
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao processar mudança de estado', error);
      
      this.updateState({
        isLoading: false,
        error: (error as Error).message
      });
    }
  }

  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
    
    logger.info('[AUTH-MANAGER] 📊 Estado atualizado', {
      hasUser: !!this.state.user,
      hasProfile: !!this.state.profile,
      isAdmin: this.state.isAdmin,
      isLoading: this.state.isLoading,
      onboardingRequired: this.state.onboardingRequired,
      error: this.state.error
    });
  }

  // Método para calcular redirecionamento baseado no estado atual
  public getRedirectPath(): string {
    const { user, profile, isAdmin, onboardingRequired } = this.state;

    // Sem usuário = login
    if (!user) {
      logger.info('[AUTH-MANAGER] 🔄 Redirecionamento: /login (sem usuário)');
      return '/login';
    }

    // BYPASS CRÍTICO: Admin sempre vai para /admin
    if (isAdmin) {
      logger.info('[AUTH-MANAGER] 👑 Redirecionamento ADMIN: /admin', {
        userId: user.id.substring(0, 8) + '***'
      });
      return '/admin';
    }

    // Usuário comum precisa de onboarding
    if (onboardingRequired) {
      logger.info('[AUTH-MANAGER] 🔄 Redirecionamento: /onboarding (obrigatório)', {
        userId: user.id.substring(0, 8) + '***',
        userRole: profile?.user_roles?.name
      });
      return '/onboarding';
    }

    // Formação vai para área específica
    if (profile?.user_roles?.name === 'formacao') {
      logger.info('[AUTH-MANAGER] 🔄 Redirecionamento: /formacao');
      return '/formacao';
    }

    // Padrão = dashboard
    logger.info('[AUTH-MANAGER] 🔄 Redirecionamento: /dashboard (padrão)');
    return '/dashboard';
  }

  // Authentication methods
  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔐 Tentativa de login', { email });
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login', error);
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso');
      return {};
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro no processo de login', error);
      return { error: error as Error };
    }
  }

  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🚪 Iniciando logout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout', error);
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso');
      return { success: true };
    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro no processo de logout', error);
      return { success: false, error: error as Error };
    }
  }
}

export default AuthManager;
