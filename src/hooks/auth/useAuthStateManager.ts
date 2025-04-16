
import { useState, useEffect, useCallback } from "react";
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
  
  // Setup auth session function
  const setupAuthSession = useCallback(async () => {
    try {
      console.log("Verificando sessão atual");
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      setSession(session);
      
      if (session?.user) {
        console.log("Sessão ativa encontrada:", session.user.id);
        setUser(session.user);
        
        // Process user profile
        const profile = await processUserProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.name
        );
        
        setProfile(profile);
        
        // Forçar atualização dos metadados do usuário para garantir que o papel está correto
        if (profile) {
          await supabase.auth.updateUser({
            data: { role: profile.role }
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
