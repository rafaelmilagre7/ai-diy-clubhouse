
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole, isFormacaoRole } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';

const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isLoading: boolean;
  authError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ success: boolean; error: any }>;
  signInAsMember: (email: string, password: string) => Promise<{ error: any }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: any }>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
} | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // Verificação de admin simples
  const isAdminByEmail = user?.email && [
    'rafael@viverdeia.ai',
    'admin@viverdeia.ai',
    'admin@teste.com'
  ].includes(user.email.toLowerCase());

  const isAdmin = isAdminRole(profile) || isAdminByEmail;
  const isFormacao = isFormacaoRole(profile);

  // Função simples para carregar perfil
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AUTH] Erro ao buscar perfil:', error);
        setProfile(null);
        return;
      }

      setProfile(data);
      console.log('[AUTH] Perfil carregado:', data?.email);
    } catch (error) {
      console.error('[AUTH] Erro ao carregar perfil:', error);
      setProfile(null);
    }
  };

  // Inicialização simplificada
  useEffect(() => {
    console.log('[AUTH] Inicializando autenticação');

    // Configurar listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[AUTH] Evento: ${event}`);
        
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setAuthError(null);
        }
        
        setIsLoading(false);
      }
    );

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
    authError,
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin,
    setUser,
    setSession,
    setProfile,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
