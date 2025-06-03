import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("🔄 AuthProvider: Iniciando");
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormacao, setIsFormacao] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Setup inicial da autenticação
  useEffect(() => {
    console.log("🔄 AuthProvider: Configurando autenticação");
    
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log("📝 Sessão atual:", session?.user?.id);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Criar perfil básico com todas as propriedades obrigatórias
          const basicProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            company_name: null,
            industry: null,
            role: 'member',
            created_at: new Date().toISOString()
          };
          
          setProfile(basicProfile);
          setIsAdmin(false);
          setIsFormacao(false);
        }
      } catch (error) {
        console.error("❌ Erro ao verificar sessão:", error);
        setAuthError(error instanceof Error ? error : new Error('Erro desconhecido'));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Configurar listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 AuthProvider: Evento de auth:", event);

        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          setUser(session.user);
          
          const basicProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            company_name: null,
            industry: null,
            role: 'member',
            created_at: new Date().toISOString()
          };
          
          setProfile(basicProfile);
          setIsAdmin(false);
          setIsFormacao(false);
          setIsLoading(false);
          
        } else if (event === 'SIGNED_OUT') {
          console.log("👋 AuthProvider: Usuário desconectado");
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsFormacao(false);
          setIsLoading(false);
        }
      }
    );

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  // Métodos básicos de autenticação
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const contextValue: AuthContextType = {
    session,
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    signIn,
    signOut,
    signInAsMember: async () => ({ success: false, error: new Error('Not implemented') }),
    signInAsAdmin: async () => ({ success: false, error: new Error('Not implemented') }),
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  };

  console.log("🎯 AuthProvider: Estado atual:", {
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
