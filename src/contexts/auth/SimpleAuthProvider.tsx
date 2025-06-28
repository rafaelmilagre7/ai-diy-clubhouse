
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/userProfile';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils/userProfileFunctions';
import { logger } from '@/utils/logger';

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isSigningIn: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<{ success: boolean; error?: Error | null }>;
  refreshProfile: () => Promise<void>;
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
  const [error, setError] = useState<Error | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Derived states
  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';

  // Load user profile
  const loadUserProfile = async (userId: string, email?: string) => {
    try {
      logger.info('[SIMPLE-AUTH] Carregando perfil do usuário:', { userId });
      
      let userProfile = await fetchUserProfile(userId);
      
      if (!userProfile && email) {
        logger.info('[SIMPLE-AUTH] Criando perfil para novo usuário');
        userProfile = await createUserProfileIfNeeded(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        logger.info('[SIMPLE-AUTH] Perfil carregado com sucesso');
      }
    } catch (error) {
      logger.error('[SIMPLE-AUTH] Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error : new Error('Erro desconhecido'));
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id, user.email);
    }
  };

  // Sign in method
  const signIn = async (email: string, password: string) => {
    setIsSigningIn(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error);
        return { error };
      }
      
      return {};
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro desconhecido');
      setError(err);
      return { error: err };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error };
      }
      
      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
      
      return { success: true };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro no logout');
      return { success: false, error: err };
    }
  };

  // Auth state listener
  useEffect(() => {
    logger.info('[SIMPLE-AUTH] Inicializando provider');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('[SIMPLE-AUTH] Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id, session.user.email);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('[SIMPLE-AUTH] Erro ao obter sessão inicial:', error);
        setError(error);
      } else {
        logger.info('[SIMPLE-AUTH] Sessão inicial:', { hasSession: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id, session.user.email);
          }, 0);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const contextValue: SimpleAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    error,
    isAdmin,
    isFormacao,
    isSigningIn,
    signIn,
    signOut,
    refreshProfile
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
