
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName, isAdminRole, isFormacaoRole } from '@/lib/supabase';
import { useAuthMethods } from './hooks/useAuthMethods';
import { fetchUserProfileSecurely } from '@/hooks/auth/utils/authSessionUtils';
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

  // Função simples para buscar perfil
  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await fetchUserProfileSecurely(userId);
      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('[AUTH] Erro ao buscar perfil:', error);
      setProfile(null);
      return null;
    }
  };

  // Inicialização única e simples
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log('[AUTH] Inicializando autenticação');
      
      try {
        // Configurar listener de mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`[AUTH] Evento: ${event}`);
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log(`[AUTH] Login: ${session.user.email}`);
              setSession(session);
              setUser(session.user);
              
              // Buscar perfil após login
              await loadUserProfile(session.user.id);
              setIsLoading(false);
              
            } else if (event === 'SIGNED_OUT') {
              console.log('[AUTH] Logout');
              setUser(null);
              setProfile(null);
              setSession(null);
              setAuthError(null);
              setIsLoading(false);
            }
          }
        );
        
        authListenerRef.current = subscription;
        
        // Verificar sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          console.log('[AUTH] Sessão existente:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          await loadUserProfile(currentSession.user.id);
        }
        
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

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
    };
  }, []);

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
