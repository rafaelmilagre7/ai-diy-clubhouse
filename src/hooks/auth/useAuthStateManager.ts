
import { useCallback } from "react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { processUserProfile } from './utils/authSessionUtils';

export const useAuthStateManager = () => {
  // Safe access to useAuth, use default implementation if not in context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("useAuthStateManager error:", error);
    // Return a dummy function that doesn't do anything if we're not in the AuthProvider context
    return { 
      setupAuthSession: async () => ({ success: false, error: new Error("Authentication provider not found") }) 
    };
  }
  
  const {
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  } = authContext;
  
  // Setup auth session function with optimized performance and better error handling
  const setupAuthSession = useCallback(async () => {
    try {
      console.log("[AUTH-STATE-MANAGER] Verificando sessão atual");
      
      // CORREÇÃO CRÍTICA 1: Timeout reduzido para 1 segundo com retry mais agressivo
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session fetch timeout")), 1000)
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
        
        // CORREÇÃO CRÍTICA 2: Verificação imediata de admin por email
        const isAdminByEmail = session.user.email && [
          'rafael@viverdeia.ai',
          'admin@viverdeia.ai',
          'admin@teste.com'
        ].includes(session.user.email.toLowerCase());
        
        if (isAdminByEmail) {
          console.log("[AUTH-STATE-MANAGER] Admin detectado por email, priorizando carregamento");
        }
        
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
            isAdmin: isAdminByEmail || profile?.role_id === 'admin',
            roleName: profile?.user_roles?.name || 'sem role'
          });
          
          // CORREÇÃO CRÍTICA 3: Garantir que navegação aconteça após profile estar disponível
          if (profile) {
            console.log("[AUTH-STATE-MANAGER] ✅ Perfil carregado - sistema pronto para navegação");
          }
          
        } catch (profileError) {
          console.error("[AUTH-STATE-MANAGER] Erro ao processar perfil do usuário:", profileError);
          // CORREÇÃO CRÍTICA 4: Se é admin por email, permitir acesso mesmo sem perfil
          if (isAdminByEmail) {
            console.log("[AUTH-STATE-MANAGER] Admin por email - permitindo acesso sem perfil completo");
            setProfile(null);
          } else {
            setProfile(null);
          }
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
