
import { useState, useEffect } from "react";
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
  
  // Set up the auth state change listener
  useEffect(() => {
    console.log("Configurando listener de autenticação");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Evento de autenticação:", event);
        
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          try {
            // Process user profile after auth state change
            const profile = await processUserProfile(
              newSession.user.id,
              newSession.user.email,
              newSession.user.user_metadata?.name
            );
            
            setProfile(profile);
          } catch (error) {
            console.error("Erro ao processar perfil após evento de auth:", error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      console.log("Limpando subscription de auth");
      subscription.unsubscribe();
    };
  }, [setSession, setUser, setProfile]);
  
  return {
    setupAuthSession: async () => {
      try {
        console.log("Verificando sessão atual");
        
        // Verificar sessão atual
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
    }
  };
};
