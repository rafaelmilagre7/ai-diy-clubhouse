
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
      console.log("Verificando sessão atual");
      
      // Try to get session with timeout mais longo e retry logic
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session fetch timeout")), 2000) // Aumentado para 2 segundos
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
        console.warn("Session fetch timeout, trying again without timeout...");
        sessionResult = await supabase.auth.getSession();
      }
      
      const { data: { session } } = sessionResult;
      setSession(session);
      
      if (session?.user) {
        console.log("Sessão ativa encontrada:", session.user.id.substring(0, 8) + '***');
        setUser(session.user);
        
        // Process user profile with error handling
        try {
          const profile = await processUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name
          );
          
          setProfile(profile);
          
          // Atualizar metadados do usuário em segundo plano (não crítico)
          if (profile) {
            supabase.auth.updateUser({
              data: { role: profile.role }
            }).then(() => {
              console.log("Metadados do usuário atualizados com sucesso");
            }).catch(error => {
              console.warn("Erro ao atualizar metadados do usuário:", error.message);
              // Não é crítico, continuar normalmente
            });
          }
        } catch (profileError) {
          console.error("Erro ao processar perfil do usuário:", profileError);
          // Definir perfil como null mas manter usuário
          setProfile(null);
        }
      } else {
        console.log("Nenhuma sessão ativa encontrada");
        setUser(null);
        setProfile(null);
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro durante inicialização da sessão:", error);
      
      // Em caso de erro, definir estado limpo
      setSession(null);
      setUser(null);
      setProfile(null);
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erro desconhecido de autenticação')
      };
    } finally {
      // Set loading to false regardless of the outcome
      setIsLoading(false);
    }
  }, [setSession, setUser, setProfile, setIsLoading]);
  
  return { setupAuthSession };
};
