
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Criação do contexto com valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado de autenticação
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initComplete, setInitComplete] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Extrair métodos de autenticação
  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({ setIsLoading });

  // Configurar estado inicial de autenticação e lidar com mudanças
  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    let isMounted = true;
    let initTimeout: number;
    
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, "User ID:", newSession?.user?.id);
        
        if (!isMounted) return;
        
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Resetar o perfil quando o usuário faz logout
        if (event === 'SIGNED_OUT') {
          console.log("AuthProvider: User signed out, resetting profile");
          setProfile(null);
          localStorage.removeItem('lastAuthRoute');
        }
      }
    );
    
    // Obter sessão atual
    const initAuth = async () => {
      try {
        console.log("AuthProvider: Getting current session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthProvider: Error getting session:", error);
          setAuthError(error);
        }
        
        if (!isMounted) return;
        
        console.log("AuthProvider: Session retrieved", !!session, "User ID:", session?.user?.id);
        setSession(session);
        setUser(session?.user || null);
        
        // Salvar a última rota autenticada para diagnóstico
        if (session?.user) {
          localStorage.setItem('lastAuthRoute', window.location.pathname);
          console.log("AuthProvider: Saved last auth route:", window.location.pathname);
        }
        
        // Se não temos sessão, não precisamos esperar pelo perfil
        if (!session) {
          console.log("AuthProvider: No session, setting isLoading=false");
          setIsLoading(false);
        }
        
        // Definir que a inicialização está completa
        setInitComplete(true);
      } catch (error) {
        console.error("Error getting initial session:", error);
        setAuthError(error instanceof Error ? error : new Error(String(error)));
        if (isMounted) {
          setIsLoading(false);
          setInitComplete(true);
          toast("Erro ao verificar autenticação. Tente novamente.");
        }
      }
    };
    
    // Configurar um timeout para garantir que isLoading não fique preso
    initTimeout = window.setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("AuthProvider: Init timeout, forcing isLoading=false");
        setIsLoading(false);
        setInitComplete(true);
      }
    }, 5000); // 5 segundos para maior tolerância
    
    initAuth();
    
    // Cleanup on unmount
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(initTimeout);
    };
  }, []);

  // Buscar perfil do usuário quando o usuário estiver disponível
  useEffect(() => {
    if (!user || !initComplete) return;
    
    const fetchProfile = async () => {
      try {
        console.log("AuthProvider: Fetching profile for user", user.id);
        
        // Buscar perfil do banco de dados
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          console.log("AuthProvider: Profile loaded", data);
          setProfile(data as UserProfile);
        } else {
          console.log("AuthProvider: No profile found, user may need to complete registration");
          // Tentar criar perfil básico se não existir
          try {
            const newProfile = {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
              role: 'member'
            };
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile);
              
            if (!insertError) {
              console.log("AuthProvider: Created basic profile for user");
              setProfile(newProfile as UserProfile);
            } else {
              console.error("Error creating profile:", insertError);
            }
          } catch (createError) {
            console.error("Error trying to create profile:", createError);
          }
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, initComplete]);

  // Calculate isAdmin and isFormacao based on profile role
  const isAdmin = profile?.role === 'admin';
  const isFormacao = profile?.role === 'formacao';
  
  // Debug log for profile
  useEffect(() => {
    console.log("AuthProvider: Perfil de usuário carregado", { 
      profileId: profile?.id || 'não definido',
      email: profile?.email || 'não definido',
      role: profile?.role || 'não definido',
      isAdmin: profile?.role === 'admin',
      isFormacao: profile?.role === 'formacao'
    });
  }, [profile]);

  const value = {
    session,
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    // Expose setState functions for the AuthSession component
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
