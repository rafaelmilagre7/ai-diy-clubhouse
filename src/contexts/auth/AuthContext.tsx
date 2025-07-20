
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useAuthStateManager } from '@/hooks/auth/useAuthStateManager';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estados principais
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Hook para métodos de autenticação
  const { signIn, signOut } = useAuthMethods({ setIsLoading });
  
  // Hook para gerenciamento de estado com dependências estáveis
  const stateManagerParams = useMemo(() => ({
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  }), []);
  
  const { setupAuthSession } = useAuthStateManager(stateManagerParams);

  // Estados derivados memoizados
  const isAdmin = useMemo(() => profile?.user_roles?.name === 'admin' || false, [profile?.user_roles?.name]);
  const isFormacao = useMemo(() => profile?.user_roles?.name === 'formacao' || false, [profile?.user_roles?.name]);

  // Setup inicial com controle de execução única
  const initializeAuth = useCallback(async () => {
    if (authInitialized) return;
    
    try {
      setAuthInitialized(true);
      await setupAuthSession();
    } catch (error) {
      console.error('❌ [AUTH] Erro na inicialização:', error);
      setAuthInitialized(false);
    }
  }, [authInitialized, setupAuthSession]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listener para mudanças de autenticação - executa apenas uma vez
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Buscar perfil após login
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select(`
                *,
                user_roles (
                  id,
                  name,
                  description,
                  permissions
                )
              `)
              .eq('id', session.user.id)
              .single();

            if (!error && profileData) {
              setProfile(profileData);
            }
          } catch (error) {
            console.error('❌ [AUTH] Erro ao buscar perfil:', error);
          }
        }

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthInitialized(false);
        }

        // Atualizar estados básicos
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const contextValue: AuthContextType = useMemo(() => ({
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    isFormacao,
    signIn,
    signOut,
    setProfile,
  }), [session, user, profile, isLoading, isAdmin, isFormacao, signIn, signOut]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
