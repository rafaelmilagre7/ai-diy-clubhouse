
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
  error: Error | null;
  isAdmin: boolean;
  isFormacao: boolean;
  isSigningIn: boolean;
  signOut: () => Promise<void>;
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
  
  const { cachedData, saveToCache, clearCache, hasValidCache } = useAuthCache();

  // Calcular roles baseado no perfil
  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';

  // Função para carregar perfil do usuário
  const loadUserProfile = async (userId: string, email?: string) => {
    try {
      setError(null);
      logger.info('[SIMPLE-AUTH] Carregando perfil do usuário', { userId: userId.substring(0, 8) + '***' });
      
      let userProfile = await fetchUserProfile(userId);
      
      if (!userProfile && email) {
        logger.info('[SIMPLE-AUTH] Perfil não encontrado, criando novo perfil');
        userProfile = await createUserProfileIfNeeded(userId, email);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        logger.info('[SIMPLE-AUTH] Perfil carregado com sucesso', { 
          role: userProfile.user_roles?.name 
        });
      } else {
        throw new Error('Não foi possível carregar ou criar o perfil do usuário');
      }
      
    } catch (error) {
      logger.error('[SIMPLE-AUTH] Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error : new Error('Erro desconhecido ao carregar perfil'));
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      logger.info('[SIMPLE-AUTH] Fazendo logout');
      
      // Limpar estado local
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
      
      // Limpar cache
      clearCache();
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      logger.info('[SIMPLE-AUTH] Logout realizado com sucesso');
    } catch (error) {
      logger.error('[SIMPLE-AUTH] Erro no logout:', error);
      setError(error instanceof Error ? error : new Error('Erro ao fazer logout'));
    }
  };

  // Inicialização do contexto de autenticação
  useEffect(() => {
    logger.info('[SIMPLE-AUTH] Inicializando provider');

    // CORREÇÃO PRINCIPAL: Cache apenas para UX inicial, não define loading
    if (hasValidCache && cachedData) {
      logger.info('[SIMPLE-AUTH] Usando cache para UX inicial');
      setUser(cachedData.user);
      setSession(cachedData.session);
      setProfile(cachedData.profile);
      // ❌ REMOVIDO: setIsLoading(false) - Cache não interfere no loading
    }

    // ÚNICA FONTE DE VERDADE: Supabase Auth State
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logger.info('[SIMPLE-AUTH] 🔄 Auth state changed:', { 
          event, 
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user 
        });

        // Atualizar estado da sessão e usuário
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Carregar perfil para usuários logados
          setTimeout(() => {
            loadUserProfile(currentSession.user.id, currentSession.user.email);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Limpar estado para usuários deslogados
          setProfile(null);
          setError(null);
          clearCache();
        }

        // ✅ APENAS AQUI: Supabase define o estado final de loading
        setIsLoading(false);
      }
    );

    // Verificar sessão inicial do Supabase
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        logger.error('[SIMPLE-AUTH] Erro ao obter sessão inicial:', error);
        setError(error);
        setIsLoading(false);
        return;
      }

      logger.info('[SIMPLE-AUTH] Sessão inicial obtida:', { 
        hasSession: !!initialSession,
        hasUser: !!initialSession?.user 
      });

      // Atualizar estado inicial
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        // Carregar perfil se há usuário logado
        setTimeout(() => {
          loadUserProfile(initialSession.user.id, initialSession.user.email);
        }, 0);
      } else {
        // ✅ Se não há usuário, finalizar loading imediatamente
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Salvar no cache sempre que dados mudarem (para UX futura)
  useEffect(() => {
    if (user && session) {
      saveToCache(user, session, profile);
    }
  }, [user, session, profile, saveToCache]);

  const contextValue: SimpleAuthContextType = {
    user,
    session,
    profile,
    isLoading,
    error,
    isAdmin,
    isFormacao,
    isSigningIn,
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
