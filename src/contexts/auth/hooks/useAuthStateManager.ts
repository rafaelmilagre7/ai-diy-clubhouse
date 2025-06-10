
import { useCallback, useRef } from "react";
import { supabase } from '@/lib/supabase';
import { getUserProfileFresh } from '@/hooks/auth/utils/authSessionUtils';
import { getUserRoleName } from '@/lib/supabase/types';

interface AuthStateManagerParams {
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  setIsLoading: (loading: boolean) => void;
}

// CORREÇÃO CRÍTICA: Estado global thread-safe para evitar race conditions
class AuthSetupManager {
  private static instance: AuthSetupManager;
  private setupInProgress: boolean = false;
  private lastSetupTimestamp: number = 0;
  private readonly DEBOUNCE_TIME = 200;
  private readonly MAX_SETUP_TIME = 8000;
  private activeTimeoutId: number | null = null;

  static getInstance(): AuthSetupManager {
    if (!AuthSetupManager.instance) {
      AuthSetupManager.instance = new AuthSetupManager();
    }
    return AuthSetupManager.instance;
  }

  isSetupInProgress(): boolean {
    return this.setupInProgress;
  }

  shouldDebounce(): boolean {
    const now = Date.now();
    return (now - this.lastSetupTimestamp) < this.DEBOUNCE_TIME;
  }

  startSetup(): boolean {
    if (this.setupInProgress) {
      console.log("🔄 [AUTH] Setup já em progresso, aguardando...");
      return false;
    }

    const now = Date.now();
    if (this.shouldDebounce()) {
      console.log(`🔄 [AUTH] Setup ignorado por debounce (${now - this.lastSetupTimestamp}ms < ${this.DEBOUNCE_TIME}ms)`);
      return false;
    }

    this.setupInProgress = true;
    this.lastSetupTimestamp = now;
    console.log("🚀 [AUTH] Setup iniciado de forma thread-safe");

    // Timeout absoluto para evitar loading infinito
    this.activeTimeoutId = window.setTimeout(() => {
      console.warn("⚠️ [AUTH] Timeout absoluto atingido, forçando fim do setup");
      this.endSetup();
    }, this.MAX_SETUP_TIME);

    return true;
  }

  endSetup(): void {
    this.setupInProgress = false;
    if (this.activeTimeoutId) {
      clearTimeout(this.activeTimeoutId);
      this.activeTimeoutId = null;
    }
    console.log("✅ [AUTH] Setup finalizado de forma thread-safe");
  }
}

export const useAuthStateManager = (params?: AuthStateManagerParams) => {
  const setupManager = useRef(AuthSetupManager.getInstance());
  
  // Se não temos parâmetros, retornar função mock
  if (!params) {
    return { 
      setupAuthSession: async () => ({ 
        success: false, 
        error: new Error("Authentication state manager not properly initialized") 
      }) 
    };
  }
  
  const { setSession, setUser, setProfile, setIsLoading } = params;
  
  const setupAuthSession = useCallback(async () => {
    // CORREÇÃO CRÍTICA: Usar manager thread-safe
    if (!setupManager.current.startSetup()) {
      return { success: true, error: null };
    }

    try {
      console.log("🔄 [AUTH] Iniciando setup da sessão com proteção thread-safe");
      
      // Tentar obter sessão com timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session fetch timeout")), 3000)
      );
      
      let sessionResult;
      try {
        sessionResult = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: any } };
      } catch (timeoutError) {
        console.warn("⚠️ [AUTH] Timeout na busca da sessão, tentando sem timeout...");
        sessionResult = await supabase.auth.getSession();
      }
      
      const { data: { session } } = sessionResult;
      
      // Validar integridade da sessão
      if (session && (!session.user || !session.access_token)) {
        console.warn("⚠️ [AUTH] Sessão inválida detectada, limpando...");
        setSession(null);
        setUser(null);
        setProfile(null);
        return { success: true, error: null };
      }
      
      setSession(session);
      
      if (session?.user) {
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        console.log(`✅ [AUTH] Sessão válida encontrada: ${userId.substring(0, 8)}***`);
        setUser(session.user);
        
        // CORREÇÃO: Usar getUserProfileFresh em momentos críticos
        try {
          console.log(`🔍 [AUTH] Carregando perfil fresh para: ${userId.substring(0, 8)}***`);
          
          const profilePromise = getUserProfileFresh(
            userId,
            userEmail,
            session.user.user_metadata?.name
          );
          
          const profileTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Profile fetch timeout")), 4000)
          );
          
          const profile = await Promise.race([
            profilePromise,
            profileTimeoutPromise
          ]) as any;
          
          if (profile) {
            // CORREÇÃO: Usar getUserRoleName() para consistência
            const roleName = getUserRoleName(profile);
            console.log(`📊 [AUTH] Perfil carregado com sucesso: role=${roleName}`);
            setProfile(profile);
            
            // Atualizar metadados em background (não crítico) usando helper consistente
            supabase.auth.updateUser({
              data: { role: roleName }
            }).catch(error => {
              console.warn("⚠️ [AUTH] Erro ao atualizar metadados:", error.message);
            });
          } else {
            console.warn("⚠️ [AUTH] Perfil não encontrado");
            setProfile(null);
          }
        } catch (profileError) {
          console.error("❌ [AUTH] Erro ao processar perfil:", profileError);
          setProfile(null);
        }
      } else {
        console.log("ℹ️ [AUTH] Nenhuma sessão ativa");
        setUser(null);
        setProfile(null);
      }
      
      return { success: true, error: null };
      
    } catch (error) {
      console.error("❌ [AUTH] Erro crítico no setup:", error);
      
      // Em caso de erro, limpar estado
      setSession(null);
      setUser(null);
      setProfile(null);
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erro desconhecido de autenticação')
      };
    } finally {
      // CORREÇÃO CRÍTICA: Sempre finalizar setup de forma thread-safe
      setupManager.current.endSetup();
      setIsLoading(false);
      console.log("✅ [AUTH] Setup finalizado, isLoading = false");
    }
  }, [setSession, setUser, setProfile, setIsLoading]);
  
  return { setupAuthSession };
};
