
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { processUserProfile } from '@/contexts/auth/utils/profileUtils';

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado de autenticação
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extrair métodos de autenticação
  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({ setIsLoading });

  // Calculo de isAdmin baseado no papel do perfil
  const isAdmin = profile?.role === 'admin';
  
  // Configurar estado inicial de autenticação e lidar com mudanças
  useEffect(() => {
    console.log("AuthProvider: Inicializando estado de autenticação");
    let isMounted = true;
    
    // Primeiro configurar o listener de eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Estado de autenticação alterado:", event);
        
        if (!isMounted) return;
        
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Se o evento for de login, carregar o perfil
        if (event === 'SIGNED_IN' && newSession?.user) {
          try {
            // Usar setTimeout para evitar deadlock com onAuthStateChange
            setTimeout(async () => {
              if (!isMounted) return;
              
              console.log("Carregando perfil após login");
              const userProfile = await processUserProfile(
                newSession.user.id,
                newSession.user.email,
                newSession.user.user_metadata?.name || newSession.user.user_metadata?.full_name
              );
              
              if (isMounted) {
                setProfile(userProfile);
                setIsLoading(false);
              }
            }, 0);
          } catch (error) {
            console.error("Erro ao carregar perfil após login:", error);
            if (isMounted) setIsLoading(false);
          }
        }
        
        // Resetar o perfil quando o usuário faz logout
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );
    
    // Depois verificar a sessão atual
    const initAuth = async () => {
      try {
        console.log("AuthProvider: Obtendo sessão atual");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        console.log("AuthProvider: Sessão recuperada", !!session);
        setSession(session);
        setUser(session?.user || null);
        
        // Se temos uma sessão, carregar o perfil do usuário
        if (session?.user) {
          try {
            const userProfile = await processUserProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.name || session.user.user_metadata?.full_name
            );
            
            if (isMounted) {
              setProfile(userProfile);
            }
          } catch (error) {
            console.error("Erro ao carregar perfil do usuário:", error);
          }
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao obter sessão inicial:", error);
        if (isMounted) {
          setIsLoading(false);
          toast("Erro ao verificar autenticação. Tente novamente.");
        }
      }
    };
    
    initAuth();
    
    // Cleanup ao desmontar
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Valor do contexto
  const value = {
    session,
    user,
    profile,
    isAdmin,
    isLoading,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    // Expor funções setState para componentes que precisam
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
