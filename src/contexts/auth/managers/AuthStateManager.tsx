
import { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { processUserProfile } from '../utils/authSessionUtils';
import { toast } from "sonner";

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
}

export interface AuthStateManagerProps {
  onStateChange: (newState: Partial<AuthState>) => void;
}

/**
 * Componente gerenciador centralizado de estado de autenticação
 * Responsável por inicializar e manter o estado de autenticação sincronizado
 */
export const AuthStateManager = ({ onStateChange }: AuthStateManagerProps) => {
  // Referências para controle de tempo e estado
  const isMounted = useRef(true);
  const initTimeoutRef = useRef<number | null>(null);
  const lastAuthEvent = useRef<string | null>(null);
  const initAttempts = useRef(0);
  
  // Estado local para debug
  const [debugState, setDebugState] = useState({
    lastEvent: '',
    initComplete: false,
    lastError: null as Error | null,
  });
  
  // Função para atualizar o estado e enviar para o contexto pai
  // Modificado para garantir que retorne um objeto Partial<AuthState> válido
  const updateState = (partialState: Partial<AuthState>) => {
    if (!isMounted.current) return;
    
    onStateChange(partialState);
  };
  
  // Função para definir o perfil e calcular funções derivadas
  const setProfile = (profile: UserProfile | null) => {
    if (!isMounted.current) return;
    
    const isAdmin = profile?.role === 'admin';
    const isFormacao = profile?.role === 'formacao';
    
    updateState({ 
      profile, 
      isAdmin, 
      isFormacao 
    });
    
    console.log("Auth state updated with profile:", { 
      profileId: profile?.id,
      isAdmin, 
      isFormacao 
    });
  };
  
  // Inicializa a sessão de autenticação
  const initializeAuth = async () => {
    try {
      console.log("AuthStateManager: Initializing auth");
      initAttempts.current += 1;
      
      // Obter sessão atual com timeout limitado
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Session fetch timeout")), 1500)
      );
      
      // Corrida entre o fetch e o timeout
      const { data: { session } } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as { data: { session: any } };
      
      setDebugState(prev => ({ 
        ...prev, 
        lastEvent: 'SESSION_FETCHED',
        initComplete: true
      }));
      
      updateState({ 
        session, 
        user: session?.user || null, 
        isLoading: session?.user ? true : false 
      });
      
      if (session?.user) {
        console.log("AuthStateManager: Session found for user", session.user.id);
        
        try {
          // Processar perfil do usuário de forma independente
          const profile = await processUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.name || session.user.user_metadata?.full_name
          );
          
          setProfile(profile);
          console.log("AuthStateManager: Profile processed successfully");
        } catch (profileError) {
          console.error("Error processing user profile:", profileError);
        }
      }
      
      updateState({ isLoading: false });
      
    } catch (error) {
      console.error("Auth initialization error:", error);
      setDebugState(prev => ({ 
        ...prev, 
        lastEvent: 'INIT_ERROR',
        lastError: error instanceof Error ? error : new Error(String(error)),
        initComplete: true
      }));
      
      // Se for timeout ou erro de rede, não interromper a experiência do usuário
      updateState({ 
        authError: error instanceof Error ? error : new Error(String(error)),
        isLoading: false
      });
      
      // Mostrar toast apenas em caso de erro crítico e não timeout
      if (initAttempts.current >= 2 && !(error instanceof Error && error.message === "Session fetch timeout")) {
        toast.error("Erro ao verificar autenticação", {
          description: "Tente recarregar a página"
        });
      }
    }
  };
  
  // Configura o listener de estado de autenticação e inicializa
  useEffect(() => {
    console.log("AuthStateManager: Setting up auth state listener");
    
    // Configurar timeout para forçar liberação após tempo limite
    initTimeoutRef.current = window.setTimeout(() => {
      if (isMounted.current) {
        console.log("AuthStateManager: Auth timeout reached, forcing isLoading=false");
        updateState({ isLoading: false });
        
        setDebugState(prev => ({ 
          ...prev, 
          lastEvent: 'TIMEOUT_REACHED'
        }));
      }
    }, 2000); // Timeout mais curto (2s) para melhor UX
    
    // Configurar listener de estado de autenticação
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const authSubscription = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!isMounted.current) return;
          
          console.log("Auth state changed:", event, "User ID:", newSession?.user?.id);
          lastAuthEvent.current = event;
          
          setDebugState(prev => ({ 
            ...prev, 
            lastEvent: event
          }));
          
          // Atualizar estado básico imediatamente para resposta rápida da UI
          updateState({ 
            session: newSession, 
            user: newSession?.user || null
          });
          
          // Tratar eventos específicos
          if (event === 'SIGNED_OUT') {
            console.log("AuthStateManager: User signed out, resetting profile");
            setProfile(null);
            localStorage.removeItem('lastAuthRoute');
          } 
          else if (event === 'SIGNED_IN' && newSession?.user) {
            console.log("AuthStateManager: User signed in, updating profile");
            
            try {
              // Adicionar delay mínimo para evitar deadlocks com Supabase
              setTimeout(async () => {
                if (!isMounted.current) return;
                
                const profile = await processUserProfile(
                  newSession.user.id,
                  newSession.user.email,
                  newSession.user.user_metadata?.name || newSession.user.user_metadata?.full_name
                );
                
                setProfile(profile);
              }, 10);
            } catch (error) {
              console.error("Error processing profile after sign in:", error);
            }
          }
        }
      );
      
      // Armazenar a subscription para limpeza
      subscription = authSubscription.data.subscription;
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      // Em caso de erro, ainda tentar inicializar
    }
    
    // Inicializar autenticação
    initializeAuth();
    
    // Cleanup
    return () => {
      isMounted.current = false;
      
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);
  
  // Não renderiza nada, apenas gerencia estado
  return null;
};
