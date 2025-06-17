
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole, isFormacaoRole } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { fetchUserProfileSecurely, clearProfileCache } from '@/hooks/auth/utils/authSessionUtils';
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

  const { signIn, signOut, signInAsMember, signInAsAdmin } = useAuthMethods({
    setIsLoading,
  });

  // Verificação de admin baseada em email e perfil
  const isAdminByEmail = user?.email && [
    'rafael@viverdeia.ai',
    'admin@viverdeia.ai',
    'admin@teste.com'
  ].includes(user.email.toLowerCase());

  const isAdmin = React.useMemo(() => {
    return isAdminRole(profile) || isAdminByEmail;
  }, [profile, isAdminByEmail]);

  const isFormacao = React.useMemo(() => {
    return isFormacaoRole(profile);
  }, [profile]);

  // Setup simplificado de sessão
  const setupAuthSession = React.useCallback(async () => {
    try {
      console.log('[AUTH] Verificando sessão atual');
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AUTH] Erro ao obter sessão:', error);
        setAuthError(error);
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      if (!currentSession || !currentSession.user) {
        console.log('[AUTH] Nenhuma sessão válida encontrada');
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      console.log('[AUTH] Sessão válida encontrada:', currentSession.user.email);
      
      setSession(currentSession);
      setUser(currentSession.user);

      // Buscar perfil do usuário
      try {
        const userProfile = await fetchUserProfileSecurely(currentSession.user.id);
        if (userProfile && userProfile.id === currentSession.user.id) {
          setProfile(userProfile);
          console.log('[AUTH] Perfil carregado:', userProfile.email);
        } else {
          console.log('[AUTH] Perfil não encontrado');
          setProfile(null);
        }
      } catch (profileError) {
        console.error('[AUTH] Erro ao buscar perfil:', profileError);
        setProfile(null);
      }

    } catch (error) {
      console.error('[AUTH] Erro crítico no setup:', error);
      setAuthError(error instanceof Error ? error : new Error('Erro na autenticação'));
      setSession(null);
      setUser(null);
      setProfile(null);
      clearProfileCache();
    }
  }, []);

  // Inicialização única
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log('[AUTH] Inicializando autenticação');
      
      try {
        // Configurar listener de mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`[AUTH] Evento de autenticação: ${event}`);
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log(`[AUTH] Login realizado: ${session.user.email}`);
              setSession(session);
              setUser(session.user);
              
              // Buscar perfil após login
              try {
                const userProfile = await fetchUserProfileSecurely(session.user.id);
                if (userProfile) {
                  setProfile(userProfile);
                }
              } catch (error) {
                console.error('[AUTH] Erro ao buscar perfil pós-login:', error);
              }
              
              setIsLoading(false);
              
            } else if (event === 'SIGNED_OUT') {
              console.log('[AUTH] Logout realizado');
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
        
        // Setup inicial da sessão
        await setupAuthSession();
        
        isInitialized.current = true;
        console.log('[AUTH] Inicialização concluída');
        
      } catch (error) {
        console.error('[AUTH] Erro na inicialização:', error);
        setAuthError(error instanceof Error ? error : new Error('Erro na inicialização'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Timeout de segurança mais simples
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('[AUTH] Timeout de segurança atingido');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
      clearTimeout(timeout);
    };
  }, [setupAuthSession, isLoading]);

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
