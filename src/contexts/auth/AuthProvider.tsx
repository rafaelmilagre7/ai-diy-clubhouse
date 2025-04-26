
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
        console.log("Auth state changed:", event);
        
        if (!isMounted) return;
        
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Resetar o perfil quando o usuário faz logout
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );
    
    // Obter sessão atual
    const initAuth = async () => {
      try {
        console.log("AuthProvider: Getting current session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        console.log("AuthProvider: Session retrieved", !!session);
        setSession(session);
        setUser(session?.user || null);
        
        // Se não temos sessão, não precisamos esperar pelo perfil
        if (!session) {
          console.log("AuthProvider: No session, setting isLoading=false");
          setIsLoading(false);
        }
        
        // Definir que a inicialização está completa
        setInitComplete(true);
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (isMounted) {
          setIsLoading(false);
          setInitComplete(true);
          toast("Erro ao verificar autenticação. Tente novamente.");
        }
      }
    };
    
    // Configurar um timeout mais curto para garantir que isLoading não fique preso
    initTimeout = window.setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("AuthProvider: Init timeout, forcing isLoading=false");
        setIsLoading(false);
        setInitComplete(true);
      }
    }, 1500); // Reduzido para 1.5 segundos
    
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
        }
      } catch (error) {
        console.error("Error in profile fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, initComplete]);

  // Calculate isAdmin based on profile role
  const isAdmin = profile?.role === 'admin';
  
  // Debug log for profile
  useEffect(() => {
    console.log("AuthProvider: Perfil de usuário carregado", { 
      profileId: profile?.id || 'não definido',
      email: profile?.email || 'não definido',
      role: profile?.role || 'não definido',
      isAdmin: profile?.role === 'admin'
    });
  }, [profile]);

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
