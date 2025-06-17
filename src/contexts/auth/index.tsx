
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole, isFormacaoRole } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { validateUserSession, fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
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
  
  const authListenerRef = useRef<any>(null);
  const isInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // Verificação imediata de admin baseada em email
  const isAdminByEmail = user?.email && [
    'rafael@viverdeia.ai',
    'admin@viverdeia.ai',
    'admin@teste.com'
  ].includes(user.email.toLowerCase());

  // Computar isAdmin com cache
  const isAdmin = React.useMemo(() => {
    return isAdminRole(profile) || isAdminByEmail;
  }, [profile, isAdminByEmail]);

  // Computar isFormacao
  const isFormacao = React.useMemo(() => {
    return isFormacaoRole(profile);
  }, [profile]);

  // Setup de sessão simplificado
  const setupAuthSession = useCallback(async () => {
    try {
      const sessionResult = await validateUserSession();
      const { session: validSession, user: validUser } = sessionResult;
      
      if (!validSession || !validUser) {
        setSession(null);
        setUser(null);
        setProfile(null);
        clearProfileCache();
        return;
      }

      setSession(validSession);
      setUser(validUser);

      // Buscar perfil
      try {
        const userProfile = await fetchUserProfileSecurely(validUser.id);
        if (userProfile && userProfile.id === validUser.id) {
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } catch (profileError) {
        console.error('[AUTH] Erro ao buscar perfil:', profileError);
        setProfile(null);
      }

    } catch (error) {
      console.error('[AUTH] Erro no setup:', error);
      setAuthError(error instanceof Error ? error : new Error('Erro na autenticação'));
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
    }
  }, []);

  // Inicialização única simplificada
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log('🚀 [AUTH] Inicializando autenticação');
      
      try {
        // Configurar listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`🔄 [AUTH] Evento: ${event}`);
            
            const currentUserId = session?.user?.id;
            if (lastUserId.current && lastUserId.current !== currentUserId) {
              console.log('👤 [AUTH] Mudança de usuário - limpando cache');
              clearProfileCache();
            }
            lastUserId.current = currentUserId;
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log(`🎉 [AUTH] Login: ${session.user.email}`);
              
              // Setup imediato sem timeout
              try {
                await setupAuthSession();
              } catch (error) {
                console.error('❌ [AUTH] Erro no setup pós-login:', error);
                setAuthError(error instanceof Error ? error : new Error('Erro no setup'));
                setUser(session.user);
                setSession(session);
              } finally {
                setIsLoading(false);
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 [AUTH] Logout');
              clearProfileCache();
              setUser(null);
              setProfile(null);
              setSession(null);
              setAuthError(null);
              setIsLoading(false);
            }
          }
        );
        
        authListenerRef.current = subscription;
        
        // Setup inicial
        await setupAuthSession();
        
        isInitialized.current = true;
        console.log('✅ [AUTH] Inicialização concluída');
        
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error);
        setAuthError(error instanceof Error ? error : new Error('Erro na inicialização'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Timeout de segurança simplificado
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("⚠️ [AUTH] Timeout de segurança - finalizando loading");
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
      clearTimeout(timeout);
    };
  }, []); // Sem dependências para evitar re-inicialização

  const value: AuthContextType = {
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
