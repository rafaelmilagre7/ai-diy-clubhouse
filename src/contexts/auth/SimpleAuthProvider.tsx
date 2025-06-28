
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useProductionLogger } from '@/hooks/useProductionLogger';

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isFormacao: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: Error | null }>;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormacao, setIsFormacao] = useState(false);
  
  const { log, error: logError } = useProductionLogger({ component: 'SimpleAuthProvider' });

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles:user_roles(
            id,
            name,
            description
          )
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        logError('Erro ao buscar perfil:', profileError);
        return null;
      }

      return profileData;
    } catch (error) {
      logError('Erro na busca do perfil:', error);
      return null;
    }
  };

  const updateUserState = async (newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user || null);

    if (newSession?.user) {
      const profileData = await fetchUserProfile(newSession.user.id);
      
      // Type assertion para compatibilidade, mas mantendo segurança
      if (profileData) {
        setProfile(profileData as UserProfile);
        
        const roleName = profileData.user_roles?.name;
        setIsAdmin(roleName === 'admin');
        setIsFormacao(roleName === 'formacao');
        
        log('Usuário autenticado:', { 
          userId: newSession.user.id.substring(0, 8) + '***',
          role: roleName 
        });
      }
    } else {
      setProfile(null);
      setIsAdmin(false);
      setIsFormacao(false);
    }
  };

  useEffect(() => {
    log('Inicializando SimpleAuthProvider...');
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log('Auth state changed:', event);
        await updateUserState(session);
        setIsLoading(false);
        setError(null);
      }
    );

    // Buscar sessão inicial
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logError('Erro ao obter sessão:', sessionError);
          setError(sessionError.message);
        } else {
          await updateUserState(session);
        }
      } catch (error: any) {
        logError('Erro na inicialização:', error);
        setError(error.message || 'Erro na inicialização');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      log('Atualizando perfil do usuário...');
      await updateUserState(session);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return { error };
      }

      log('Login realizado com sucesso');
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Erro no login';
      setError(errorMessage);
      logError('Erro no signIn:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logError('Erro no signOut:', error);
        return { success: false, error };
      }

      // Limpar estado local
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setIsFormacao(false);
      setError(null);

      log('Logout realizado com sucesso');
      return { success: true, error: null };
    } catch (error: any) {
      logError('Erro no signOut:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: SimpleAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    error,
    isAdmin,
    isFormacao,
    refreshProfile,
    signIn,
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

export const useAuth = useSimpleAuth;
