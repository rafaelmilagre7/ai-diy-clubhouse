
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { logger } from '@/utils/logger';

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  signOut: () => Promise<{ success: boolean; error?: Error | null }>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função simplificada para buscar perfil
  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (*)
        `)
        .eq('id', userId as any)
        .single();

      if (profileError) {
        logger.error('Erro ao buscar perfil:', profileError);
        return null;
      }

      return profileData as any as UserProfile;
    } catch (error) {
      logger.error('Erro crítico ao buscar perfil:', error);
      return null;
    }
  };

  // Função de signOut simplificada
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Erro no logout:', error);
        return { success: false, error };
      }

      // Limpar estado local
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);

      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro inesperado');
      return { success: false, error };
    }
  };

  // Configurar listener de auth - SIMPLIFICADO
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Verificar sessão inicial
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logger.error('Erro ao obter sessão:', sessionError);
          setError(sessionError.message);
        } else if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // Buscar perfil se há usuário
          if (initialSession?.user) {
            const userProfile = await fetchProfile(initialSession.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          }
        }
      } catch (error) {
        logger.error('Erro na inicialização de auth:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Erro desconhecido');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Configurar listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        logger.info('Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Buscar perfil de forma assíncrona
          fetchProfile(session.user.id).then(userProfile => {
            if (mounted) {
              setProfile(userProfile);
            }
          });
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
        }
      }
    );

    // Inicializar
    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Calcular propriedades derivadas
  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';

  const contextValue: SimpleAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    error,
    isAdmin,
    isFormacao,
    signOut
  };

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = (): SimpleAuthContextType => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
