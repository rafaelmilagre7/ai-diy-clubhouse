
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';
import { supabase } from '@/lib/supabase';

// Criação do contexto com valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Movendo os hooks para dentro do corpo do componente funcional
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use our extracted auth methods hook
  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({ setIsLoading });

  // Set up initial auth state on mount and handle auth state changes
  useEffect(() => {
    console.log("AuthProvider initializing");
    let isMounted = true;
    
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
    
    // Then get current session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user || null);
        
        // Se não temos sessão, não precisamos esperar pelo perfil
        if (!session) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initAuth();
    
    // Cleanup on unmount
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
