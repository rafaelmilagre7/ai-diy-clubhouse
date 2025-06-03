
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContextType } from './types';

// Criação do contexto com valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("🔄 AuthProvider: Iniciando");
  
  // Estados simplificados
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormacao, setIsFormacao] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Função para buscar perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("🔍 AuthProvider: Buscando perfil para:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar perfil:', error);
        return null;
      }

      console.log("✅ AuthProvider: Perfil encontrado:", data);
      return data as UserProfile;
    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      return null;
    }
  }, []);

  // Setup inicial da autenticação
  useEffect(() => {
    console.log("🔄 AuthProvider: Configurando autenticação");
    
    let mounted = true;

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 AuthProvider: Evento de auth:", event, session?.user?.id);

        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Buscar perfil em background
          setTimeout(async () => {
            if (!mounted) return;
            
            const profile = await fetchUserProfile(session.user.id);
            if (mounted && profile) {
              setProfile(profile);
              setIsAdmin(profile.role === 'admin');
              setIsFormacao(profile.role === 'formacao');
            }
            setIsLoading(false);
          }, 100);
          
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

    // Verificar sessão atual
    const checkSession = async () => {
      try {
        console.log("🔍 AuthProvider: Verificando sessão inicial");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          console.log("✅ AuthProvider: Sessão existente encontrada");
          setUser(session.user);
          
          const profile = await fetchUserProfile(session.user.id);
          if (mounted && profile) {
            setProfile(profile);
            setIsAdmin(profile.role === 'admin');
            setIsFormacao(profile.role === 'formacao');
          }
        }
      } catch (error) {
        console.error("❌ AuthProvider: Erro ao verificar sessão:", error);
        setAuthError(error instanceof Error ? error : new Error('Erro desconhecido'));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);
  
  // Extrair métodos de autenticação
  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({ setIsLoading });
  
  // Montar objeto de contexto
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
    signInAsMember,
    signInAsAdmin,
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  };

  console.log("🎯 AuthProvider: Estado atual:", {
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading,
    isAdmin,
    isFormacao
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
