
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

  // CORREÇÃO: Função única para carregar perfil (evita duplicação)
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('[AUTH] Carregando perfil para usuário:', userId.substring(0, 8) + '***');
      const userProfile = await fetchUserProfileSecurely(userId);
      setProfile(userProfile);
      console.log('[AUTH] Perfil carregado:', userProfile ? 'sucesso' : 'não encontrado');
      return userProfile;
    } catch (error) {
      console.error('[AUTH] Erro ao buscar perfil:', error);
      setProfile(null);
      return null;
    }
  };

  // CORREÇÃO: Inicialização simplificada sem duplicação
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log('[AUTH] Inicializando autenticação - versão corrigida');
      
      try {
        // CORREÇÃO: Configurar listener PRIMEIRO
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log(`[AUTH] Evento recebido: ${event}`);
            
            if (event === 'SIGNED_IN' && session?.user) {
              console.log(`[AUTH] Login detectado: ${session.user.email}`);
              setSession(session);
              setUser(session.user);
              
              // CORREÇÃO: Usar setTimeout(0) para evitar deadlock
              setTimeout(() => {
                loadUserProfile(session.user.id).finally(() => {
                  setIsLoading(false);
                  console.log('[AUTH] Loading finalizado após login');
                });
              }, 0);
              
            } else if (event === 'SIGNED_OUT') {
              console.log('[AUTH] Logout detectado');
              setUser(null);
              setProfile(null);
              setSession(null);
              setAuthError(null);
              setIsLoading(false);
            }
          }
        );
        
        authListenerRef.current = subscription;
        
        // CORREÇÃO: Verificar sessão atual sem carregar perfil (evita duplicação)
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          console.log('[AUTH] Sessão existente encontrada:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // CORREÇÃO: Carregar perfil apenas aqui, com setTimeout para evitar conflitos
          setTimeout(() => {
            loadUserProfile(currentSession.user.id).finally(() => {
              setIsLoading(false);
              console.log('[AUTH] Loading finalizado para sessão existente');
            });
          }, 0);
        } else {
          console.log('[AUTH] Nenhuma sessão ativa encontrada');
          setIsLoading(false);
        }
        
        isInitialized.current = true;
        console.log('[AUTH] Inicialização completa');
        
      } catch (error) {
        console.error('[AUTH] Erro na inicialização:', error);
        setAuthError(error instanceof Error ? error : new Error('Erro na inicialização'));
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
