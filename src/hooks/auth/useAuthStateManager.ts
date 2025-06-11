
import { useCallback } from "react";
import { supabase } from '@/lib/supabase';
import { processUserProfile } from './utils/authSessionUtils';

interface AuthStateManagerParams {
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStateManager = (params: AuthStateManagerParams) => {
  const { setSession, setUser, setProfile, setIsLoading } = params;
  
  // Setup auth session function with optimized performance and better error handling
  const setupAuthSession = useCallback(async () => {
    try {
      console.log("[AUTH-STATE-MANAGER] Verificando sessão atual");
      
      // CORREÇÃO CRÍTICA 1: Timeout reduzido para 2 segundos com retry mais agressivo
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session fetch timeout")), 2000)
      );
      
      let sessionResult;
      try {
        // Race between actual fetch and timeout
        sessionResult = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: any } };
      } catch (timeoutError) {
        // Em caso de timeout, tentar uma vez mais sem timeout
        console.warn("[AUTH-STATE-MANAGER] Session fetch timeout, trying again without timeout...");
        sessionResult = await supabase.auth.getSession();
      }
      
      const { data: { session } } = sessionResult;
      setSession(session);
      
      if (session?.user) {
        console.log("[AUTH-STATE-MANAGER] Sessão ativa encontrada:", session.user.id.substring(0, 8) + '***');
        setUser(session.user);
        
        // Process user profile with error handling
        try {
          const profile = await processUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name
          );
          
          setProfile(profile);
          
          console.log("[AUTH-STATE-MANAGER] Perfil processado com sucesso:", {
            hasProfile: !!profile,
            roleName: profile?.user_roles?.name || 'sem role'
          });
          
        } catch (profileError) {
          console.error("[AUTH-STATE-MANAGER] Erro ao processar perfil do usuário:", profileError);
          setProfile(null);
        }
      } else {
        console.log("[AUTH-STATE-MANAGER] Nenhuma sessão ativa encontrada");
        setUser(null);
        setProfile(null);
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("[AUTH-STATE-MANAGER] Erro durante inicialização da sessão:", error);
      
      // Em caso de erro, definir estado limpo
      setSession(null);
      setUser(null);
      setProfile(null);
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erro desconhecido de autenticação')
      };
    } finally {
      // CORREÇÃO CRÍTICA 5: Set loading to false regardless of the outcome
      console.log("[AUTH-STATE-MANAGER] ✅ Finalizando loading - sistema pronto");
      setIsLoading(false);
    }
  }, [setSession, setUser, setProfile, setIsLoading]);
  
  return { setupAuthSession };
};
