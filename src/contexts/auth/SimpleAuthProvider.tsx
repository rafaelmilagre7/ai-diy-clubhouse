
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/userProfile';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils/userProfileFunctions';
import { useAuthCache } from '@/hooks/auth/useAuthCache';
import { logger } from '@/utils/logger';

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isSigningIn: boolean;
  error: Error | null;
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
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { cachedData, saveToCache, clearCache, hasValidCache } = useAuthCache();

  // Função otimizada para carregar perfil
  const loadUserProfile = async (userId: string, email?: string, useCache: boolean = true) => {
    try {
      setError(null);
      
      // Se tem cache válido e não é admin fazendo query crítica, usar cache
      if (useCache && hasValidCache && cachedData?.profile) {
        logger.info('[SIMPLE-AUTH] Usando perfil do cache');
        setProfile(cachedData.profile);
        return;
      }
      
      logger.info('[SIMPLE-AUTH] Carregando perfil do banco:', { userId: userId.substring(0, 8) });
      
      let userProfile = await fetchUserProfile(userId);
      
      if (!userProfile && email) {
        logger.info('[SIMPLE-AUTH] Criando perfil para novo usuário');
        userProfile = await createUserProfileIfNeeded(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        // Salvar no cache apenas se não for operação admin crítica
        if (useCache) {
          saveToCache(user, session, userProfile);
        }
        logger.info('[SIMPLE-AUTH] Perfil carregado:', { 
          role: userProfile.user_roles?.name,
          isAdmin: userProfile.user_roles?.name === 'admin'
        });
      } else {
        throw new Error('Não foi possível carregar o perfil do usuário');
      }
      
    } catch (error) {
      logger.error('[SIMPLE-AUTH] Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error : new Error('Erro desconhecido'));
    }
  };

  // Inicialização com verificação de cache otimizada
  useEffect(() => {
    logger.info('[SIMPLE-AUTH] Inicializando provider');
    
    let isMounted = true;
    
    // Verificar cache primeiro para acelerar loading
    if (hasValidCache && cachedData) {
      logger.info('[SIMPLE-AUTH] Aplicando cache inicial');
      setUser(cachedData.user);
      setSession(cachedData.session);
      setProfile(cachedData.profile);
      setIsLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        
        logger.info('[SIMPLE-AUTH] Auth state changed:', { 
          event, 
          hasSession: !!currentSession,
          userId: currentSession?.user?.id?.substring(0, 8)
        });
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          await loadUserProfile(currentSession.user.id, currentSession.user.email, true);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setError(null);
          clearCache();
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      }
    );

    // Obter sessão inicial apenas se não tiver cache válido
    if (!hasValidCache) {
      supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        
        if (error) {
          logger.error('[SIMPLE-AUTH] Erro ao obter sessão inicial:', error);
          setError(error);
        } else {
          logger.info('[SIMPLE-AUTH] Sessão inicial:', { hasSession: !!initialSession });
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            loadUserProfile(initialSession.user.id, initialSession.user.email, true);
          }
        }
        
        setIsLoading(false);
      });
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [hasValidCache, cachedData]);

  const signOut = async (): Promise<{ success: boolean; error?: Error | null }> => {
    try {
      setIsSigningIn(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error);
        return { success: false, error };
      }
      
      // Limpar estados
      setUser(null);
      setSession(null);
      setProfile(null);
      clearCache();
      
      logger.info('[SIMPLE-AUTH] Sign out realizado com sucesso');
      return { success: true };
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erro no sign out');
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Derivar roles de forma otimizada
  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';

  const contextValue: SimpleAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isSigningIn,
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
    throw new Error('useSimpleAuth deve ser usado dentro de um SimpleAuthProvider');
  }
  return context;
};

export default SimpleAuthProvider;
