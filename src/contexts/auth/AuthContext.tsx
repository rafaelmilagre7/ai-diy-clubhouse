
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
    
    console.log('🔄 [AUTH] Inicializando autenticação...');
    
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

  // Listener para mudanças de autenticação - simplificado
  useEffect(() => {
    console.log('🔧 [AUTH] Configurando listener de mudanças de auth');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 [AUTH] Evento de auth:', event, session ? 'com sessão' : 'sem sessão');
        
        // Atualizar estados básicos
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ [AUTH] Usuário logado, buscando perfil...');
          
          // Buscar perfil após login - com delay para evitar conflitos
          setTimeout(async () => {
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
                console.log('👤 [AUTH] Perfil carregado:', profileData.name);
                setProfile(profileData);
              } else {
                console.warn('⚠️ [AUTH] Erro ao buscar perfil:', error);
              }
            } catch (error) {
              console.error('❌ [AUTH] Erro ao buscar perfil:', error);
            }
          }, 100);
        }

        if (event === 'SIGNED_OUT') {
          console.log('🚪 [AUTH] Usuário deslogado');
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthInitialized(false);
        }
      }
    );

    return () => {
      console.log('🧹 [AUTH] Limpando listener de auth');
      subscription.unsubscribe();
    };
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
