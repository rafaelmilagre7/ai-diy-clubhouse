
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { AuthContextType } from './types';
import { logger } from '@/utils/logger';

interface SimpleAuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função simples para carregar perfil
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            role,
            name,
            description
          )
        `)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        logger.info('Perfil carregado:', { userId });
      } else {
        logger.warn('Perfil não encontrado:', { userId });
      }
    } catch (err) {
      logger.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar perfil do usuário');
    }
  };

  // Métodos de autenticação simples
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (err) {
      const error = err as Error;
      logger.error('Erro no signIn:', error);
      return { data: null, error };
    }
  };

  // Implementar signInAsMember (mesma lógica que signIn para compatibilidade)
  const signInAsMember = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  // Implementar signInAsAdmin (mesma lógica que signIn para compatibilidade)
  const signInAsAdmin = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      return { data, error };
    } catch (err) {
      const error = err as Error;
      logger.error('Erro no signUp:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      return { success: !error, error };
    } catch (err) {
      const error = err as Error;
      logger.error('Erro no signOut:', error);
      return { success: false, error };
    }
  };

  // Configurar listener de auth
  useEffect(() => {
    logger.info('Inicializando SimpleAuthProvider');

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.info('Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
        }
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('Erro ao obter sessão:', error);
        setError(error.message);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          loadUserProfile(session.user.id);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    error,
    refreshProfile,
    isAdmin: profile?.user_roles?.name === 'admin',
    isFormacao: profile?.user_roles?.name === 'formacao',
    signIn,
    signInAsMember,
    signInAsAdmin,
    signUp,
    signOut,
    setSession,
    setUser,
    setProfile,
    setIsLoading
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
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
