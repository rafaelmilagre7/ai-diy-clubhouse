
import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { processUserProfile } from './utils/authSessionUtils';

export const useAuthStateManager = () => {
  const {
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  } = useAuth();
  
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
      
      if (session) {
        console.log("Sessão ativa encontrada:", session.user.id);
        setUser(session.user);
        
        // Process user profile
        const profile = await processUserProfile(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.name
        );
        
        setProfile(profile);
      } else {
        console.log("Nenhuma sessão ativa encontrada");
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Erro durante inicialização da sessão:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erro desconhecido de autenticação')
      };
    }
  }, [setSession, setUser, setProfile]);
  
  return { setupAuthSession };
};
