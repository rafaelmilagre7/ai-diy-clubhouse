
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';
import { useAuthSession } from '@/hooks/auth/useAuthSession';
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

  // Hook para gerenciamento de sessão inicial
  const { isInitializing } = useAuthSession();
  
  // Hook para métodos de autenticação
  const { signIn, signOut } = useAuthMethods({ setIsLoading });
  
  // Hook para gerenciamento de estado
  const { setupAuthSession } = useAuthStateManager({
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  });

  // Estados derivados
  const isAdmin = profile?.user_roles?.name === 'admin' || false;
  const isFormacao = profile?.user_roles?.name === 'formacao' || false;

  // Configurar autenticação na inicialização
  useEffect(() => {
    if (!isInitializing) {
      setupAuthSession();
    }
  }, [isInitializing, setupAuthSession]);

  // Listener para mudanças de autenticação
  useEffect(() => {
    console.log('🔄 [AUTH] Configurando listener de mudanças de estado');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 [AUTH] Evento: ${event}`, {
          hasSession: !!session,
          hasUser: !!session?.user
        });

        if (event === 'SIGNED_IN' && session) {
          // Buscar perfil do usuário após login
          setTimeout(async () => {
            try {
              console.log('🔄 [AUTH] Buscando perfil para:', session.user.id);
              
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

              if (error) {
                console.error('❌ [AUTH] Erro ao buscar perfil:', error);
              } else if (profileData) {
                console.log('✅ [AUTH] Perfil carregado:', {
                  name: profileData.name,
                  email: profileData.email,
                  role: profileData.user_roles?.name
                });
                setProfile(profileData);
              }
            } catch (error) {
              console.error('❌ [AUTH] Erro crítico ao buscar perfil:', error);
            }
          }, 0);
        }

        if (event === 'SIGNED_OUT') {
          console.log('🔄 [AUTH] Limpando estado após logout');
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        // Atualizar estados básicos
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      console.log('🔄 [AUTH] Removendo listener');
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    isFormacao,
    signIn,
    signOut,
    setProfile,
  };

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
