
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useAuthStateManager } from '../../hooks/auth/useAuthStateManager';
import { clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [isAdmin, setIsAdmin] = useState(false);
  
  const authListenerRef = useRef<any>(null);
  const isInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar useAuthStateManager com os setters como parâmetros
  const { setupAuthSession } = useAuthStateManager({
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  });

  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // Circuit breaker - timeout de 5 segundos para inicialização
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn("⚠️ [AUTH] Circuit breaker ativado - forçando fim do loading");
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading]);

  // CORREÇÃO CRÍTICA: Verificação de admin usando função do banco
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('[AUTH] Erro ao verificar status de admin:', error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(Boolean(data));
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUTH] Status de admin verificado:', Boolean(data));
      }
      
    } catch (error) {
      console.error('[AUTH] Erro crítico na verificação de admin:', error);
      setIsAdmin(false);
    }
  }, [user]);

  const isFormacao = Boolean(
    profile?.user_roles?.name === 'formacao' || 
    profile?.role === 'formacao'
  );

  // Verificar status de admin quando usuário ou perfil muda
  useEffect(() => {
    if (user && profile) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user, profile, checkAdminStatus]);

  // Cache bust quando muda usuário
  useEffect(() => {
    if (user?.id !== lastUserId.current) {
      if (lastUserId.current !== null) {
        clearProfileCache();
      }
      lastUserId.current = user?.id || null;
    }
  }, [user?.id]);

  // Setup inicial da autenticação
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      setupAuthSession();
    }
  }, [setupAuthSession]);

  // Auth state change listener
  useEffect(() => {
    if (!authListenerRef.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log('[AUTH] Auth state change:', event);
          
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            setProfile(null);
            setIsAdmin(false);
            setIsLoading(false);
            setAuthError(null);
          } else if (event === 'SIGNED_IN' && currentSession?.user) {
            setUser(currentSession.user);
            setSession(currentSession);
            await setupAuthSession();
          } else if (event === 'TOKEN_REFRESHED' && currentSession?.user) {
            setUser(currentSession.user);
            setSession(currentSession);
          }
        }
      );
      
      authListenerRef.current = subscription;
    }

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [setupAuthSession]);

  const contextValue: AuthContextType = {
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
    setSession,
    setUser,
    setProfile,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
