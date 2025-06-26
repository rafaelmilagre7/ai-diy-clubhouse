
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { fetchUserProfile, createUserProfileIfNeeded } from '@/contexts/auth/utils/profileUtils/userProfileFunctions';

// Interface para o estado da autenticação
interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  onboardingRequired: boolean;
  hasInviteToken: boolean;
  inviteDetails: any | null;
}

// Tipo para listeners de eventos
type EventListener = (state: AuthState) => void;

/**
 * AuthManager - Gerenciador centralizado de autenticação
 * Singleton que gerencia estado de auth, perfis e eventos
 */
class AuthManager {
  private static instance: AuthManager;
  private state: AuthState;
  private listeners: Map<string, EventListener> = new Map();
  private initialized = false;

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
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Getter para o estado atual
  public getState(): AuthState {
    return { ...this.state };
  }

  // Sistema de eventos
  public on(event: string, listener: EventListener): () => void {
    this.listeners.set(event, listener);
    return () => this.listeners.delete(event);
  }

  public off(event: string, listener: EventListener): void {
    this.listeners.delete(event);
  }

  private emit(event: string, state: AuthState): void {
    const listener = this.listeners.get(event);
    if (listener) {
      listener(state);
    }
  }

  // Atualizar estado e notificar listeners
  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', this.state);
  }

  // Inicialização do AuthManager
  public async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('[AUTH-MANAGER] ✅ Já inicializado, retornando estado atual');
      return;
    }

    try {
      logger.info('[AUTH-MANAGER] 🚀 Inicializando AuthManager');
      
      // Configurar listener de mudanças de auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info('[AUTH-MANAGER] 📡 Auth state changed:', { event, hasSession: !!session });
        await this.handleAuthStateChange(event, session);
      });

      // Obter sessão inicial
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro ao obter sessão inicial:', error);
        this.updateState({ error: error.message, isLoading: false });
        return;
      }

      if (session) {
        logger.info('[AUTH-MANAGER] 🔑 Sessão inicial encontrada');
        await this.handleAuthStateChange('SIGNED_IN', session);
      } else {
        logger.info('[AUTH-MANAGER] 🔓 Nenhuma sessão inicial');
        this.updateState({ isLoading: false });
      }

      this.initialized = true;
      logger.info('[AUTH-MANAGER] ✅ AuthManager inicializado com sucesso');

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro na inicialização:', error);
      this.updateState({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false 
      });
    }
  }

  // Manipular mudanças no estado de autenticação
  private async handleAuthStateChange(event: string, session: Session | null): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 🔄 Processando mudança de auth:', { event, hasSession: !!session });

      if (event === 'SIGNED_OUT' || !session) {
        logger.info('[AUTH-MANAGER] 🚪 Usuário deslogado');
        this.updateState({
          user: null,
          session: null,
          profile: null,
          isAdmin: false,
          isFormacao: false,
          onboardingRequired: false,
          hasInviteToken: false,
          inviteDetails: null,
          error: null,
          isLoading: false
        });
        return;
      }

      // Usuário logado
      const user = session.user;
      logger.info('[AUTH-MANAGER] 👤 Usuário logado:', { userId: user.id.substring(0, 8) + '***' });

      this.updateState({
        user,
        session,
        isLoading: true,
        error: null
      });

      // Carregar perfil do usuário
      await this.loadUserProfile(user.id, user.email);

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao processar mudança de auth:', error);
      this.updateState({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false
      });
    }
  }

  // Carregar perfil do usuário
  private async loadUserProfile(userId: string, email?: string): Promise<void> {
    try {
      logger.info('[AUTH-MANAGER] 📊 Carregando perfil do usuário:', { userId: userId.substring(0, 8) + '***' });

      let profile = await fetchUserProfile(userId);

      // Se não encontrou perfil, tentar criar
      if (!profile && email) {
        logger.info('[AUTH-MANAGER] 🔨 Criando perfil para novo usuário');
        profile = await createUserProfileIfNeeded(userId, email);
      }

      if (profile) {
        logger.info('[AUTH-MANAGER] ✅ Perfil carregado:', { 
          profileId: profile.id.substring(0, 8) + '***',
          hasRole: !!profile.user_roles?.name
        });

        // Determinar roles
        const isAdmin = profile.user_roles?.name === 'admin';
        const isFormacao = profile.user_roles?.name === 'formacao';
        const onboardingRequired = !profile.onboarding_completed;

        this.updateState({
          profile,
          isAdmin,
          isFormacao,
          onboardingRequired,
          isLoading: false
        });

      } else {
        logger.warn('[AUTH-MANAGER] ⚠️ Não foi possível carregar/criar perfil');
        this.updateState({
          error: 'Não foi possível carregar o perfil do usuário',
          isLoading: false
        });
      }

    } catch (error) {
      logger.error('[AUTH-MANAGER] ❌ Erro ao carregar perfil:', error);
      this.updateState({
        error: error instanceof Error ? error.message : 'Erro ao carregar perfil',
        isLoading: false
      });
    }
  }

  // Método para login
  public async signIn(email: string, password: string): Promise<{ error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🔐 Tentando login:', { email });
      
      this.updateState({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no login:', error);
        this.updateState({ error: error.message, isLoading: false });
        return { error };
      }

      logger.info('[AUTH-MANAGER] ✅ Login realizado com sucesso');
      return { error: null };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no login:', error);
      this.updateState({ error: errorMessage, isLoading: false });
      return { error: error as Error };
    }
  }

  // Método para logout
  public async signOut(): Promise<{ success: boolean; error?: Error | null }> {
    try {
      logger.info('[AUTH-MANAGER] 🚪 Realizando logout');
      
      this.updateState({ isLoading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('[AUTH-MANAGER] ❌ Erro no logout:', error);
        this.updateState({ error: error.message, isLoading: false });
        return { success: false, error };
      }

      logger.info('[AUTH-MANAGER] ✅ Logout realizado com sucesso');
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('[AUTH-MANAGER] ❌ Erro inesperado no logout:', error);
      this.updateState({ error: errorMessage, isLoading: false });
      return { success: false, error: error as Error };
    }
  }

  // Método para verificar se usuário pode acessar uma rota
  public canAccessRoute(requiredRole?: 'admin' | 'formacao'): boolean {
    if (!this.state.user) return false;
    if (!requiredRole) return true;
    
    if (requiredRole === 'admin') return this.state.isAdmin;
    if (requiredRole === 'formacao') return this.state.isFormacao;
    
    return false;
  }

  // Método para refresh do perfil
  public async refreshProfile(): Promise<void> {
    if (this.state.user) {
      await this.loadUserProfile(this.state.user.id, this.state.user.email);
    }
  }
}

export default AuthManager;
