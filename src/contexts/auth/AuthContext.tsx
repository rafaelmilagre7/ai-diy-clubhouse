
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';
import { useAuthMethods } from './hooks/useAuthMethods';

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

  // Hook para métodos de autenticação
  const { signIn, signOut } = useAuthMethods({ setIsLoading });

  // Estados derivados memoizados
  const isAdmin = useMemo(() => profile?.user_roles?.name === 'admin' || false, [profile?.user_roles?.name]);
  const isFormacao = useMemo(() => profile?.user_roles?.name === 'formacao' || false, [profile?.user_roles?.name]);

  // Função para buscar perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 [AUTH] Buscando perfil para usuário:', userId);
      
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
        .eq('id', userId)
        .maybeSingle();

      if (!error && profileData) {
        console.log('✅ [AUTH] Perfil carregado:', {
          email: profileData.email,
          role: profileData.user_roles?.name
        });
        setProfile(profileData);
      } else {
        console.warn('⚠️ [AUTH] Erro ao buscar perfil:', error?.message);
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao buscar perfil:', error);
      setProfile(null);
    }
  }, []);

  // Setup inicial e listener de mudanças de autenticação
  useEffect(() => {
    console.log('🔧 [AUTH] Configurando autenticação...');
    
    // Função para processar mudanças de estado de auth
    const handleAuthStateChange = (event: string, session: Session | null) => {
      console.log('🔔 [AUTH] Evento de auth:', event);
      
      // Sempre atualizar session e user
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Buscar perfil apenas se temos um usuário
        fetchUserProfile(session.user.id);
      } else {
        // Limpar perfil se não há usuário
        setProfile(null);
      }
      
      // Terminar loading
      setIsLoading(false);
    };

    // Configurar listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Verificar sessão atual uma única vez
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 [AUTH] Sessão inicial:', session ? 'encontrada' : 'não encontrada');
      handleAuthStateChange('INITIAL_SESSION', session);
    });

    return () => {
      console.log('🧹 [AUTH] Limpando listener de auth');
      subscription.unsubscribe();
    };
  }, []); // Array vazio - executar apenas uma vez

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
