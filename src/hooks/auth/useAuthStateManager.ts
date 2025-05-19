
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
  
  // Setup auth session function with optimized performance
  const setupAuthSession = useCallback(async () => {
    try {
      console.log("Verificando sessão atual");
      
      // Try to get session with a strict timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session fetch timeout")), 500)
      );
      
      // Race between actual fetch and timeout
      const { data: { session } } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as { data: { session: any } };
      
      setSession(session);
      
      if (session?.user) {
        console.log("Sessão ativa encontrada:", session.user.id);
        setUser(session.user);
        
        // Process user profile with performance optimization
        const profilePromise = processUserProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.name
        );
        
        const profile = await profilePromise;
        
        setProfile(profile);
        
        // Atualizar metadados do usuário em segundo plano
        if (profile) {
          supabase.auth.updateUser({
            data: { role: profile.role }
          }).then(() => {
            console.log("Metadados do usuário atualizados com sucesso");
          }).catch(error => {
            console.error("Erro ao atualizar metadados do usuário:", error);
          });
        }
      } else {
        console.log("Nenhuma sessão ativa encontrada");
        setUser(null);
        setProfile(null);
      }
      
      // Set loading to false regardless of the outcome
      setIsLoading(false);
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro durante inicialização da sessão:", error);
      setIsLoading(false);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erro desconhecido de autenticação')
      };
    }
  }, [setSession, setUser, setProfile, setIsLoading]);
  
  return { setupAuthSession };
};
